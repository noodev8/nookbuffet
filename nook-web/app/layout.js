import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "./components/Navigation";

// Configure the main Geist font for body text
// This creates CSS variables that can be used throughout the app
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Configure the Geist Mono font for code/monospace text
// This creates CSS variables for monospace typography
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// SEO metadata that appears in browser tabs and search results
// This is applied to all pages unless overridden
export const metadata = {
  title: "The Nook Buffet",
  description: "Fresh, customizable sandwich buffets for workplace dining",
};

// Root Layout Component - wraps around every page in the application
// This is required in Next.js App Router and must include <html> and <body>
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Additional head elements can be added here if needed */}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Navigation component appears on every page */}
        <Navigation />
        
        {/* This is where individual page content gets rendered */}
        {/* Each page (home, menu, about, etc.) appears here */}
        {children}
      </body>
    </html>
  );
}

