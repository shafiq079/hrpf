import { womensRights } from "./womensRights";

export type WorkAreaContent = {
  title: string; description: string; introduction: string;
  image: string; imageAlt: string; eyebrow: string; tagline: string;
  priorityTitle: string; priorityIntroduction: string; projectIntroduction: string;
  priorities: readonly { title: string; text: string; icon: "protection" | "health" | "justice" | "education" | "inclusion" | "research" | "information" | "dialogue" }[];
  approachTitle: string; approachIntroduction: string;
  approach: readonly { title: string; text: string }[];
  actionTitle: string; actionIntroduction: string; actionNote: string;
  faqs: readonly { question: string; answer: string }[];
};

const commonAction = {
  actionTitle: "Your concern deserves to be heard.",
  actionIntroduction: "Explain the issue through HRPF's complaint form and provide the relevant details and documents. For a general enquiry, contact the Foundation.",
  actionNote: "This website is not an emergency response service. If you are in immediate danger, contact local emergency services.",
};
const complaintFaq = {
  question: "How can I raise a concern with HRPF?",
  answer: "Use File a Complaint to explain the issue, provide your details and attach relevant documents. For a general enquiry or a discussion about working together, use the Contact page.",
};

/** General institutional copy; source map and photo provenance are kept in docs/OUR_WORK_REDESIGN.md. */
const workAreas: Record<string, WorkAreaContent> = {
  "womens-rights": {
    ...commonAction, ...womensRights,
    eyebrow: "DIGNITY · EQUALITY · ACCOUNTABILITY",
    tagline: "Dignity, safety and a voice.",
    priorityTitle: "Women's rights are human rights.",
    priorityIntroduction: "We work to strengthen awareness of women's rights and encourage fair access to health, education and justice. Our advocacy connects community concerns with the responsibility of institutions to act.",
    projectIntroduction: "Explore HRPF initiatives supporting women's dignity, safety and equal rights.",
    priorities: womensRights.priorities.map((priority, index) => ({ ...priority, icon: (["protection", "health", "justice"] as const)[index] })),
    approachTitle: "From a concern to responsible action.",
    approachIntroduction: "HRPF works through documentation, public awareness and peaceful, lawful engagement with institutions.",
  },
  "childrens-rights": {
    ...commonAction,
    title: "Children's Rights",
    description: "HRPF advocates for children's protection, education and healthcare through public awareness, documentation and institutional engagement in Pakistan.",
    eyebrow: "PROTECTION · LEARNING · WELLBEING",
    tagline: "A safe childhood. A fair chance to grow.",
    introduction: "Every child deserves safety, care and the opportunity to learn. HRPF raises concerns about abuse, exploitation and barriers to essential services, encouraging families, communities and institutions to protect children's rights.",
    image: "/images/hrpf/childrens-rights-archive.webp",
    imageAlt: "Children and adults gathered around tables outdoors.",
    priorityTitle: "Protecting the dignity of every child.",
    priorityIntroduction: "Children's wellbeing depends on protection, access to education and reliable healthcare. We bring concerns affecting these needs to the attention of the relevant institutions.",
    priorities: [
      { icon: "protection", title: "Protection from harm", text: "We promote awareness of children's rights and raise concerns about abuse, child labour, trafficking and exploitation through responsible documentation and lawful advocacy." },
      { icon: "education", title: "Access to education", text: "We advocate for children's educational rights and raise concerns about school conditions and barriers that prevent children from learning safely." },
      { icon: "health", title: "Health and care", text: "We highlight difficulties in accessing healthcare and basic services, including the needs of infants and vulnerable children." },
    ],
    projectIntroduction: "Explore HRPF initiatives supporting children's protection, learning and wellbeing.",
    approachTitle: "Putting children's wellbeing first.",
    approachIntroduction: "We connect concerns raised by families and communities with the responsibilities of education, health and public institutions.",
    approach: [
      { title: "Understand the concern", text: "Gather relevant information about the issue and the services or institutions involved, keeping the child's dignity central to the discussion." },
      { title: "Engage the relevant institution", text: "Raise documented concerns through complaints, representations and lawful engagement with the responsible authorities." },
      { title: "Seek a responsible response", text: "Follow up on the concern and encourage action that supports children's safety and access to essential services." },
    ],
    actionTitle: "Raise a concern affecting a child.",
    actionIntroduction: "A parent, guardian or concerned adult can contact HRPF about a child's rights or access to services. Explain the issue clearly and use the complaint form for supporting documents.",
    faqs: [
      { question: "What concerns can I raise?", answer: "You can raise concerns about abuse, exploitation, child labour, denial of educational rights or barriers to healthcare and basic services. Give the relevant details so HRPF can understand the issue." },
      { question: "Should I share a child's details publicly?", answer: "Use the complaint form to provide relevant information rather than posting identifying details or sensitive documents in public comments or on social media." },
      { question: "Does HRPF operate a school or children's care home?", answer: "This page describes HRPF's advocacy and institutional engagement. It does not offer admission to a school, accommodation or clinical care. Contact the Foundation to discuss your concern." },
    ],
  },
  "access-to-justice": {
    ...commonAction,
    title: "Access to Justice",
    description: "HRPF promotes access to justice through responsible documentation, complaints, lawful advocacy and engagement with public institutions in Pakistan.",
    eyebrow: "FAIRNESS · DUE PROCESS · ACCOUNTABILITY",
    tagline: "Justice with dignity. A voice for the unheard.",
    introduction: "Understanding a concern and bringing it to the right institution can be an important step towards justice. HRPF supports public-interest advocacy for people facing injustice, with particular attention to vulnerable and disadvantaged communities.",
    image: "/images/hrpf/access-to-justice-archive.webp",
    imageAlt: "People discussing documents around a meeting table.",
    priorityTitle: "Fair treatment starts with being heard.",
    priorityIntroduction: "We seek lawful, peaceful responses to rights concerns. Our focus is on clear documentation, access to institutions and respect for the dignity of people affected by injustice.",
    priorities: [
      { icon: "justice", title: "Rights and fair treatment", text: "We advocate for equality, due process and fair treatment, raising concerns about abuse of authority and barriers to justice." },
      { icon: "information", title: "Complaints and documentation", text: "We bring relevant facts, documents and previous proceedings together to explain concerns through complaints and representations to the appropriate institutions." },
      { icon: "protection", title: "Vulnerable prisoners", text: "We raise concerns affecting innocent and vulnerable prisoners, including treatment in detention and access to basic services and lawful remedies." },
    ],
    projectIntroduction: "Explore HRPF initiatives addressing fair treatment, institutional accountability and access to justice.",
    approachTitle: "Clear facts. Lawful action. Responsible follow-up.",
    approachIntroduction: "Every concern needs to be understood in its own context, including the documents available and any action already taken.",
    approach: [
      { title: "Understand the issue", text: "Review the account, relevant documents and previous proceedings to understand the concern and the institutions involved." },
      { title: "Raise the concern", text: "Use complaints, representations and lawful institutional engagement to seek attention to the issue." },
      { title: "Follow the response", text: "Continue engagement with the relevant institutions and document their response and any further concerns." },
    ],
    faqs: [
      complaintFaq,
      { question: "What information should I provide?", answer: "Explain what happened, when and where it happened, which institutions are involved and what action you have already taken. Attach relevant documents through the complaint form." },
      { question: "Does HRPF guarantee legal representation or a court outcome?", answer: "Submitting a concern does not appoint a lawyer or guarantee a result. HRPF's response depends on the issue, available information and the appropriate lawful channels. Contact the Foundation to discuss your circumstances." },
    ],
  },
  "minority-rights": {
    ...commonAction,
    title: "Minority Rights",
    description: "HRPF promotes equality, non-discrimination and peaceful coexistence through public awareness and advocacy for minority communities in Pakistan.",
    eyebrow: "EQUALITY · INCLUSION · RESPECT",
    tagline: "Equal dignity. A place for every community.",
    introduction: "Human rights belong to everyone. HRPF stands for the dignity of religious, ethnic and cultural communities and raises concerns about discrimination, exclusion and unequal treatment through peaceful, lawful advocacy.",
    image: "/images/hrpf/minority-rights-archive.webp",
    imageAlt: "Women and men standing together at an indoor community gathering.",
    priorityTitle: "Respect and opportunity for everyone.",
    priorityIntroduction: "An inclusive society recognises the dignity of every person. We encourage understanding between communities and fair, responsive institutions that serve people without discrimination.",
    priorities: [
      { icon: "justice", title: "Equality and non-discrimination", text: "We raise awareness of equal rights and bring concerns about discriminatory treatment to the attention of relevant institutions." },
      { icon: "dialogue", title: "Peaceful coexistence", text: "We promote tolerance, interfaith understanding and respectful community dialogue to encourage trust and social harmony." },
      { icon: "inclusion", title: "Access and participation", text: "We advocate for fair access to essential services and for the voices of marginalised communities to be heard in matters affecting their lives." },
    ],
    projectIntroduction: "Explore HRPF initiatives supporting equality, inclusion and understanding between communities.",
    approachTitle: "Listening across communities.",
    approachIntroduction: "HRPF's approach connects respect for individual rights with constructive engagement between communities and institutions.",
    approach: [
      { title: "Listen with respect", text: "Understand the concern and the experiences of people affected, without making assumptions about their community or beliefs." },
      { title: "Document unequal treatment", text: "Gather relevant information and describe the issue clearly so it can be raised responsibly through the appropriate channels." },
      { title: "Encourage a fair response", text: "Seek attention from relevant institutions and promote peaceful dialogue, equal treatment and accountability." },
    ],
    faqs: [
      { question: "Who can raise a discrimination concern?", answer: "Individuals and community members can contact HRPF about discrimination or unequal access to services. Explain the issue and provide relevant details or documents through the complaint form." },
      { question: "Does HRPF represent a political or religious group?", answer: "HRPF is a non-political public-interest organisation. Its advocacy is grounded in human dignity, equality and lawful, peaceful engagement." },
      complaintFaq,
    ],
  },
  "education-and-awareness": {
    ...commonAction,
    title: "Education and Awareness",
    description: "HRPF promotes rights awareness, educational access and informed civic participation through public-interest advocacy in Pakistan.",
    eyebrow: "KNOWLEDGE · OPPORTUNITY · PARTICIPATION",
    tagline: "Understand your rights. Take an informed step.",
    introduction: "People are better able to raise concerns when they understand their rights and the responsibilities of institutions. HRPF promotes public awareness and educational access, helping bring community concerns into informed, constructive discussion.",
    image: "/images/hrpf/education-and-awareness-archive.webp",
    imageAlt: "An audience seated together in a hall during a public event.",
    priorityTitle: "Awareness opens the way to action.",
    priorityIntroduction: "Education and reliable information help people participate in public life. We connect rights awareness with concerns about learning conditions and access to essential services.",
    priorities: [
      { icon: "information", title: "Understanding rights", text: "We promote awareness of human dignity, equality, legal protections and the responsibilities of public institutions." },
      { icon: "education", title: "Educational access", text: "We raise concerns about school conditions and barriers to education, encouraging the responsible institutions to address community needs." },
      { icon: "dialogue", title: "Informed participation", text: "We encourage people to use reliable information, document concerns and engage peacefully with the institutions responsible for public services." },
    ],
    projectIntroduction: "Explore HRPF initiatives supporting educational access, rights awareness and informed communities.",
    approachTitle: "Connecting knowledge with community needs.",
    approachIntroduction: "Our awareness work is rooted in the concerns people face and the lawful channels available to raise them.",
    approach: [
      { title: "Identify the need", text: "Listen to families, learners and communities to understand information gaps and concerns about educational access or facilities." },
      { title: "Build understanding", text: "Bring rights, responsibilities and relevant information into clear public discussion and awareness activities." },
      { title: "Encourage action", text: "Raise documented concerns with relevant institutions and encourage informed, constructive community participation." },
    ],
    actionTitle: "Share an education or awareness concern.",
    actionIntroduction: "Contact HRPF about educational access, school conditions or opportunities to work together on public awareness. Use the complaint form when you need to raise a specific concern with supporting documents.",
    faqs: [
      { question: "Can a school or community group contact HRPF?", answer: "Yes. Use the Contact page to discuss an educational concern or an idea for public awareness. Any activity depends on its scope and the Foundation's available capacity." },
      { question: "Where can I learn more about HRPF's work?", answer: "Explore the Foundation's Projects, Blogs and Progress Reports pages for published activities and updates. This category page explains the general approach." },
      complaintFaq,
    ],
  },
  "research-and-advocacy": {
    ...commonAction,
    title: "Research and Advocacy",
    description: "HRPF uses research, documentation, information requests and lawful advocacy to promote transparency and institutional accountability in Pakistan.",
    eyebrow: "EVIDENCE · TRANSPARENCY · ACCOUNTABILITY",
    tagline: "Understand the issue. Make the concern count.",
    introduction: "Responsible advocacy begins with understanding the facts. HRPF brings together community concerns, public information and documentation to highlight human-rights issues and encourage institutions to respond transparently.",
    image: "/images/hrpf/research-and-advocacy-archive.webp",
    imageAlt: "People in discussion around an office table with documents.",
    priorityTitle: "Evidence that supports responsible action.",
    priorityIntroduction: "We use information to describe public-interest concerns clearly and seek accountability. Research and advocacy connect people's experiences with institutional responsibilities.",
    priorities: [
      { icon: "research", title: "Research and documentation", text: "We examine public-interest issues, bring relevant records together and document concerns affecting rights and essential services." },
      { icon: "information", title: "Access to information", text: "We promote the right to information and use information requests and institutional engagement to seek clarity about public decisions and services." },
      { icon: "justice", title: "Public-interest advocacy", text: "We raise documented concerns through complaints, representations and peaceful, lawful engagement, encouraging transparent and accountable responses." },
    ],
    projectIntroduction: "Explore HRPF initiatives involving research, public information and institutional advocacy.",
    approachTitle: "From information to constructive advocacy.",
    approachIntroduction: "Our approach combines careful documentation with clear questions and lawful engagement with the institutions involved.",
    approach: [
      { title: "Define the concern", text: "Identify the public-interest issue, the people affected and the information needed to understand it." },
      { title: "Gather and assess information", text: "Review available documents, seek relevant public information and distinguish reported concerns from established findings." },
      { title: "Engage and follow up", text: "Present the concern to relevant institutions, seek a response and document developments through the Foundation's published work." },
    ],
    actionTitle: "Bring a public-interest issue to our attention.",
    actionIntroduction: "Contact HRPF about a research or advocacy concern. Explain the issue, identify the institutions involved and provide relevant documents through the complaint form when making a specific complaint.",
    faqs: [
      { question: "What issues does HRPF examine?", answer: "HRPF's research and advocacy concern human rights, transparency, institutional accountability and access to essential public services. The focus of individual work is described in its published projects and reports." },
      { question: "Where can I find published research and updates?", answer: "Visit Progress Reports, Projects and Blogs to explore the Foundation's published work. Individual records contain the details of the activity or issue." },
      { question: "Can I share information relevant to an issue?", answer: "Yes. Use the Contact page for a general discussion or the complaint form for a specific concern and relevant supporting documents. Explain where the information came from and any action already taken." },
    ],
  },
  "refugees-and-migrants": {
    ...commonAction,
    title: "Refugees and Migrants",
    description: "HRPF raises concerns affecting migrants and displaced people through documentation, awareness and lawful institutional engagement.",
    eyebrow: "SAFETY · DIGNITY · FAIR TREATMENT",
    tagline: "Protection beyond borders.",
    introduction: "People facing displacement, exploitation or barriers abroad deserve to be heard. HRPF brings their concerns to relevant institutions and promotes awareness of migration risks and human dignity.",
    image: "/images/hrpf/home-programme-information.webp",
    imageAlt: "An HRPF public-awareness gathering.",
    priorityTitle: "Safety and dignity at every stage.",
    priorityIntroduction: "Our work connects family concerns with public awareness and institutional responsibility. The needs of people affected guide how we document and raise an issue.",
    projectIntroduction: "Explore HRPF's migration-awareness, overseas-support and displacement-related advocacy.",
    priorities: [
      { icon: "protection", title: "Protection from exploitation", text: "We highlight trafficking and unsafe migration risks, bringing reported exploitation and families' concerns to relevant institutions." },
      { icon: "information", title: "Documentation and awareness", text: "We bring relevant records together and encourage informed discussion of migration risks and barriers to assistance." },
      { icon: "inclusion", title: "Displaced families' dignity", text: "We advocate for fair access to humanitarian assistance and attention to the needs of people displaced by emergencies." },
    ],
    approachTitle: "Listen, document and engage.",
    approachIntroduction: "HRPF works through public-interest awareness and lawful representations to the institutions responsible for the concern.",
    approach: [
      { title: "Understand the situation", text: "Listen to the family or community and review the available records, taking care with personal and sensitive information." },
      { title: "Identify the responsible institution", text: "Bring the concern to the appropriate public authority or oversight mechanism through a clear representation." },
      { title: "Follow the response", text: "Document developments and continue engagement where further attention is needed." },
    ],
    faqs: [
      { question: "What migration concerns does HRPF raise?", answer: "HRPF's documented work includes trafficking awareness, overseas documentation concerns and advocacy affecting displaced families. Individual projects explain the scope of each intervention." },
      { question: "Does HRPF issue visas or travel documents?", answer: "Travel documents and immigration decisions belong to the responsible authorities. HRPF's role is to raise documented concerns and advocate for fair treatment." },
      complaintFaq,
    ],
  },
  "community-development": {
    ...commonAction,
    title: "Community Development",
    description: "HRPF raises community concerns about essential public services, local infrastructure and accountable decision-making.",
    eyebrow: "ESSENTIAL SERVICES · PARTICIPATION · ACCOUNTABILITY",
    tagline: "Everyday needs deserve action.",
    introduction: "Clean water, reliable services and safe public spaces affect people's dignity and wellbeing. HRPF listens to community concerns and works through lawful engagement to seek a responsible institutional response.",
    image: "/images/hrpf/home-programme-water.webp",
    imageAlt: "A water-related public-service site.",
    priorityTitle: "Stronger communities through better services.",
    priorityIntroduction: "We bring local concerns into public-interest advocacy, encouraging the responsible institutions to listen, explain decisions and address practical needs.",
    projectIntroduction: "Explore HRPF initiatives concerning public services, community welfare and local infrastructure.",
    priorities: [
      { icon: "health", title: "Essential public services", text: "We raise concerns about water, sanitation, electricity, gas and access to healthcare with the responsible departments." },
      { icon: "protection", title: "Safer shared spaces", text: "We highlight infrastructure and environmental concerns that affect community safety and wellbeing." },
      { icon: "dialogue", title: "Participation and trust", text: "We encourage peaceful civic engagement and transparent responses to legitimate public grievances." },
    ],
    approachTitle: "From a local issue to a public response.",
    approachIntroduction: "Our approach combines community information, clear documentation and engagement with service providers and oversight institutions.",
    approach: [
      { title: "Identify the community need", text: "Listen to residents and understand the service or infrastructure concern and the people affected." },
      { title: "Raise a clear representation", text: "Present relevant records and seek attention from the responsible department or appropriate oversight institution." },
      { title: "Document the response", text: "Follow developments and distinguish directions, work in progress and confirmed outcomes." },
    ],
    faqs: [
      { question: "Does HRPF deliver every service itself?", answer: "Our role varies by initiative. Much of our work involves advocacy with public-service providers and oversight bodies; individual projects explain who carried out the work and what was achieved." },
      { question: "Can residents share a local concern?", answer: "Yes. Explain the issue, its location and any previous contact with the responsible department. Use the complaint form for a specific grievance or Contact for a general enquiry." },
      complaintFaq,
    ],
  },
};

export function getWorkAreaContent(slug: string): WorkAreaContent | undefined {
  return Object.hasOwn(workAreas, slug) ? workAreas[slug] : undefined;
}
