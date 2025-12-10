import type { Metadata } from "next";
import "./globals.css";
import ClientBody from "./ClientBody";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "DevVault - Discover & Share Developer Resources",
  description:
    "A curated collection of tools, libraries, and resources for developers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className="antialiased font-sans">
        <ThemeProvider>
          <ClientBody>
            <Header />
            <main className="grow">{children}</main>
            <Toaster position="top-center" richColors />
          </ClientBody>
        </ThemeProvider>
      </body>
    </html>
  );
}
