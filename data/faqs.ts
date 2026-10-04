/*
  FAQ content for /faq (and reused on relevant pages).
  Answers are general information only and are not legal advice.
*/

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQGroup {
  category: string;
  items: FAQItem[];
}

export const faqGroups: FAQGroup[] = [
  {
    category: "About HRPF",
    items: [
      {
        question: "What does HRPF do?",
        answer:
          "HRPF promotes awareness, provides general information and guidance, documents concerns responsibly and connects people with appropriate support and referral services.",
      },
      {
        question: "Is HRPF a government organization?",
        answer:
          "No. HRPF is an independent nonprofit organization and is not a government body.",
      },
      {
        question: "Is HRPF a law firm?",
        answer:
          "No. HRPF provides information and referral and does not act as a legal representative.",
      },
      {
        question: "Where does HRPF work?",
        answer:
          "HRPF works with communities and institutional partners across multiple locations (sample content).",
      },
    ],
  },
  {
    category: "Reporting a Violation",
    items: [
      {
        question: "Can I report anonymously?",
        answer:
          "Yes. You can choose to submit a report without providing your identity, though this may limit follow-up.",
      },
      {
        question: "Does submitting a report guarantee legal representation?",
        answer:
          "No. Submitting a report does not create a lawyer-client relationship or guarantee representation or a specific outcome.",
      },
      {
        question: "What happens after I submit a concern?",
        answer:
          "Reports are reviewed carefully. HRPF may provide information, guidance or referral to another qualified service where appropriate.",
      },
      {
        question: "What should I do in an emergency?",
        answer:
          "If someone is in immediate danger, contact the relevant local emergency service or a qualified emergency-support organization.",
      },
    ],
  },
  {
    category: "Requesting Help",
    items: [
      {
        question: "What kind of help can HRPF provide?",
        answer:
          "HRPF may provide general rights information, documentation guidance or referral to suitable services, depending on the request and available resources.",
      },
      {
        question: "What can HRPF not provide?",
        answer:
          "HRPF does not guarantee legal representation, does not replace emergency services and cannot promise a particular case result.",
      },
      {
        question: "How are requests reviewed?",
        answer:
          "Requests are reviewed against HRPF's mandate and available resources; not all requests can be supported.",
      },
      {
        question: "Is my request confidential?",
        answer:
          "Information is handled carefully and shared only where necessary and appropriate.",
      },
    ],
  },
  {
    category: "Donations",
    items: [
      {
        question: "How are donations used?",
        answer:
          "Contributions may support awareness, documentation, community engagement, research and referral programmes (illustrative).",
      },
      {
        question: "Is online payment available?",
        answer:
          "Online payment processing is not yet configured on this demonstration website. Please do not enter real financial information.",
      },
      {
        question: "Will I receive a receipt?",
        answer:
          "Donation receipts will be provided once secure processing is configured.",
      },
      {
        question: "Can I support a specific project?",
        answer:
          "Yes. Sponsor-a-project options are illustrated on the donate page.",
      },
    ],
  },
  {
    category: "Volunteering",
    items: [
      {
        question: "Can I volunteer remotely?",
        answer:
          "Some opportunities may be available remotely, depending on the role and current needs.",
      },
      {
        question: "Who can volunteer?",
        answer:
          "Eligibility varies by role. General eligibility details are provided on the Get Involved page.",
      },
      {
        question: "Do I need previous experience?",
        answer:
          "Some roles welcome newcomers, while others require specific skills or experience.",
      },
      {
        question: "How do I apply?",
        answer:
          "You can apply using the volunteer application form on the Get Involved page.",
      },
    ],
  },
  {
    category: "Partnerships",
    items: [
      {
        question: "Can an organization propose a partnership?",
        answer:
          "Yes. Organizations can submit a partnership inquiry through the Partner With Us page.",
      },
      {
        question: "What types of partners does HRPF work with?",
        answer:
          "HRPF works with responsible NGOs, institutions, universities, donors and others that share its commitments.",
      },
      {
        question: "Does HRPF conduct due diligence?",
        answer:
          "Yes. HRPF follows a compatibility review and due-diligence process before entering partnerships.",
      },
      {
        question: "How long does the process take?",
        answer:
          "Timelines vary depending on the nature and scope of the proposed collaboration.",
      },
    ],
  },
  {
    category: "Privacy and Confidentiality",
    items: [
      {
        question: "How does HRPF protect personal information?",
        answer:
          "HRPF handles personal information carefully, limits access and shares it only where necessary and appropriate.",
      },
      {
        question: "Is sensitive information stored securely?",
        answer:
          "Secure handling is a priority. This demonstration site does not store submitted form data.",
      },
      {
        question: "Can I request that my information be removed?",
        answer:
          "You can contact HRPF to discuss your information; details are provided in the Privacy Policy.",
      },
      {
        question: "Does the website use cookies?",
        answer:
          "Cookie use is described in the Privacy Policy; essential cookies support core functionality.",
      },
    ],
  },
];
