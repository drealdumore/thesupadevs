import type { Metadata } from "next";
import "./globals.css";
import ClientBody from "./ClientBody";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "TheSupaDev - Discover & Share Developer Resources",
  description: "A curated collection of tools, libraries, and resources for developers. Built by developers, for developers.",
  keywords: ["developer resources", "tools", "libraries", "programming", "thesupadev"],
  authors: [{ name: "TheSupaDev" }],
  openGraph: {
    title: "TheSupaDev - Developer Resource Library",
    description: "A curated collection of tools, libraries, and resources for developers. Built by developers, for developers.",
    type: "website",
    siteName: "TheSupaDev",
    images: [{
      url: "/og-image.png",
      width: 1200,
      height: 630,
      alt: "TheSupaDev - Developer Resources"
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "TheSupaDev - Developer Resource Library",
    description: "A curated collection of tools, libraries, and resources for developers.",
    images: ["/og-image.png"]
  },
  robots: {
    index: true,
    follow: true
  }
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
