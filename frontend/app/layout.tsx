import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// Editorial serif for headings; clean sans for body copy.
const lora = Lora({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-lora",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

// TODO: replace with the production domain before launch.
const siteUrl = "https://www.hrpf.org";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default:
      "Human Rights Protection Foundation Pakistan | Protecting Dignity and Defending Rights",
    template: "%s | Human Rights Protection Foundation Pakistan",
  },
  description:
    "Human Rights Protection Foundation Pakistan works to protect vulnerable communities, advance justice and promote human dignity through advocacy, education, research and legal support.",
  keywords: [
    "human rights",
    "nonprofit",
    "advocacy",
    "legal aid",
    "justice",
    "humanitarian",
    "HRPF",
  ],
  alternates: {
    // TODO: confirm canonical URL for production.
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "Human Rights Protection Foundation Pakistan",
    title:
      "Human Rights Protection Foundation Pakistan | Protecting Dignity and Defending Rights",
    description:
      "Protecting vulnerable communities and advancing justice through advocacy, education, research and legal support.",
    url: siteUrl,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Human Rights Protection Foundation Pakistan",
    description:
      "Protecting vulnerable communities and advancing justice through advocacy, education, research and legal support.",
  },
  icons: {
    icon: [{ url: "/images/hrpf-logo.png", type: "image/png" }],
    apple: [{ url: "/images/hrpf-logo.png", type: "image/png" }],
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Basic Organization structured-data placeholder for search engines.
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "NGO",
  name: "Human Rights Protection Foundation Pakistan",
  alternateName: "HRPF",
  url: siteUrl,
  description:
    "Human Rights Protection Foundation Pakistan works to protect vulnerable communities, advance justice and promote human dignity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${lora.variable} ${inter.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#main-content"
          className="sr-only rounded-md bg-navy px-4 py-2 text-white focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100]"
        >
          Skip to content
        </a>
        <Header />
        {children}
        <Footer />
        <script
          type="application/ld+json"
          // Structured data is static and safe to inline.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
      </body>
    </html>
  );
}
