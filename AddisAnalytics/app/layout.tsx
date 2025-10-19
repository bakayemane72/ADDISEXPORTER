import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ADDIS Enterprise Analytics",
  description: "Fortune-100-grade analytics, shipment tracking, and AI copilots for Ethiopian coffee exporters.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-bg-base text-text-primary font-sans">
        {children}
      </body>
    </html>
  );
}
