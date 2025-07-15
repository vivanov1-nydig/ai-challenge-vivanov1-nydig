import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Revolution Chat",
  description: "Brutalist propaganda-style chat UI powered by Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
