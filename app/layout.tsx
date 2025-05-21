import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import NavigationBar from "@/components/NavigationBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Skill Tracker",
  description: "Track your skills and progress",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-gray-50 text-gray-800 antialiased`}
      >
        <AuthProvider>
          <NavigationBar />
          <main>{children}</main>
          <footer className="text-center py-6 mt-10 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} SkillTrackr. All rights
              reserved.
            </p>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
