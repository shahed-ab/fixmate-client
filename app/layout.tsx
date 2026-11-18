import React, { Suspense } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { MockSessionProvider } from "@/lib/mock-session";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FixMate | On-Demand Repair & Maintenance Services",
  description: "Connect with certified technicians for smartphone, laptop, home appliance, and electrical repairs.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="min-h-screen bg-background text-foreground flex flex-col font-sans">
        <MockSessionProvider>
          <Suspense fallback={null}>
            <Navbar />
          </Suspense>
          <main className="flex-1 flex flex-col">{children}</main>
          <Suspense fallback={null}>
            <Footer />
          </Suspense>
        </MockSessionProvider>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}


