import type { Metadata } from "next";
import "./globals.css";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: `${brand.name} – ${brand.tagline}`,
  description: brand.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
