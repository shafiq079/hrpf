export const formVersion = "hrpf-volunteer-2026-10-10";
export const interests = [
  "Human Rights Advocacy",
  "Education Programs",
  "Community Welfare",
  "Women Rights",
  "Child Protection",
  "Fundraising",
  "Social Media & Awareness",
  "Administration",
  "Event Management",
  "Other",
];
export const availability = [
  "1 week in a month",
  "Willing to Participate in Field Activities",
  "Other",
];
export const feeChoices = [
  "Volunteer Registration Fee: PKR 2,000",
  "Volunteer Card + Official Notification Fee: PKR 3,000",
  "Total Payable Amount (if all services are requested): PKR 5,000",
];
export const importantNote =
  "Applications will only be processed after verification of the submitted payment. HRPF reserves the right to approve or reject any application according to organizational policies.";
export const confirmationMessage =
  "Thank you for registering with Human Rights Protection Foundation (HRPF). Our team will review your application and contact you soon.";
export const declaration =
  "I certify that the information provided is true and correct and I agree to follow HRPF policies and code of conduct.";
export type Answers = {
  email: string;
  name: string;
  fatherName: string;
  gmailId: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  address: string;
  interests: string[];
  availability: string[];
  availabilityOther: string;
  emergencyContact: string;
  fees: string[];
  paymentMethod: string;
  importantNote: string;
  certification: string;
  confirmationMessage: string;
};
export const emptyAnswers = (): Answers => ({
  email: "",
  name: "",
  fatherName: "",
  gmailId: "",
  dateOfBirth: "",
  gender: "",
  phone: "",
  address: "",
  interests: [],
  availability: [],
  availabilityOther: "",
  emergencyContact: "",
  fees: [],
  paymentMethod: "",
  importantNote: "",
  certification: "",
  confirmationMessage: "",
});
export type Files = {
  cnic: File[];
  photo: File[];
  payment: File[];
  police: File[];
};
export const fileLabels = {
  cnic: "CNIC no and Picture front and back side",
  photo: "Recent Photograph (File Upload)",
  payment: "Attached screenshot after payment",
  police: "Police verification Character certificate",
};
export const answerLabels: Record<keyof Answers, string> = {
  email: "Email",
  name: "Full Name (which register in Nadra Office)",
  fatherName: "Father Name",
  gmailId: "Gmail Id",
  dateOfBirth: "Date of Birth",
  gender: "Gender",
  phone: "Mobile Number and WhatsApp Number",
  address: "Complete Residential Address , city and District",
  interests: "VOLUNTEER INTERESTS",
  availability: "AVAILABILITY (Checkboxes)",
  availabilityOther: "Other availability",
  emergencyContact: "Emergency Contact Name and number",
  fees: "REGISTRATION & DOCUMENTATION FEES",
  paymentMethod: "Payment Method",
  importantNote: "IMPORTANT NOTE:",
  certification: declaration,
  confirmationMessage: "Confirmation Message:",
};
export function amountPKR(fees: string[]) {
  return fees.includes(feeChoices[2])
    ? 5000
    : (fees.includes(feeChoices[0]) ? 2000 : 0) +
        (fees.includes(feeChoices[1]) ? 3000 : 0);
}
const imagePattern = /\.(jpe?g|png|webp|gif|bmp|tiff?)$/i;
export function validateApplication(
  answers: Answers,
  files: Files,
  paymentMethods: string[],
) {
  const errors: Record<string, string> = {};
  for (const key of [
    "email",
    "name",
    "fatherName",
    "gmailId",
    "dateOfBirth",
    "gender",
    "phone",
    "address",
    "emergencyContact",
    "paymentMethod",
    "certification",
  ] as const)
    if (!answers[key].trim()) errors[key] = "This field is required.";
  for (const key of ["email", "gmailId"] as const)
    if (answers[key] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answers[key].trim()))
      errors[key] = "Enter a valid email address.";
  const d = new Date(answers.dateOfBirth);
  if (
    answers.dateOfBirth &&
    (!Number.isFinite(d.getTime()) ||
      d.toISOString().slice(0, 10) !== answers.dateOfBirth ||
      answers.dateOfBirth > new Date().toISOString().slice(0, 10))
  )
    errors.dateOfBirth =
      "Enter a valid date of birth that is not in the future.";
  for (const key of ["interests", "availability", "fees"] as const)
    if (!answers[key].length) errors[key] = "Choose at least one option.";
  if (
    answers.availability.includes("Other") &&
    !answers.availabilityOther.trim()
  )
    errors.availabilityOther = "Describe your other availability.";
  if (answers.paymentMethod && !paymentMethods.includes(answers.paymentMethod))
    errors.paymentMethod = "Choose an available payment method.";
  for (const key of Object.keys(files) as (keyof Files)[]) {
    const limit = key === "cnic" || key === "police" ? 5 : 1;
    if (!files[key].length || files[key].length > limit)
      errors[key] = `Choose ${limit === 1 ? "one file" : "one to five files"}.`;
    for (const file of files[key]) {
      if (!file.size || file.size > 10 * 1024 * 1024)
        errors[key] = "Each file must be non-empty and no larger than 10 MB.";
      if (
        !(
          key === "police"
            ? /\.(jpe?g|png|webp|gif|bmp|tiff?|pdf|docx?|odt)$/i
            : imagePattern
        ).test(file.name)
      )
        errors[key] =
          key === "police"
            ? "Use an image, PDF, Word document or ODT document."
            : "Use a JPG, PNG, WebP, GIF, BMP or TIFF image.";
    }
  }
  return errors;
}
