import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Skill Tracker",
  description: "Skill Tracker app for personal use",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>{children}</body>
    </html>
  );
}
