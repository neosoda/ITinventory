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
  title: "Inventaire IT",
  description:
    "Inventaire IT est une plateforme de suivi du parc informatique pour piloter équipements, établissements et localisations.",
  keywords: [
    "inventaire",
    "IT",
    "équipements",
    "Next.js",
    "Prisma",
    "Tailwind CSS",
  ],
  authors: [{ name: "Inventaire IT" }],
  openGraph: {
    title: "Inventaire IT",
    description:
      "Suivez et administrez facilement votre parc informatique : établissements, équipements, localisations et supervision.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Inventaire IT",
    description:
      "Gestion centralisée du parc informatique : établissements, équipements et localisation.",
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
