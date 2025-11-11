import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IT Inventory - Gestion de parc informatique",
  description:
    "Plateforme moderne de gestion de parc informatique. Suivez, administrez et gérez vos équipements, établissements et localisations en temps réel.",
  keywords: [
    "inventaire",
    "IT",
    "gestion de parc",
    "équipements",
    "Next.js",
    "Prisma",
    "Tailwind CSS",
    "snipe-it",
    "asset management",
  ],
  authors: [{ name: "IT Inventory" }],
  openGraph: {
    title: "IT Inventory",
    description:
      "Gestion moderne et intuitive de votre parc informatique",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "IT Inventory",
    description:
      "Plateforme de gestion de parc informatique moderne et intuitive",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 dark:bg-gray-900`}
      >
        <ErrorBoundary>
          <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Header />
              <main className="flex-1 overflow-y-auto">
                <div className="container mx-auto p-6">
                  {children}
                </div>
              </main>
            </div>
          </div>
        </ErrorBoundary>
        <Toaster />
      </body>
    </html>
  );
}
