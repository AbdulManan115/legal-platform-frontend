import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LegalConnect — Find. Book. Manage.",
  description:
    "Find verified advocates, book legal consultations, and manage your legal matters in one platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
