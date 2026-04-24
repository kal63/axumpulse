import type { Metadata } from "next";
import { Geist, Geist_Mono, Archivo, Archivo_Black } from "next/font/google";
import "./globals.css";
import "../styles/animations.css";
import { Toaster } from "@/components/ui/sonner";
import { Toaster as CustomToaster } from "@/components/ui/toaster";
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

const fontLanding = Archivo({
  variable: "--font-landing",
  subsets: ["latin"],
  display: "swap",
});

const fontLandingDisplay = Archivo_Black({
  variable: "--font-landing-display",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Compound 360 - Fitness & Wellness Platform",
  description: "A comprehensive fitness and wellness platform with trainer content, challenges, and workout plans. Join Compound 360 to achieve your fitness goals with expert guidance and community support.",
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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${fontLanding.variable} ${fontLandingDisplay.variable} antialiased`}
      >
        <AuthProvider>
          <ThemeProvider>
            <RoleProvider>
              {children}
              <Toaster />
              <CustomToaster />
            </RoleProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
