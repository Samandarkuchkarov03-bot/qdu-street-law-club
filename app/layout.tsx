import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthRecoveryRedirect from "@/components/AuthRecoveryRedirect";
import { RECOVERY_BOOT_SCRIPT } from "@/lib/auth-redirect";
import { site } from "@/data/site";

const sans = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-sans" });
const serif = Playfair_Display({ subsets: ["latin", "latin-ext"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: {
    default: `${site.name} — ${site.university}`,
    template: `%s | ${site.name}`,
  },
  description: `${site.university} talabalarining huquqiy ta'lim klubi. ${site.tagline}`,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" className={`${sans.variable} ${serif.variable}`}>
      <body>
        <Script id="recovery-boot" strategy="beforeInteractive">
          {RECOVERY_BOOT_SCRIPT}
        </Script>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded focus:bg-gold-500 focus:px-4 focus:py-2 focus:text-navy-950"
        >
          Asosiy mazmunga o'tish
        </a>
        <AuthRecoveryRedirect />
        <Navbar />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
