/**
 * Simulates an async form submission for this demonstration site.
 *
 * IMPORTANT: No data is sent anywhere and nothing is persisted. Real forms
 * (contact, volunteering, reports, complaints, help requests, donations) will
 * require a secure backend integration with validation, storage, notification
 * and — for sensitive reports — strict confidentiality controls.
 */
export function simulateSubmit(delay = 1200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, delay));
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/** Generates a sample, non-authoritative reference code for confirmations. */
export function sampleReference(prefix: string): string {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${year}-${random}`;
}
