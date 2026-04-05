import type { Metadata } from "next";
import "./globals.css";
import { Sidebar, Header } from "@/components/layout";

export const metadata: Metadata = {
  title: "Command Center",
  description: "Borne Systems Command Center - Business dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-[var(--bg-base)] text-[var(--text-primary)] antialiased">
        <Sidebar />
        <Header />
        <main 
          className="min-h-screen pt-14" 
          style={{ marginLeft: '240px' }}
        >
          <div className="p-6">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}