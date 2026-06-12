import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Shepherd — Keep your vibe-coded app alive",
  description: "You vibe-coded it. Shepherd keeps it alive. Free survival scan for any public GitHub repo.",
  openGraph: {
    title: "Shepherd — Keep your vibe-coded app alive",
    description: "You vibe-coded it. Shepherd keeps it alive.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} font-sans antialiased bg-[#FAFAF7] text-[#111]`}>
        {children}
      </body>
    </html>
  );
}
