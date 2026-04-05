import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Placement Portfolio Engine — Resume to Portfolio in Minutes",
  description: "Upload your resume PDF, let AI optimize your content, and generate a recruiter-ready portfolio website. Deploy with one click.",
  keywords: ["portfolio", "resume", "AI", "placement", "recruiter", "developer portfolio", "career"],
  authors: [{ name: "Placement Portfolio Engine" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Placement Portfolio Engine",
    description: "Convert your resume into a recruiter-optimized portfolio website with AI.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Placement Portfolio Engine",
    description: "Convert your resume into a recruiter-optimized portfolio website with AI.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
