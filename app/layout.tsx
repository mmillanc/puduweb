import type { Metadata } from "next";
import Script from "next/script";
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
    default: "PuduWeb - Presencia digital sencilla para pequeños negocios",
    template: "%s | PuduWeb",
  },
  description:
    "Crea una página de presentación para tu negocio en minutos. PuduWeb da a tu pyme o emprendimiento una dirección web con fotos, reseñas y formulario de contacto, sin necesidad de tener tu propio sitio.",
  keywords: [
    "presencia digital",
    "página web sencilla",
    "landing page",
    "pequeños negocios",
    "pymes",
    "emprendedores",
    "Chile",
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
    title: "PuduWeb - Presencia digital sencilla para pequeños negocios",
    description:
      "Da a tu negocio una landing de presentación con fotos, reseñas y contacto directo, sin complicarte con un sitio web completo.",
  },
  twitter: {
    card: "summary_large_image",
    title: "PuduWeb - Presencia digital sencilla para pequeños negocios",
    description:
      "Crea la página de tu negocio en minutos y compártela como tu dirección web.",
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
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "PuduWeb",
    url: baseUrl,
    description: "Plataforma que entrega presencia digital sencilla a pequeños negocios y profesionales en Chile, con una página de presentación y contacto.",
    inLanguage: "es-CL",
    potentialAction: {
      "@type": "SearchAction",
      target: `${baseUrl}?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-TGXSVB2CVN"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-TGXSVB2CVN');
        `}</Script>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
