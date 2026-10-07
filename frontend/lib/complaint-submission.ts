export type ComplaintData = {
  name: string;
  fatherName: string;
  cnic: string;
  email: string;
  phone: string;
  province: string;
  district: string;
  address: string;
  category: string;
  description: string;
  priorProceedings: boolean;
  priorProceedingsDetails: string;
  consent: boolean;
};
export type ComplaintFiles = {
  cnicImage: File | null;
  complaintDocument: File | null;
  decisions: File[];
  evidence: File[];
};
export type ComplaintAttempt = {
  ticket?: string;
  expiresAt?: number;
  key?: string;
  uploads: Map<File, string>;
  uploadKeys: Map<File, string>;
  payload?: string;
  submissionStarted: boolean;
};
export class ComplaintRequestError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.code = code;
  }
}
export const newComplaintAttempt = (): ComplaintAttempt => ({
  uploads: new Map(),
  uploadKeys: new Map(),
  submissionStarted: false,
});
export function validateComplaintFiles(files: ComplaintFiles): string {
  const all = [
    files.cnicImage,
    files.complaintDocument,
    ...files.decisions,
    ...files.evidence,
  ].filter((value): value is File => !!value);
  if (!files.cnicImage || !files.complaintDocument)
    return "Attach a CNIC image and your complaint document.";
  if (all.length > 5 || files.decisions.length > 3 || files.evidence.length > 3)
    return "Choose at most five files in total, with up to three in each optional group.";
  if (files.cnicImage.type === "application/pdf")
    return "The CNIC proof must be a JPG, PNG or WebP image.";
  for (const file of all) {
    if (
      !["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(
        file.type,
      ) ||
      !/\.(jpe?g|png|webp|pdf)$/i.test(file.name)
    )
      return "Use JPG, PNG, WebP or PDF files.";
    if (
      !file.size ||
      file.size > (file.type === "application/pdf" ? 10 : 5) * 1024 * 1024
    )
      return "Each image must be at most 5 MB and each PDF at most 10 MB.";
  }
  if (all.reduce((sum, file) => sum + file.size, 0) > 15 * 1024 * 1024)
    return "All files together must be at most 15 MB.";
  return "";
}
export async function submitComplaint(
  data: ComplaintData,
  files: ComplaintFiles,
  attempt: ComplaintAttempt,
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
      throw new ComplaintRequestError(
        "The connection was interrupted. Retry this same submission; do not open a new form.",
      );
    }
    const body = await response.json().catch(() => null);
    if (!response.ok)
      throw new ComplaintRequestError(
        body?.error?.message ||
          "The service is temporarily unavailable. Retry this submission.",
        body?.error?.code,
      );
    if (!body?.data)
      throw new ComplaintRequestError(
        "The response could not be confirmed. Retry this same submission.",
      );
    return body.data;
  }
  if (
    !attempt.ticket ||
    (!attempt.submissionStarted && Date.now() >= (attempt.expiresAt ?? 0))
  ) {
    if (!botToken)
      throw new ComplaintRequestError(
        "Complete the security verification before submitting.",
      );
    progress("Starting your secure submission…");
    const session = await json("/api/forms/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ purpose: "complaint", botToken }),
    });
    attempt.ticket = session.ticket;
    attempt.expiresAt = Date.now() + session.expiresIn * 1000;
    attempt.key = crypto.randomUUID();
    attempt.uploads.clear();
    attempt.uploadKeys.clear();
    attempt.payload = undefined;
  }
  if (!attempt.payload) {
    const issue = validateComplaintFiles(files);
    if (issue) throw new ComplaintRequestError(issue);
    const all = [
      files.cnicImage!,
      files.complaintDocument!,
      ...files.decisions,
      ...files.evidence,
    ];
    for (let index = 0; index < all.length; index++) {
      const file = all[index]!;
      if (attempt.uploads.has(file)) continue;
      progress(`Checking and uploading file ${index + 1} of ${all.length}…`);
      const form = new FormData();
      form.set("file", file);
      if (!attempt.uploadKeys.has(file))
        attempt.uploadKeys.set(file, crypto.randomUUID());
      const result = await json("/api/form-uploads?purpose=complaint", {
        method: "POST",
        headers: {
          "X-Form-Ticket": attempt.ticket!,
          "X-Upload-Key": attempt.uploadKeys.get(file)!,
        },
        body: form,
      });
      attempt.uploads.set(file, result.assetId);
    }
    attempt.payload = JSON.stringify({
      ...data,
      email: data.email.trim().toLowerCase(),
      cnic: data.cnic.trim().replaceAll("-", ""),
      consentVersion: "complaint-v1",
      ticket: attempt.ticket,
      submissionKey: attempt.key,
      cnicImageId: attempt.uploads.get(files.cnicImage!),
      complaintDocumentId: attempt.uploads.get(files.complaintDocument!),
      decisionDocumentIds: files.decisions.map((f) => attempt.uploads.get(f)),
      attachmentIds: files.evidence.map((f) => attempt.uploads.get(f)),
      priorProceedingsDetails: data.priorProceedings
        ? data.priorProceedingsDetails
        : undefined,
    });
  }
  progress("Saving your complaint and queuing both email copies…");
  attempt.submissionStarted = true;
  return await json("/api/complaints", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: attempt.payload,
  });
}
