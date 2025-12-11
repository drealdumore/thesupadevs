import { Metadata } from "next";
import { createClient } from "@/lib/supabase/client";
import { notFound } from "next/navigation";
import CategoryPageClient from "./CategoryPageClient";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ subcategory?: string }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { slug } = await params;
  const { subcategory } = await searchParams;

  const supabase = createClient();

  // Get category data and resource counts
  const [categoryRes, resourceCountRes, subcategoriesRes] = await Promise.all([
    supabase.from("categories").select("*").eq("name", slug).single(),
    supabase
      .from("resources")
      .select("id", { count: "exact" })
      .eq("status", "approved")
      .eq("category", slug),
    supabase
      .from("subcategories")
      .select("name")
      .eq("category_id", "")
      .limit(5),
  ]);

  if (categoryRes.error || !categoryRes.data) {
    return {
      title: "Category Not Found | TheSupaDevs",
      description:
        "The requested developer resource category could not be found.",
      robots: { index: false, follow: false },
    };
  }

  const categoryData = categoryRes.data;
  const resourceCount = resourceCountRes.count || 0;

  // Enhanced titles and descriptions
  const baseTitle = subcategory
    ? `${subcategory} Resources - ${categoryData.name} Tools & Libraries`
    : `${categoryData.name} Resources - ${resourceCount}+ Curated Tools & Libraries`;

  const title = `${baseTitle} | TheSupaDevs`;

  const baseDescription = subcategory
    ? `Discover the best ${subcategory} resources for ${categoryData.name} development. Curated tools, libraries, frameworks, and guides to accelerate your ${subcategory} projects.`
    : `Explore ${resourceCount}+ curated ${categoryData.name} resources. Tools, libraries, frameworks, and guides for ${categoryData.name} development. Updated daily by developers, for developers.`;

  // Category-specific keywords
  const categoryKeywords = {
    Frontend: [
      "react",
      "vue",
      "angular",
      "svelte",
      "css",
      "html",
      "javascript",
      "typescript",
      "ui components",
      "frontend frameworks",
    ],
    Backend: [
      "nodejs",
      "python",
      "java",
      "golang",
      "rust",
      "apis",
      "databases",
      "servers",
      "backend frameworks",
      "microservices",
    ],
    DevOps: [
      "docker",
      "kubernetes",
      "ci/cd",
      "aws",
      "azure",
      "gcp",
      "monitoring",
      "deployment",
      "infrastructure",
      "automation",
    ],
    Design: [
      "figma",
      "sketch",
      "adobe",
      "ui design",
      "ux design",
      "prototyping",
      "design systems",
      "icons",
      "fonts",
      "colors",
    ],
    Tools: [
      "vscode",
      "git",
      "npm",
      "webpack",
      "vite",
      "eslint",
      "prettier",
      "testing",
      "debugging",
      "productivity",
    ],
    Learning: [
      "tutorials",
      "courses",
      "documentation",
      "books",
      "videos",
      "blogs",
      "guides",
      "examples",
      "best practices",
    ],
  };

  const keywords = [
    `${categoryData.name.toLowerCase()} resources`,
    `${categoryData.name.toLowerCase()} tools`,
    `${categoryData.name.toLowerCase()} libraries`,
    ...(categoryKeywords[categoryData.name as keyof typeof categoryKeywords] ||
      []),
    "developer resources",
    "programming tools",
    "thesupadevs",
  ];

  if (subcategory) {
    keywords.unshift(
      subcategory.toLowerCase(),
      `${subcategory.toLowerCase()} tools`
    );
  }

  return {
    title,
    description: baseDescription,
    keywords,
    openGraph: {
      title: baseTitle,
      description: baseDescription,
      type: "website",
      url: subcategory
        ? `https://thesupadevs.vercel.app/category/${slug}?subcategory=${encodeURIComponent(
            subcategory
          )}`
        : `https://thesupadevs.vercel.app/category/${slug}`,
      siteName: "TheSupaDevs",
      images: [{
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: `${baseTitle} - TheSupaDevs`
      }]
    },
    twitter: {
      card: "summary_large_image",
      title: baseTitle,
      description: baseDescription.slice(0, 160),
      images: ["/opengraph-image.png"]
    },
    alternates: {
      canonical: subcategory
        ? `https://thesupadevs.vercel.app/category/${slug}?subcategory=${encodeURIComponent(
            subcategory
          )}`
        : `https://thesupadevs.vercel.app/category/${slug}`,
    },
    other: {
      "article:section": categoryData.name,
      "article:tag": keywords.join(", "),
    },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { subcategory } = await searchParams;

  const supabase = createClient();
  const { data: categoryData, error } = await supabase
    .from("categories")
    .select("*")
    .eq("name", slug)
    .single();

  if (error || !categoryData) {
    notFound();
  }

  return (
    <CategoryPageClient
      category={slug}
      categoryData={categoryData}
      subcategory={subcategory}
    />
  );
}
