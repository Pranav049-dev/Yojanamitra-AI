import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/authContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "YojanaMitra AI — Indian Government Scheme Discovery & Investigation Platform",
  description: "Discover, Understand, Investigate, and Benefit from Central and State Government welfare schemes across India. Built-in rule-based eligibility evaluation, scam detection, and AI research assistant.",
  metadataBase: new URL("https://eco-gate-sampling-canyon.trycloudflare.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "YojanaMitra AI",
    description: "Discover, understand, investigate, and benefit from Indian government welfare schemes.",
    url: "https://eco-gate-sampling-canyon.trycloudflare.com",
    siteName: "YojanaMitra AI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
        <AuthProvider>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
