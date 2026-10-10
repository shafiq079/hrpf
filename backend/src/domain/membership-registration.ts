import { z } from 'zod';
export const paymentMethods = ['Bank transfer', 'JazzCash'] as const;
export const registrationVersion = 'hrpf-volunteer-2026-10-10';
export const interests = ['Human Rights Advocacy', 'Education Programs', 'Community Welfare', 'Women Rights', 'Child Protection', 'Fundraising', 'Social Media & Awareness', 'Administration', 'Event Management', 'Other'] as const;
export const availability = ['1 week in a month', 'Willing to Participate in Field Activities', 'Other'] as const;
export const feeChoices = ['Volunteer Registration Fee: PKR 2,000', 'Volunteer Card + Official Notification Fee: PKR 3,000', 'Total Payable Amount (if all services are requested): PKR 5,000'] as const;
export const registrationStatuses = ['pending', 'under_review', 'needs_info', 'approved', 'rejected', 'withdrawn'] as const;
export const paymentStatuses = ['unverified', 'verified', 'rejected'] as const;
const line = (max = 150) => z.string().trim().min(1).max(max);
const distinct = <T extends readonly [string, ...string[]]>(choices: T) => z.array(z.enum(choices)).min(1).max(choices.length).refine(v => new Set(v).size === v.length, 'Select distinct choices.');
const email = z.string().trim().pipe(z.email().max(254)).transform(v => v.toLowerCase());
const id = z.string().regex(/^[a-f0-9]{24}$/i);
export const registrationAnswers = z.object({
  email, name: line(), fatherName: line(), gmailId: email,
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => { const d = new Date(v); return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === v && v <= new Date().toISOString().slice(0, 10); }),
  gender: z.enum(['Male', 'Female', 'Other']), phone: line(200), address: line(1000),
  interests: distinct(interests), availability: distinct(availability), availabilityOther: z.string().trim().max(500), emergencyContact: line(300),
  fees: distinct(feeChoices), paymentMethod: line(100), importantNote: z.string().trim().max(1000), certification: z.enum(['Yes', 'No']), confirmationMessage: z.string().trim().max(1000),
}).strict().superRefine((v, ctx) => {
  if (v.availability.includes('Other') !== !!v.availabilityOther) ctx.addIssue({ code: 'custom', path: ['availabilityOther'], message: 'Provide Other details only when Other is selected.' });
});
export const registrationInput = z.object({
  answers: registrationAnswers,
  cnicImageIds: z.array(id).min(1).max(5), photoId: id, paymentProofId: id, policeCertificateIds: z.array(id).min(1).max(5),
  ticket: z.string().min(43).max(100), submissionKey: z.string().uuid(), formVersion: z.literal(registrationVersion),
}).strict().superRefine((v, ctx) => {
  const ids = [...v.cnicImageIds, v.photoId, v.paymentProofId, ...v.policeCertificateIds];
  if (new Set(ids).size !== ids.length) ctx.addIssue({ code: 'custom', path: ['cnicImageIds'], message: 'Each attachment must be distinct.' });
});
// The total option represents both services, not an additional PKR 5,000 charge.
export function registrationAmount(selected: readonly string[]) {
  return selected.includes(feeChoices[2]) ? 5000 : (selected.includes(feeChoices[0]) ? 2000 : 0) + (selected.includes(feeChoices[1]) ? 3000 : 0);
}
export const registrationReview = z.object({ version: z.number().int().min(0), status: z.enum(registrationStatuses), paymentStatus: z.enum(paymentStatuses), note: line(2000), applicantMessage: z.string().trim().max(2000).default('') }).strict();
