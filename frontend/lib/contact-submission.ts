export type ContactData = {
  name: string; email: string; phone: string; organization: string;
  inquiryType: string; subject: string; message: string; consent: boolean;
};
export type ContactAttempt = { ticket?: string; expiresAt?: number; payload?: string; submissionStarted: boolean };
export const newContactAttempt = (): ContactAttempt => ({ submissionStarted: false });
export class ContactRequestError extends Error {
  readonly code: string | undefined;
  readonly status: number | undefined;
  constructor(message: string, code?: string, status?: number) { super(message); this.code = code; this.status = status; }
}
export async function submitContact(data: ContactData, attempt: ContactAttempt, botToken: string, request: typeof fetch = fetch) {
  async function json(path: string, body: string) {
    let response: Response;
    try {
      response = await request(path, { method: "POST", headers: { "Content-Type": "application/json" }, body,
        credentials: "omit", cache: "no-store", signal: AbortSignal.timeout(30000) });
    } catch {
      throw new ContactRequestError("The connection was interrupted. Retry this same message to confirm receipt.");
    }
    const result = await response.json().catch(() => null);
    if (!response.ok) throw new ContactRequestError(result?.error?.message || "The message could not be confirmed. Please try again.", result?.error?.code, response.status);
    if (!result?.data) throw new ContactRequestError("The response could not be confirmed. Retry this same message.");
    return result.data;
  }
  if (!attempt.ticket || (!attempt.submissionStarted && Date.now() >= (attempt.expiresAt ?? 0))) {
    if (!botToken) throw new ContactRequestError("Complete the security verification before submitting.");
    const session = await json("/api/forms/session", JSON.stringify({ purpose: "contact", botToken }));
    if (typeof session.ticket !== "string" || !Number.isFinite(session.expiresIn) || session.expiresIn <= 0)
      throw new ContactRequestError("Security verification could not be confirmed. Please try again.");
    attempt.ticket = session.ticket;
    attempt.expiresAt = Date.now() + session.expiresIn * 1000;
    attempt.payload = undefined;
  }
  if (!attempt.payload) attempt.payload = JSON.stringify({
    name: data.name.trim(), email: data.email.trim().toLowerCase(),
    ...(data.phone.trim() ? { phone: data.phone.trim() } : {}),
    ...(data.organization.trim() ? { organization: data.organization.trim() } : {}),
    inquiryType: data.inquiryType || "General", subject: data.subject.trim(), message: data.message.trim(),
    consent: data.consent, consentVersion: "contact-v1", ticket: attempt.ticket, submissionKey: crypto.randomUUID(),
  });
  attempt.submissionStarted = true;
  const receipt = await json("/api/contact-messages", attempt.payload);
  if (receipt.status !== "received" || typeof receipt.reference !== "string" || !/^HRPF-MSG-[a-f0-9]{24}$/.test(receipt.reference))
    throw new ContactRequestError("The response could not be confirmed. Retry this same message.");
  return receipt as { status: "received"; reference: string };
}
