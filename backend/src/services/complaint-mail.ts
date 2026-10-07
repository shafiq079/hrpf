import { Asset, Complaint } from '../domain/models.js';
import type { Environment } from '../config/env.js';
import { decrypt, digest } from '../security/crypto.js';
import { unavailable } from '../http/errors.js';
import { COMPLAINT_MAX_BYTES, safeFilename, type UploadProvider } from './uploads.js';

export type ComplaintAttachment = { filename: string; content: Buffer; contentType: string; contentDisposition: 'attachment' };
export function complaintFiles(row: any) {
  return [
    { label: 'CNIC proof', file: row.cnicImage },
    { label: 'Complaint document', file: row.complaintDocument },
    ...(row.decisionDocuments ?? []).map((file: any, index: number) => ({ label: `Previous decision ${index + 1}`, file })),
    ...(row.attachments ?? []).map((file: any, index: number) => ({ label: `Supporting evidence ${index + 1}`, file })),
  ];
}
const escape = (value: string) => value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
export function complaintFields(row: any, cnic: string) {
  return [
    ['Reference', row.trackingId], ['Submitted at (UTC)', row.createdAt.toISOString()],
    ['Full name', row.name], ["Father's name", row.fatherName], ['CNIC number', cnic],
    ['Email', row.email], ['Phone', row.phone], ['Province', row.province], ['District', row.district], ['Address', row.address],
    ['Complaint category', row.category], ['Complaint details', row.description],
    ['Previously handled by another institution', row.priorProceedings ? 'Yes' : 'No'],
    ['Previous proceedings details', row.priorProceedingsDetails || 'Not applicable'],
    ['Consent', `Accepted ${row.consent.version} at ${row.consent.acceptedAt.toISOString()}`],
    ...complaintFiles(row).map(({ label, file }) => [label, file.originalName || `${label}.${file.format}`]),
  ] as string[][];
}
// Reads are bounded, hash checked and restricted to the exact submitted assets.
// Neither provider links nor identity data enter BullMQ jobs or outbox payloads.
export async function complaintMail(env: Environment, provider: UploadProvider, entry: any) {
  if (!env.DATA_ENCRYPTION_KEY || entry.entityType !== 'Complaint') throw unavailable();
  const row = await Complaint.findById(entry.entityId).select('+encryptedCNIC');
  if (!row || row.trackingId !== entry.reference || (entry.template === 'complaint-copy' && row.email !== entry.recipient)) throw unavailable();
  const files = complaintFiles(row);
  if (files.length > 5 || files.reduce((sum, { file }) => sum + file.bytes, 0) > COMPLAINT_MAX_BYTES) throw unavailable();
  const attachments: ComplaintAttachment[] = [];
  for (const { label, file } of files) {
    const asset = await Asset.findOne({ _id: file.assetId, purpose: 'complaint', entityType: 'complaint', entityId: row._id, claimStatus: 'claimed', visibility: 'restricted', deliveryType: 'authenticated', scanStatus: 'clean' });
    if (!asset || asset.publicId !== file.publicId || asset.sha256 !== file.sha256 || asset.bytes !== file.bytes || asset.format !== file.format || asset.resourceType !== file.resourceType || !['jpg', 'jpeg', 'png', 'webp', 'pdf'].includes(asset.format)) throw unavailable();
    const response = await provider.read(asset);
    if (!response.ok || !response.body) throw unavailable();
    const reader = response.body.getReader(), chunks: Buffer[] = [];
    let count = 0;
    const deadline = setTimeout(() => { void reader.cancel(); }, 20000);
    try {
      for (;;) {
        const result = await reader.read();
        if (result.done) break;
        count += result.value.byteLength;
        if (count > file.bytes) throw unavailable();
        chunks.push(Buffer.from(result.value));
      }
    } finally { clearTimeout(deadline); await reader.cancel().catch(() => {}); }
    const content = Buffer.concat(chunks);
    if (count !== file.bytes || digest(content) !== file.sha256) throw unavailable();
    attachments.push({ filename: safeFilename(`${label}-${file.originalName || `document.${file.format}`}`), content, contentType: file.format === 'pdf' ? 'application/pdf' : `image/${['jpg', 'jpeg'].includes(file.format) ? 'jpeg' : file.format}`, contentDisposition: 'attachment' });
  }
  const fields = complaintFields(row, decrypt(row.encryptedCNIC, env.DATA_ENCRYPTION_KEY, `complaint:${row.id}`));
  const intro = entry.template === 'complaint-admin-copy'
    ? 'A complaint has been received for review. This is the complete submitted form, with all uploaded files attached.'
    : 'HRPF has received your complaint. This is a copy of your complete submitted form, with all uploaded files attached.';
  const footer = 'This confirms receipt only. Review is pending; submission does not guarantee investigation, representation or a specific outcome.';
  const text = [intro, '', ...fields.map(([label, value]) => `${label}:\n${value}`), '', footer].join('\n\n');
  const html = `<div style="font-family:Arial,sans-serif;max-width:720px;color:#182b49"><h1 style="font-size:24px">HRPF complaint submission</h1><p>${intro}</p><table style="border-collapse:collapse;width:100%">${fields.map(([label, value]) => `<tr><th style="padding:12px;border:1px solid #ddd;text-align:left;vertical-align:top">${escape(label!)}</th><td style="padding:12px;border:1px solid #ddd;white-space:pre-wrap;overflow-wrap:anywhere">${escape(value!)}</td></tr>`).join('')}</table><p>${footer}</p></div>`;
  return { subject: `HRPF: ${entry.template === 'complaint-admin-copy' ? 'new complaint' : 'complaint received'} — ${row.trackingId}`, text, html, attachments };
}
