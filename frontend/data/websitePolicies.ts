export type WebsitePolicy = {
  title: string; eyebrow: string; description: string; introduction: string;
  sections: { id: string; title: string; paragraphs: string[]; links?: { label: string; href: string }[] }[];
};

const contactLinks = [
  { label: "Email HRPF: hrpf786@gmail.com", href: "mailto:hrpf786@gmail.com" },
  { label: "Additional email: info@hrpf.org", href: "mailto:info@hrpf.org" },
];

export const privacyPolicy: WebsitePolicy = {
  title: "Privacy Policy", eyebrow: "YOUR INFORMATION",
  description: "How HRPF handles website information, complaint details, uploaded documents and optional third-party services.",
  introduction: "Human Rights Protection Foundation Pakistan (HRPF) operates this website. This notice explains the information handled through its current features, how it is used and how to contact the Foundation about it.",
  sections: [
    { id: "complaint-information", title: "Information in a complaint", paragraphs: [
      "File a Complaint collects your name, father's name, CNIC number and picture, email, phone number, province or region, district and address. It also collects the complaint category, description, written complaint, previous proceedings and any decision documents or supporting evidence you attach.",
      "The form shows your details and files for review before you submit. It records your consent and submission time. Provide relevant information and check your email address carefully, because the submitted material includes sensitive identity and case information.",
    ], links: [{ label: "File a Complaint", href: "/file-a-complaint" }] },
    { id: "use-and-access", title: "How information is used and accessed", paragraphs: [
      "Complaint information is used to record the concern, support authorised case review, communicate about it and maintain its status and history. Authorised HRPF administrators and case reviewers can access the information and private files needed for their work.",
      "If handling a concern requires information to be shared with an authority or another organisation, that needs to be considered for the particular case. Submitting a complaint does not make its documents public or automatically publish your account on this website.",
    ] },
    { id: "email-copies", title: "Complete copies sent by email", paragraphs: [
      "With the consent given on the complaint form, a complete copy of your submitted details and every uploaded file is sent to your entered email address and HRPF's designated administrator recipients. These emails contain sensitive identity information, including the CNIC details you provide.",
      "Email providers and anyone with access to a recipient's mailbox may be able to access those copies. A saved complaint and an email queued for sending do not guarantee inbox delivery. Deleting a website record does not delete copies already delivered by email.",
    ] },
    { id: "providers", title: "Service providers", paragraphs: [
      "The website relies on hosting and database services, Cloudinary for file storage, Cloudflare Turnstile for form verification, and the configured email service for delivery. These providers process the information needed to perform their role. Email delivery may use Resend or the configured mail provider.",
      "Provider arrangements and processing locations depend on the service configuration. A provider's own privacy notice also applies to its handling of information. HRPF's public documents, photographs and project records are separate from private complaint evidence.",
    ] },
    { id: "translation", title: "Optional website translation", paragraphs: [
      "The Translate control uses GTranslate to translate public website text. The service loads when you open the control or return with a saved language choice. Public page text is processed by the translation service, and the language preference is stored in your browser.",
      "Private form values, complaint review details, uploaded filenames and administration content are excluded from automatic text translation. Images and downloadable documents are not translated. Selecting English clears the saved preference and restores the original website text.",
    ] },
    { id: "external-and-unconnected-forms", title: "Membership and other forms", paragraphs: [
      "Membership applications open in Google Forms. Information entered there is submitted through that service and may be accessible to HRPF as the form owner. Review the notice and permissions shown by Google before submitting.",
      "The Contact form collects your name, email, optional phone and organization, enquiry type, subject, message and consent. It stores the enquiry for follow-up and queues complete message copies to your email address and designated HRPF administrators. The receipt confirms storage, not inbox delivery or a response. General enquiries have no automatic deletion period in this service. Use File a Complaint for a rights concern with documents.",
      "The feedback-about-HRPF form and newsletter box do not transmit entries or create a subscription. Their on-screen confirmations are not delivery receipts. Information sent directly by email is handled by recipients and email providers. Avoid sending unnecessary identity documents in an initial general enquiry.",
    ], links: contactLinks },
    { id: "cookies-and-browser-storage", title: "Cookies and browser storage", paragraphs: [
      "Signed-in administration uses session and security cookies. Optional translation stores the selected language in browser storage. Complaint details and upload-session information are held in memory while you complete the form; the form does not save them as a browser-storage draft.",
      "You can manage cookies and site storage in your browser. Clearing or blocking them may affect sign-in or saved language preferences. Verification services, embedded media and external websites may use their own cookies or similar technologies when you use them.",
    ] },
    { id: "retention", title: "Keeping information", paragraphs: [
      "Submitted complaints and their attached evidence do not have a fixed automatic deletion period in this service. Records may remain available for case handling and the Foundation's legal or operational responsibilities. Unfinished temporary uploads expire and are scheduled for cleanup.",
      "You can ask HRPF to review information it holds about you, including a request to correct it or remove it where appropriate. Retention in recipient mailboxes, provider systems and backups may differ from retention of the website record.",
    ] },
    { id: "security", title: "Security and technical information", paragraphs: [
      "Private complaint files require authorised access, and the CNIC number is encrypted in the complaint database. Security checks, access controls and upload validation help protect the service. These measures do not make information completely risk-free, particularly once a copy has been emailed.",
      "Hosting, verification and security services may process technical information such as connection and request details to operate the website, diagnose failures and reduce abuse.",
    ] },
    { id: "privacy-requests", title: "Privacy questions and requests", paragraphs: [
      "Contact HRPF if you want to ask about your information, correct a mistake or request a review of retention or sharing. Include a complaint reference if you have one. Do not attach a new CNIC copy to an initial privacy enquiry unless it is needed and requested through an appropriate channel.",
      "The response depends on the information involved, the Foundation's responsibilities and the requirements that apply to the request. This notice may be updated when website features or information handling change.",
    ], links: contactLinks },
  ],
};

export const termsOfUse: WebsitePolicy = {
  title: "Terms of Use", eyebrow: "WEBSITE USE",
  description: "Guidance for using HRPF's website, submitting concerns and accessing published materials and external services.",
  introduction: "These terms explain the intended use of Human Rights Protection Foundation Pakistan's website. Please use it responsibly and read the Privacy Policy before providing personal information.",
  sections: [
    { id: "responsible-use", title: "Responsible use", paragraphs: ["Use the website lawfully and respectfully. Do not attempt to access someone else's account, private complaint or file, disrupt the service, impersonate another person or upload harmful material. Provide information you believe to be accurate and explain any uncertainty."] },
    { id: "information-and-support", title: "Information and support", paragraphs: ["Public pages, projects, blogs and reports provide information about HRPF's work. They are not personal legal, medical or emergency advice. Published accounts may describe historical conditions and do not establish that those conditions remain the same today.", "Contacting HRPF or submitting a complaint does not appoint a lawyer, create a lawyer-client relationship or guarantee assistance, representation or a particular outcome. Any further support depends on the concern and the Foundation's available capacity."] },
    { id: "submissions", title: "Complaint submissions", paragraphs: ["The File a Complaint form is the connected intake route. Review your details, email address and attachments before giving consent. The complete submission and every uploaded file are emailed to you and designated HRPF administrators as described in the Privacy Policy.", "A receipt confirms that the complaint was saved. It does not confirm that an email reached an inbox, that the case has been reviewed or that a resolution has been reached. Do not use the website as an emergency reporting service."], links: [{ label: "File a Complaint", href: "/file-a-complaint" }, { label: "Read the Privacy Policy", href: "/privacy-policy" }] },
    { id: "other-services", title: "Other forms and external services", paragraphs: ["Membership applications open in Google Forms. External forms, videos, social platforms and other linked services have their own terms and privacy practices. HRPF does not control those services.", "The Contact form records general enquiries and queues email copies for the sender and designated HRPF administrators. Its reference confirms receipt, not email delivery or a response. The feedback-about-HRPF form and newsletter box remain unconnected; their on-screen confirmations are not proof of delivery or subscription."], links: contactLinks },
    { id: "translation", title: "Automatic translation", paragraphs: ["Automatic translations are provided for convenience. They may contain errors or change the meaning of important information. English is the original website text. Select English and ask HRPF for clarification if a translated instruction, policy or consent statement is unclear. Images and downloaded documents are not automatically translated."] },
    { id: "materials", title: "Using published materials", paragraphs: ["You may link to HRPF's public pages and quote short extracts with clear attribution. Do not present modified content as an official HRPF statement or suggest an endorsement that has not been given.", "Photographs, newspaper cuttings and other third-party material may have separate rights. Public availability does not give unrestricted permission to reuse them. Contact HRPF before reproducing materials or using its name or logo to represent an affiliation."] },
    { id: "availability", title: "Availability and changes", paragraphs: ["The website and its external services may be interrupted or unavailable. HRPF may correct or update public information and these terms as features change. The date at the top identifies the latest update to this page. Nothing here removes protections that cannot lawfully be excluded."] },
    { id: "questions", title: "Questions about website use", paragraphs: ["Contact the Foundation if you need clarification about these terms or permission to use published material. For a sensitive case concern, read the complaint and privacy guidance before sharing documents."], links: contactLinks },
  ],
};

export const accessibilityStatement: WebsitePolicy = {
  title: "Accessibility Statement", eyebrow: "ACCESSIBILITY",
  description: "Accessibility features, known limitations and ways to report a barrier or request help using HRPF's website.",
  introduction: "HRPF aims to make this website usable for people with different access needs. This statement describes the current approach and known limitations. It is not a claim that every page or document fully meets an accessibility standard.",
  sections: [
    { id: "our-aim", title: "Our aim", paragraphs: ["WCAG 2.2 Level AA is our design and improvement target. A complete independent accessibility assessment has not been carried out, so we do not claim full conformance or certification."] },
    { id: "navigation-and-reading", title: "Navigation and reading", paragraphs: ["Pages use headings, labelled controls, image descriptions and visible keyboard focus. A skip link lets keyboard users move to the main content. Public menus, FAQs and media controls are designed for keyboard use.", "You can use your browser's zoom and text-size controls. Page layouts adapt to smaller screens. Accessibility checks on individual features help identify problems, but do not establish full accessibility across the website."] },
    { id: "language", title: "Language and translation", paragraphs: ["The floating Translate control offers automatic translation of public text, including right-to-left display for supported languages. It can be opened and dismissed using a keyboard. Select English to restore the original text.", "Automatic translation may be inaccurate. Private form values, images and downloadable documents are not translated. Contact HRPF if an instruction is unclear or you need help understanding material."] },
    { id: "known-limitations", title: "Known limitations", paragraphs: ["Historical photographs, newspaper cuttings and some scanned documents contain text that may not be available to a screen reader. An image description does not reproduce all the text in a scan.", "Captions and transcripts are not available for every externally hosted video. External forms, video players and the complaint verification service may introduce additional accessibility barriers outside the page's own controls."] },
    { id: "getting-help", title: "Getting help", paragraphs: ["If a form, document or control prevents you from using the site, email HRPF. Identify the page and describe the difficulty or the format you need. The Foundation can consider an alternative way to discuss the information; availability depends on the material and the assistance required.", "You can also use the Contact form for a general enquiry. If security verification or another control prevents submission, use the email addresses below."], links: contactLinks },
    { id: "report-a-barrier", title: "Report an accessibility barrier", paragraphs: ["Include the page address, what you were trying to do, and what happened. If useful, describe your browser, device or assistive technology. Do not include CNIC details or private case documents in an accessibility report.", "Accessibility is an ongoing improvement task. We welcome feedback and will update this statement when features or known limitations change."], links: contactLinks },
  ],
};

export const safeguardingCommitment: WebsitePolicy = {
  title: "Safeguarding", eyebrow: "DIGNITY AND SAFETY",
  description: "HRPF's commitment to respectful conduct and practical guidance for raising concerns about harm, abuse or exploitation.",
  introduction: "HRPF's human-rights work is grounded in dignity and respect, particularly for children and people in vulnerable situations. This page explains its safeguarding commitment and the current ways to raise a concern. It does not describe an independent investigation service.",
  sections: [
    { id: "respectful-conduct", title: "Respectful conduct", paragraphs: ["People acting on behalf of HRPF should treat others with dignity, maintain appropriate boundaries and avoid discrimination, harassment, abuse or exploitation. A position of authority or trust should never be used to pressure someone into sharing information or accepting unwanted conduct."] },
    { id: "children-and-vulnerable-people", title: "Children and people in vulnerable situations", paragraphs: ["The safety and dignity of the person affected should guide how a concern is raised. Do not publish a child's identity, private case details or sensitive photographs to draw attention to an issue. Share only relevant information through an appropriate reporting route."] },
    { id: "reporting", title: "Raising a concern", paragraphs: ["For an initial concern about conduct connected with HRPF, use the Foundation's published email addresses. Explain what happened, who is involved and whether there is an immediate safety concern. Avoid attaching unnecessary identity documents in the first message.", "The feedback-about-HRPF form at Complaints and Feedback does not currently deliver reports. Its confirmation should not be treated as a safeguarding receipt. The connected Contact form sends enquiries to routine HRPF recipients and is not an independent safeguarding channel."], links: contactLinks },
    { id: "reporting-safely", title: "Choosing a safe reporting route", paragraphs: ["File a Complaint stores a rights concern and emails the complete details and files to the sender and designated HRPF administrators. It is not an anonymous channel or a separately staffed safeguarding service.", "If your concern involves someone who may receive HRPF's routine messages, avoid sending sensitive details through that channel. Seek a safe independent route through an appropriate local protection authority or qualified adviser. This website does not provide a dedicated independent reporting contact."], links: [{ label: "How complaint information is handled", href: "/privacy-policy#email-copies" }] },
    { id: "information-and-response", title: "Information and response", paragraphs: ["A concern should be taken seriously and handled with care. Absolute confidentiality cannot be promised: information may need to be shared to assess the concern, protect someone or meet legal responsibilities.", "This page does not promise an acknowledgement deadline, a particular investigation procedure or an outcome. The response depends on the issue, available information and the appropriate authorities. Sending a message is not confirmation that protective action has begun."] },
    { id: "immediate-danger", title: "Immediate danger", paragraphs: ["If someone is in immediate danger, contact the relevant local emergency service or protection authority. Do not wait for an HRPF website submission or email response before seeking urgent help."] },
    { id: "speaking-up", title: "Speaking up and further concerns", paragraphs: ["Raising a concern in good faith should not lead to intimidation or retaliation. If reporting would put you at risk, seek an independent safe route. A request for information or assistance should never require you to accept abusive conduct.", "HRPF's formal safeguarding responsibilities, independent escalation contact and review procedures need to be established separately from this website statement. The page will be updated when those arrangements are confirmed."] },
  ],
};
