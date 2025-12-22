import { Metadata } from "next";
import HomePageClient from "./HomePageClient";
import { getCachedHomePageData } from "@/lib/cache";

// Enable ISR - revalidate every 5 minutes
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const { resourceCount, categoryCount } = await getCachedHomePageData();

  return {
    title: "TheSupaDevs - Curated Developer Resources & Tools Library",
    description: `Discover ${resourceCount}+ curated developer resources across ${categoryCount} categories. Frontend frameworks, backend tools, DevOps solutions, design resources, and more. Everything developers need to build better software faster.`,
    keywords: [
      "developer resources",
      "programming tools",
      "web development resources",
      "react resources",
      "nextjs tools",
      "typescript libraries",
      "javascript frameworks",
      "python tools",
      "devops resources",
      "frontend development",
      "backend development",
      "fullstack resources",
      "design tools",
      "ui component libraries",
      "developer productivity",
      "coding resources",
      "software development tools",
      "thesupadevs",
      "curated resources",
    ],
    openGraph: {
      title: `TheSupaDevs - ${resourceCount}+ Curated Developer Resources`,
      description: `Discover ${resourceCount}+ curated developer resources across ${categoryCount} categories. From React frameworks to DevOps tools - everything developers need.`,
      type: "website",
      url: "https://thesupadevs.vercel.app",
      siteName: "TheSupaDevs",
    },
    twitter: {
      card: "summary_large_image",
      title: `TheSupaDevs - ${resourceCount}+ Curated Developer Resources`,
      description: `Discover ${resourceCount}+ curated developer resources across ${categoryCount} categories for modern web development.`,
    },
    alternates: {
      canonical: "https://thesupadevs.vercel.app",
    },
    other: {
      "application-name": "TheSupaDevs",
      "apple-mobile-web-app-title": "TheSupaDevs",
    },
  };
}

export default async function Home() {
  const { resources, categories, subcategories } =
    await getCachedHomePageData();

  return (
    <HomePageClient
      initialResources={resources}
      initialCategories={categories}
      initialSubcategories={subcategories}
    />
  );
}
