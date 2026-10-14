import { Suspense } from "react";
import NavigationProgress from "@/components/shared/NavigationProgress";
import type { Metadata } from "next";
import { Inter, Lora, Noto_Naskh_Arabic } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SiteFrame from "@/components/layout/SiteFrame";
import ActionToaster from "@/components/shared/ActionToaster";
import LanguageSwitcher from "@/components/translation/LanguageSwitcher";
import { createSocialImage, SITE_URL } from "@/lib/seo";

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

// Self-host the Arabic-script subset; only translated RTL text uses it.
const arabic = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  display: "swap",
  preload: false,
  variable: "--font-arabic",
});

const siteUrl = SITE_URL;
const defaultSocialImage = createSocialImage();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default:
      "Human Rights Protection Foundation | Protecting Dignity and Defending Rights",
    template: "%s | Human Rights Protection Foundation",
  },
  description:
    "Human Rights Protection Foundation works to protect vulnerable communities, advance justice and promote human dignity through advocacy, education, research and legal support.",
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
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "Human Rights Protection Foundation",
    title:
      "Human Rights Protection Foundation | Protecting Dignity and Defending Rights",
    description:
      "Protecting vulnerable communities and advancing justice through advocacy, education, research and legal support.",
    url: siteUrl,
    locale: "en_US",
    images: [defaultSocialImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "Human Rights Protection Foundation",
    description:
      "Protecting vulnerable communities and advancing justice through advocacy, education, research and legal support.",
    images: [defaultSocialImage],
  },
  icons: {
    icon: [{ url: "/favicon.ico?v=hrpf-1", type: "image/x-icon" }],
    apple: [{ url: "/images/hrpf-logo.png", type: "image/png" }],
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Organization identity; no unsupported founding year.
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "NGO",
  name: "Human Rights Protection Foundation",
  alternateName: "HRPF",
  url: siteUrl,
  description:
    "Human Rights Protection Foundation works to protect vulnerable communities, advance justice and promote human dignity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${lora.variable} ${inter.variable} ${arabic.variable}`}
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
        <SiteFrame header={<Header />} footer={<Footer />}>
          {children}
        </SiteFrame>
        <LanguageSwitcher />
        <ActionToaster />
        <Suspense fallback={null}><NavigationProgress /></Suspense>
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
