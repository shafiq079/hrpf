import { z } from 'zod';
const line = (max = 150) => z.string().trim().min(1).max(max);
const id = z.string().regex(/^[a-f0-9]{24}$/i);
export const personal = {
  name: line(), fatherName: line(), email: z.email().max(254).transform(v => v.trim().toLowerCase()),
  phone: z.string().trim().regex(/^\+?[0-9 ()-]{7,30}$/), province: line(100), district: line(100), address: line(1000),
};
export const submission = {
  ticket: z.string().min(43).max(100), submissionKey: z.string().uuid(), consent: z.literal(true), consentVersion: line(50),
};
export const complaintInput = z.object({
  ...personal, ...submission, cnic: z.string().regex(/^(?:\d{13}|\d{5}-\d{7}-\d)$/).transform(v => v.replaceAll('-', '')),
  cnicImageId: id, complaintDocumentId: id, category: line(150), description: line(10000),
  priorProceedings: z.boolean(), priorProceedingsDetails: z.string().trim().max(5000).optional(),
  decisionDocumentIds: z.array(id).max(3).default([]), attachmentIds: z.array(id).max(3).default([]),
}).strict().superRefine((value, ctx) => {
  if (value.priorProceedings && !value.priorProceedingsDetails) ctx.addIssue({ code: 'custom', path: ['priorProceedingsDetails'], message: 'Previous proceedings details are required.' });
  if (!value.priorProceedings && (value.priorProceedingsDetails || value.decisionDocumentIds.length)) ctx.addIssue({ code: 'custom', path: ['priorProceedings'], message: 'Previous proceedings must be selected when providing their details or decision documents.' });
  const ids = [value.cnicImageId, value.complaintDocumentId, ...value.decisionDocumentIds, ...value.attachmentIds];
  if (ids.length > 5 || new Set(ids).size !== ids.length) ctx.addIssue({ code: 'custom', path: ['attachmentIds'], message: 'At most five distinct files are allowed.' });
});
export const membershipInput = z.object({ ...personal, ...submission, membershipType: line(100), paymentReference: line(200), paymentProofId: id }).strict();
export const contactInput = z.object({ ...submission, name: line(), email: personal.email, phone: personal.phone.optional(), organization: z.string().trim().max(150).optional(), inquiryType: z.enum(['General', 'Partnership', 'Feedback', 'Media', 'Membership', 'Donation', 'Technical']).default('General'), subject: line(200), message: line(5000) }).strict();
export const uploadQuery = z.object({ purpose: z.enum(['complaint', 'membership']) }).strict();
export const adminUploadQuery = z.object({ purpose: z.enum(['content', 'certificate']) }).strict();
export const objectId = id;
