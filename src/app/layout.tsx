import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Gabri × Tati",
  description: "Una aventura para dos.",
  applicationName: "Gabri × Tati",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Gabri × Tati",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: "Gabri × Tati",
    description: "Una aventura para dos.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Gabri × Tati",
    description: "Una aventura para dos.",
  },
  robots: {
    index: false,
    follow: false,
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#121018",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${display.variable} ${body.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
