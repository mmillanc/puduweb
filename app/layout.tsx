import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  title: {
    default: "PuduWeb - Directorio de profesionales y pymes",
    template: "%s | PuduWeb",
  },
  description:
    "Encuentra profesionales, pymes y vendedores cerca de ti. Directorio local con perfiles detallados, redes sociales y opciones de contacto.",
  keywords: [
    "directorio",
    "profesionales",
    "pymes",
    "servicios",
    "Chile",
    "páginas amarillas",
    "kinesiólogo",
    "abogado",
    "constructor",
  ],
  authors: [{ name: "PuduWeb" }],
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "es_CL",
    siteName: "PuduWeb",
    title: "PuduWeb - Directorio de profesionales y pymes",
    description:
      "Encuentra profesionales, pymes y vendedores cerca de ti. Directorio local con perfiles detallados.",
  },
  twitter: {
    card: "summary_large_image",
    title: "PuduWeb - Directorio de profesionales y pymes",
    description:
      "Encuentra profesionales, pymes y vendedores cerca de ti.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
