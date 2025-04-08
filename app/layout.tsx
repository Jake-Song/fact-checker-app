import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// Components
import Navigation from './components/Navigation';
import { Providers } from './providers';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fact Checker",
  description: "A platform for fact-checking and verification",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Navigation />
          {children}
        </Providers>
      </body>
    </html>
  );
}
