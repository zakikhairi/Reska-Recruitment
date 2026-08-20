import type { Metadata } from "next";
import { Suspense } from "react";
import LoadingScreen from "@/components/loading/LoadingScreen";
import "./globals.css";

export const metadata: Metadata = {
  title: "KAI Services - Smart Recruitment System",
  description:
    "Sistem Rekrutmen Pintar PT Reska Multi Usaha (KAI Services) - Bergabunglah dengan keluarga besar PT Kereta Api Indonesia",
  keywords: [
    "rekrutmen",
    "lowongan kerja",
    "KAI",
    "Kereta Api Indonesia",
    "PT Reska Multi Usaha",
    "loker",
  ],
  authors: [{ name: "PT Reska Multi Usaha" }],
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full">
      <body className="min-h-full flex flex-col antialiased">
        <Suspense fallback={<LoadingScreen />}>
          {children}
        </Suspense>
      </body>
    </html>
  );
}
