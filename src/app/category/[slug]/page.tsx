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
  const { data: categoryData, error } = await supabase
    .from("categories")
    .select("*")
    .eq("name", slug)
    .single();

  if (error) {
    console.error("Supabase error fetching category metadata:", error);
    throw new Error("Failed to fetch category metadata");
  }

  if (!categoryData) {
    return {
      title: "Category Not Found | TheSupaDevs",
      description: "The requested category could not be found.",
    };
  }

  const title = subcategory
    ? `${subcategory} - ${categoryData.name} Resources | TheSupaDevs`
    : `${categoryData.name} Resources | TheSupaDevs`;

  const description = subcategory
    ? `Discover curated ${categoryData.name} resources in ${subcategory}. Tools, libraries, and guides for developers.`
    : categoryData.description ||
      `Explore ${categoryData.name} resources and tools for developers.`;

  return {
    title,
    description,
    keywords: [
      `${categoryData.name.toLowerCase()}`,
      "developer resources",
      "tools",
      "libraries",
      "TheSupaDevs",
    ],
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "TheSupaDevs",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: `${categoryData.name} Resources - TheSupaDevs`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
    },
    alternates: {
      canonical: subcategory
        ? `/category/${slug}?subcategory=${encodeURIComponent(subcategory)}`
        : `/category/${slug}`,
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

  if (error) {
    console.error("Supabase error fetching category:", error);
    throw new Error("Failed to fetch category");
  }

  if (!categoryData) {
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
