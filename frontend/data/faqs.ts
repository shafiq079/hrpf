import { objectiveCount } from "./aims-and-objectives";

export interface FAQItem { question: string; answer: string; }
export interface FAQGroup { category: string; items: FAQItem[]; }
export const faqGroups: FAQGroup[] = [
  {
    "category": "About HRPF",
    "items": [
      {
        "question": "What is HRPF Pakistan?",
        "answer": "Human Rights Protection Foundation Pakistan is a non-profit, non-governmental and humanitarian organization working for human rights, dignity, justice, equality, transparency and social welfare in Pakistan."
      },
      {
        "question": "Where is the Foundation based?",
        "answer": "HRPF is based in District Mandi Bahauddin, Punjab, Pakistan. The Contact page contains the office map, address, phone and email details."
      },
      {
        "question": "What areas does HRPF work in?",
        "answer": "Our Work covers women’s rights, children’s rights, access to justice, minority rights, education and awareness, research and advocacy, refugees and migrants, and community development. The Foundation’s objectives also include health, clean water, environmental protection and humanitarian welfare."
      },
      {
        "question": "Where can I read the Foundation's aims and objectives?",
        "answer": `The Aims and Objectives page lists all ${objectiveCount} objectives. They cover human rights, health, education, rural and community welfare, research, press freedom and the Foundation's institutional development.`
      },
      {
        "question": "Where can I read about registration?",
        "answer": "Registration and Certificates presents the supplied Societies Registration Act filing, dated Punjab Charity Commission records and Pakistan Centre for Philanthropy certification. Document dates are shown as recorded; historical certificates do not establish a later renewal."
      }
    ]
  },
  {
    "category": "Reporting a Concern",
    "items": [
      {
        "question": "How do I file a complaint?",
        "answer": "Use File a Complaint for a human-rights concern. Provide your contact and identity details, CNIC image, written complaint and relevant documents. Include details of any previous proceedings and review your information before submitting."
      },
      {
        "question": "Can I submit File a Complaint anonymously?",
        "answer": "The File a Complaint form requires identity and contact details, including a CNIC number and image. It does not accept anonymous submissions. For an initial general enquiry, use Contact without attaching identity documents."
      },
      {
        "question": "What does the receipt mean?",
        "answer": "A successful receipt means the submission has been saved and email copies have been queued for the user and designated HRPF recipients. It does not confirm inbox delivery, review, legal representation or a case outcome."
      },
      {
        "question": "What should I do in an emergency?",
        "answer": "This website is not an emergency response service. If someone is in immediate danger, contact the relevant local emergency services."
      }
    ]
  },
  {
    "category": "Contact and Feedback",
    "items": [
      {
        "question": "How can I contact HRPF?",
        "answer": "Use the Contact form or the published email and phone details. The office map is available on Contact. Partnership and feedback forms use the same enquiry service."
      },
      {
        "question": "How do I raise a concern about HRPF itself?",
        "answer": "Use Feedback About HRPF for concerns about the Foundation, its communications or activities. This sends an enquiry to routine HRPF recipients and is not an independent safeguarding channel."
      },
      {
        "question": "Should I send documents through Contact?",
        "answer": "Use File a Complaint for a rights concern requiring evidence. Contact and partnership enquiries collect text and contact details; they do not accept attachments."
      },
      {
        "question": "Is a response time guaranteed?",
        "answer": "The website does not promise a response time or a particular outcome. Keep your submission reference for follow-up."
      }
    ]
  },
  {
    "category": "Membership",
    "items": [
      {
        "question": "How do I become a member?",
        "answer": "Open Become a Member and select Open Membership Form. Membership applications currently use the Google Form supplied by HRPF."
      },
      {
        "question": "Does this website approve membership or collect a membership payment?",
        "answer": "The website links to HRPF’s Google application form. It does not approve membership or collect a membership payment. Contact the Foundation for membership requirements."
      }
    ]
  },
  {
    "category": "Donations",
    "items": [
      {
        "question": "How can I donate?",
        "answer": "The Donate page provides HRPF’s supplied bank account and JazzCash details, with instructions for making a transfer."
      },
      {
        "question": "Is online payment available?",
        "answer": "Complete your transfer through your bank or JazzCash. The website does not process payments."
      },
      {
        "question": "Will I receive a receipt?",
        "answer": "Keep your transaction reference and email HRPF to request an acknowledgement. The website does not automatically verify transfers or issue receipts."
      },
      {
        "question": "Can I support a specific project?",
        "answer": "Email HRPF before transferring if you would like to discuss support for a specific project."
      }
    ]
  },
  {
    "category": "Projects and Progress",
    "items": [
      {
        "question": "Where can I see HRPF’s projects?",
        "answer": "Projects lists published initiatives. Each Our Work category displays published initiatives related to that field."
      },
      {
        "question": "How can I follow the organization’s impact?",
        "answer": "Our Impact summarizes documented areas of action. Progress Reports and project pages provide the detailed record. An ongoing matter can require further action; a completed intervention describes the recorded step rather than present-day conditions."
      }
    ]
  },
  {
    "category": "Newsletter and Privacy",
    "items": [
      {
        "question": "How do I receive newsletter updates?",
        "answer": "Enter your email in the footer, agree to receive updates and complete verification. Open the confirmation link in your email and select Confirm subscription. Your subscription becomes active only after confirmation."
      },
      {
        "question": "How do I unsubscribe?",
        "answer": "Use the unsubscribe link in your newsletter confirmation email. The link opens a page where you select Unsubscribe."
      },
      {
        "question": "How is information handled?",
        "answer": "Contact enquiries and complaints are stored and email copies are queued to the sender and designated HRPF recipients. Newsletter email addresses and consent are stored for subscription management. The Privacy Policy explains the handling of these records and external services."
      }
    ]
  }
];
