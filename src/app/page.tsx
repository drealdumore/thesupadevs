import { Metadata } from "next";
import { createClient } from "@/lib/supabase/client";
import HomePageClient from "./HomePageClient";

export const metadata: Metadata = {
  title: "TheSupaDevs - Stop searching everywhere. Start building.",
  description:
    "A curated collection of tools, libraries, and resources for developers. Explore Frontend, Backend, DevOps, Design tools and more.",
  keywords: [
    "developer resources",
    "programming tools",
    "web development",
    "frontend",
    "backend",
    "devops",
    "design tools",
    "TheSupaDevs",
  ],
  openGraph: {
    title: "TheSupaDevs - Developer Resource Library",
    description:
      "Discover curated developer resources, tools, and libraries. From Frontend frameworks to DevOps tools - everything developers need.",
    type: "website",
    siteName: "TheSupaDevs",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TheSupaDevs - Developer Resources",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TheSupaDevs - Developer Resource Library",
    description:
      "Discover curated developer resources, tools, and libraries for modern web development.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return <HomePageClient />;
}
