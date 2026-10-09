import type { ContactAttempt } from "./contact-submission";
export class NewsletterRequestError extends Error {
  readonly code: string | undefined;
  readonly status: number | undefined;
  constructor(message: string, code?: string, status?: number) { super(message); this.code = code; this.status = status; }
}
export async function submitNewsletter(email: string, consent: boolean, attempt: ContactAttempt, botToken: string, request: typeof fetch = fetch) {
  async function json(path: string, body: string) {
    let response: Response;
    try { response = await request(path, { method: "POST", headers: { "Content-Type": "application/json" }, body, credentials: "omit", cache: "no-store", signal: AbortSignal.timeout(30000) }); }
    catch { throw new NewsletterRequestError("The connection was interrupted. Retry to confirm this subscription request."); }
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.data) throw new NewsletterRequestError(result?.error?.message || "The subscription request could not be confirmed.", result?.error?.code, response.status);
    return result.data;
  }
  if (!attempt.ticket || (!attempt.submissionStarted && Date.now() >= (attempt.expiresAt ?? 0))) {
    if (!botToken) throw new NewsletterRequestError("Complete the security verification before subscribing.");
    const session = await json("/api/forms/session", JSON.stringify({ purpose: "newsletter", botToken }));
    if (typeof session.ticket !== "string" || !Number.isFinite(session.expiresIn) || session.expiresIn <= 0) throw new NewsletterRequestError("Security verification could not be confirmed.");
    attempt.ticket = session.ticket; attempt.expiresAt = Date.now() + session.expiresIn * 1000; attempt.payload = undefined;
  }
  if (!attempt.payload) attempt.payload = JSON.stringify({ email: email.trim().toLowerCase(), consent, consentVersion: "newsletter-v1", ticket: attempt.ticket, submissionKey: crypto.randomUUID() });
  attempt.submissionStarted = true;
  const result = await json("/api/newsletter/subscriptions", attempt.payload);
  if (result.status !== "accepted") throw new NewsletterRequestError("The subscription request could not be confirmed. Retry the same request.");
  return result;
}
