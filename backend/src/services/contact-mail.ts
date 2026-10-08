import { ContactMessage } from '../domain/models.js';
import { unavailable } from '../http/errors.js';
const escape = (value: string) => value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
export async function contactMail(entry: { entityType: string; entityId?: string | null; template: string; recipient: string; reference?: string | null }) {
  if (entry.entityType !== 'ContactMessage' || !['acknowledgement', 'admin-notification'].includes(entry.template)) throw unavailable();
  const row = await ContactMessage.findById(entry.entityId);
  if (!row || row.id !== entry.reference || (entry.template === 'acknowledgement' && row.email !== entry.recipient)) throw unavailable();
  const admin = entry.template === 'admin-notification', reference = `HRPF-MSG-${row.id}`;
  const fields = [['Reference', reference], ['Submitted at (UTC)', (row.get('createdAt') as Date).toISOString()], ['Full name', row.name], ['Email', row.email], ['Phone', row.phone || 'Not provided'], ['Organization', row.organization || 'Not provided'], ['Enquiry type', row.inquiryType || 'General'], ['Subject', row.subject], ['Message', row.message], ['Consent', `Accepted ${row.consent.version} at ${row.consent.acceptedAt.toISOString()}`]];
  const intro = admin ? 'A new enquiry has been received. The complete message is below; reply to the sender to follow up.' : 'HRPF has received your enquiry. A copy of your message is below.';
  const footer = 'This confirms receipt only. It does not confirm a response, review or email inbox delivery.';
  return {
    subject: `HRPF: ${admin ? 'new enquiry' : 'message received'} — ${reference}`,
    text: [intro, ...fields.map(([label, value]) => `${label}:\n${value}`), footer].join('\n\n'),
    html: `<div><h1>HRPF enquiry</h1><p>${intro}</p>${fields.map(([label, value]) => `<h2>${escape(label!)}</h2><p style="white-space:pre-wrap;overflow-wrap:anywhere">${escape(value!)}</p>`).join('')}<p>${footer}</p></div>`,
    ...(admin ? { replyTo: row.email } : {}),
  };
}
