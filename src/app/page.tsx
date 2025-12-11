import { Metadata } from "next";
import { createClient } from "@/lib/supabase/client";
import HomePageClient from "./HomePageClient";

export async function generateMetadata(): Promise<Metadata> {
  const supabase = createClient();
  
  // Get dynamic counts for SEO
  const [resourcesRes, categoriesRes] = await Promise.all([
    supabase.from("resources").select("id", { count: "exact" }).eq("status", "approved"),
    supabase.from("categories").select("id", { count: "exact" })
  ]);

  const resourceCount = resourcesRes.count || 1000;
  const categoryCount = categoriesRes.count || 8;

  return {
    title: "TheSupaDevs - Curated Developer Resources & Tools Library",
    description: `Discover ${resourceCount}+ curated developer resources across ${categoryCount} categories. Frontend frameworks, backend tools, DevOps solutions, design resources, and more. Everything developers need to build better software faster.`,
    keywords: [
      "developer resources", "programming tools", "web development resources", 
      "react resources", "nextjs tools", "typescript libraries", "javascript frameworks",
      "python tools", "devops resources", "frontend development", "backend development",
      "fullstack resources", "design tools", "ui component libraries", "developer productivity",
      "coding resources", "software development tools", "thesupadevs", "curated resources"
    ],
    openGraph: {
      title: `TheSupaDevs - ${resourceCount}+ Curated Developer Resources`,
      description: `Discover ${resourceCount}+ curated developer resources across ${categoryCount} categories. From React frameworks to DevOps tools - everything developers need.`,
      type: "website",
      url: "https://thesupadevs.vercel.app",
      siteName: "TheSupaDevs",
      images: [{
        url: "/og-home.png",
        width: 1200,
        height: 630,
        alt: `TheSupaDevs - ${resourceCount}+ Curated Developer Resources`
      }]
    },
    twitter: {
      card: "summary_large_image",
      title: `TheSupaDevs - ${resourceCount}+ Curated Developer Resources`,
      description: `Discover ${resourceCount}+ curated developer resources across ${categoryCount} categories for modern web development.`,
      images: ["/og-home.png"]
    },
    alternates: {
      canonical: "https://thesupadevs.vercel.app"
    },
    other: {
      "application-name": "TheSupaDevs",
      "apple-mobile-web-app-title": "TheSupaDevs"
    }
  };
}

export default function Home() {
  return <HomePageClient />;
}