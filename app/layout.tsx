import type { Metadata } from "next";
import { Inter, Geist, Fraunces } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ToastProvider } from "./components/ToastProvider"
import { ModalProvider } from "./components/ModalProvider";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ["latin"] });

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "TestWise - Smart Exam Management System",
    template: "%s | TestWise"
  },
  description: "A secure, intelligent platform for creating, managing, and monitoring online examinations. Features role-based access, real-time monitoring, and detailed analytics.",
  keywords: ["exam management", "online testing", "education software", "quiz maker", "student monitoring", "TestWise"],
  authors: [{ name: "TestWise Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://testwise.vercel.app",
    title: "TestWise - Smart Exam Management",
    description: "Secure and intelligent online examination platform.",
    siteName: "TestWise",
  },
  twitter: {
    card: "summary_large_image",
    title: "TestWise - Smart Exam Management",
    description: "Secure and intelligent online examination platform.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable, fraunces.variable)}>
      <body className={cn(inter.className, "bg-[#FAF7F1] text-stone-900 antialiased")}>
        <ToastProvider>
          <ModalProvider>
            <Providers>{children}</Providers>
          </ModalProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
