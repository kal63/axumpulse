import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/auth-context";
import { RoleProvider } from "@/contexts/role-context";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AxumPulse - Fitness & Wellness Platform",
  description: "A comprehensive fitness and wellness platform with trainer content, challenges, and workout plans. Join AxumPulse to achieve your fitness goals with expert guidance and community support.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ThemeProvider>
            <RoleProvider>
              {children}
              <Toaster />
            </RoleProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
