import type { Metadata } from "next";
import "./globals.css";
import ClientBody from "./ClientBody";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { Toaster } from "sonner";

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
    images: [{
      url: "/opengraph-image.png",
      width: 1200,
      height: 630,
      alt: "TheSupaDevs - Curated Developer Resources Library"
    }]
  },
  twitter: {
    card: "summary_large_image",
    site: "@drealdumore",
    creator: "@drealdumore",
    title: "TheSupaDevs - Curated Developer Resources & Tools Library",
    description:
      "Discover 1000+ curated developer resources, tools, libraries, and guides for modern web development.",
    images: ["/opengraph-image.png"]
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
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
  },
  alternates: {
    canonical: "https://thesupadevs.vercel.app",
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
  },
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
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Sora:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>

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
