import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import Header from "@/components/layout/header";

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
      <body className="font-sans antialiased bg-gray-50 dark:bg-gray-900">
        <ErrorBoundary>
          <div className="flex flex-col h-screen">
            <Header />
            <main className="flex-1 overflow-y-auto">
              <div className="container mx-auto p-6">
                {children}
              </div>
            </main>
          </div>
        </ErrorBoundary>
        <Toaster />
      </body>
    </html>
  );
}
