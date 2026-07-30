import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Duelite — Pay your dues. See every kobo. No stories.",
  description:
    "Duelite gives course reps a clean way to collect departmental dues, and gives every student proof of where the money went. Built on BMONI's regulated stablecoin rails.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", manrope.variable, "font-sans")}
    >
      <body className="min-h-full flex flex-col bg-canvas text-ink">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
