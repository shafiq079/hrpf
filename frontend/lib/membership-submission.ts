import {
  formVersion,
  validateApplication,
  type Answers,
  type Files,
} from "./membership-registration.ts";
export type MembershipAttempt = {
  ticket?: string;
  expiresAt?: number;
  key?: string;
  uploads: Map<File, string>;
  uploadKeys: Map<File, string>;
  payload?: string;
  submissionStarted: boolean;
};
export class MembershipRequestError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.code = code;
  }
}
export const newMembershipAttempt = (): MembershipAttempt => ({
  uploads: new Map(),
  uploadKeys: new Map(),
  submissionStarted: false,
});
export async function submitMembership(
  data: Answers,
  files: Files,
  attempt: MembershipAttempt,
  botToken: string,
  progress: (message: string) => void,
  request: typeof fetch = fetch,
) {
  async function json(path: string, options: RequestInit) {
    let response: Response;
    try {
      response = await request(path, {
        ...options,
        credentials: "omit",
        cache: "no-store",
        signal: AbortSignal.timeout(90000),
      });
    } catch {
      throw new MembershipRequestError(
        "The connection was interrupted. Retry this same submission; do not open a new form.",
      );
    }
    const body = await response.json().catch(() => null);
    if (!response.ok)
      throw new MembershipRequestError(
        body?.error?.message ||
          "The service is temporarily unavailable. Retry this submission.",
        body?.error?.code,
      );
    if (!body?.data)
      throw new MembershipRequestError(
        "The response could not be confirmed. Retry this same submission.",
      );
    return body.data;
  }
  if (
    !attempt.ticket ||
    (!attempt.submissionStarted && Date.now() >= (attempt.expiresAt ?? 0))
  ) {
    if (!botToken)
      throw new MembershipRequestError(
        "Complete the security verification before submitting.",
      );
    progress("Starting your secure submission…");
    const session = await json("/api/forms/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ purpose: "membership_registration", botToken }),
    });
    if (
      typeof session.ticket !== "string" ||
      session.ticket.length < 43 ||
      session.expiresIn !== 900
    )
      throw new MembershipRequestError(
        "The form session could not be confirmed. Complete verification and retry.",
      );
    attempt.ticket = session.ticket;
    attempt.expiresAt = Date.now() + session.expiresIn * 1000;
    attempt.key = crypto.randomUUID();
    attempt.uploads.clear();
    attempt.uploadKeys.clear();
    attempt.payload = undefined;
  }
  if (!attempt.payload) {
    const issue = Object.values(
      validateApplication(data, files, ["Bank transfer", "JazzCash"]),
    )[0];
    if (issue) throw new MembershipRequestError(issue);
    const all = [
      ...files.cnic,
      ...files.photo,
      ...files.payment,
      ...files.police,
    ];
    for (let index = 0; index < all.length; index++) {
      const file = all[index]!;
      if (attempt.uploads.has(file)) continue;
      progress(`Checking and uploading file ${index + 1} of ${all.length}…`);
      const form = new FormData();
      form.set("file", file);
      if (!attempt.uploadKeys.has(file))
        attempt.uploadKeys.set(file, crypto.randomUUID());
      const result = await json(
        "/api/form-uploads?purpose=membership_registration",
        {
          method: "POST",
          headers: {
            "X-Form-Ticket": attempt.ticket!,
            "X-Upload-Key": attempt.uploadKeys.get(file)!,
          },
          body: form,
        },
      );
      if (
        typeof result.assetId !== "string" ||
        !/^[a-f0-9]{24}$/i.test(result.assetId)
      )
        throw new MembershipRequestError(
          "The upload could not be confirmed. Retry this submission.",
        );
      attempt.uploads.set(file, result.assetId);
    }
    attempt.payload = JSON.stringify({
      answers: data,
      formVersion,
      ticket: attempt.ticket,
      submissionKey: attempt.key,
      cnicImageIds: files.cnic.map((f) => attempt.uploads.get(f)),
      photoId: attempt.uploads.get(files.photo[0]),
      paymentProofId: attempt.uploads.get(files.payment[0]),
      policeCertificateIds: files.police.map((f) => attempt.uploads.get(f)),
    });
  }
  progress("Saving your application and queuing confirmation emails…");
  attempt.submissionStarted = true;
  const receipt = await json("/api/membership-registrations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: attempt.payload,
  });
  if (
    receipt.status !== "received" ||
    typeof receipt.reference !== "string" ||
    !receipt.reference.startsWith("HRPF-VR-")
  )
    throw new MembershipRequestError(
      "The receipt could not be confirmed. Retry this same submission.",
    );
  return receipt;
}
