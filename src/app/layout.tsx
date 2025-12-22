import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";
import ClientBody from "./ClientBody";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { Toaster } from "sonner";

const sora = Sora({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sora",
  fallback: [
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "sans-serif",
  ],
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://thesupadevs.vercel.app"),
  title: {
    default: "TheSupaDevs - Curated Developer Resources & Tools Library",
    template: "%s | TheSupaDevs",
  },
  description:
    "Discover 1000+ curated developer resources, tools, libraries, and guides. From React frameworks to DevOps tools - everything developers need to build better software faster.",
  keywords: [
    "developer resources",
    "programming tools",
    "web development",
    "react",
    "nextjs",
    "typescript",
    "javascript",
    "python",
    "devops",
    "frontend",
    "backend",
    "fullstack",
    "design tools",
    "ui libraries",
    "developer productivity",
    "coding resources",
    "software development",
    "thesupadevs",
    "supabase",
  ],
  authors: [{ name: "Samuel Isah", url: "https://x.com/drealdumore" }],
  creator: "Samuel Isah",
  publisher: "Samuel Isah",
  category: "Technology",
  classification: "Developer Tools",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://thesupadevs.vercel.app",
    siteName: "TheSupaDevs",
    title: "TheSupaDevs - Curated Developer Resources & Tools Library",
    description:
      "Discover 1000+ curated developer resources, tools, libraries, and guides. From React frameworks to DevOps tools - everything developers need.",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "TheSupaDevs - Curated Developer Resources Library",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@drealdumore",
    creator: "@drealdumore",
    title: "TheSupaDevs - Curated Developer Resources & Tools Library",
    description:
      "Discover 1000+ curated developer resources, tools, libraries, and guides for modern web development.",
    images: ["/opengraph-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://thesupadevs.vercel.app",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.json",
  other: {
    "theme-color": "#000000",
    "color-scheme": "dark",
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`dark ${sora.variable}`}
    >
      <body className={`antialiased font-sans`}>
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
