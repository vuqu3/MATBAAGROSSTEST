import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./admin/providers";
import CookieBanner from "./components/CookieBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.matbaagross.com'),
  title: "MatbaaGross - Türkiye'nin Online Matbaa Toptancısı",
  description: "Profesyonel matbaa ürünleri ve hizmetleri. Ofset baskı, dijital baskı, kutu & ambalaj, promosyon ürünleri ve daha fazlası.",
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
  },
  alternates: {
    canonical: './',
  },
  openGraph: {
    type: 'website',
    url: 'https://www.matbaagross.com',
    siteName: 'MatbaaGross',
    title: "MatbaaGross - Türkiye'nin Online Matbaa Toptancısı",
    description: "Profesyonel matbaa ürünleri ve hizmetleri. Ofset baskı, dijital baskı, kutu & ambalaj, promosyon ürünleri ve daha fazlası.",
    images: [
      {
        url: '/matbaagross-logo.png',
        width: 1200,
        height: 630,
        alt: 'MatbaaGross',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "MatbaaGross - Türkiye'nin Online Matbaa Toptancısı",
    description: "Profesyonel matbaa ürünleri ve hizmetleri. Ofset baskı, dijital baskı, kutu & ambalaj, promosyon ürünleri ve daha fazlası.",
    images: ['/matbaagross-logo.png'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden md:overflow-x-visible`}
      >
        <Providers>{children}</Providers>
        <CookieBanner />
      </body>
    </html>
  );
}
