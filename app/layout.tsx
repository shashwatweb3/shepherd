import type { Metadata } from "next";
import localFont from "next/font/local";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Shepherd — Keep your vibe-coded app alive",
  description:
    "You vibe-coded it. Shepherd keeps it alive. Free survival scan for any public GitHub repo — exposed secrets, broken auth, dependency rot, with evidence and fixes.",
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
      <body className={`${geistSans.variable} bg-cream font-sans text-ink antialiased`}>
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
