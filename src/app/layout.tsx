import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AuthGuard from "@/components/AuthGuard";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Asistencia del Barrio",
  description: "Registro de asistencia a la reunión sacramental",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body><AuthGuard>{children}</AuthGuard></body>
    </html>
  );
}
