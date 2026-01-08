import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Configure the main Geist font for body text
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Configure the Geist Mono font for code/monospace text
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// SEO metadata
export const metadata = {
  title: "Nook Admin Portal",
  description: "Admin portal for managing Nook Buffet orders",
};

// Root Layout Component
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

