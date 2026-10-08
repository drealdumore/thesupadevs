import { Metadata } from "next";
import { createClient } from "@/lib/supabase/client";
import { notFound } from "next/navigation";
import CategoryPageClient from "../CategoryPageClient";

type Props = {
  params: Promise<{ slug: string; subcategory: string }>;
};

/** Match a URL slug back to a DB subcategory name */
async function resolveSubcategory(
  categoryId: string,
  subcategorySlug: string,
  supabase: ReturnType<typeof createClient>
): Promise<string | null> {
  const { data } = await supabase
    .from("subcategories")
    .select("name")
    .eq("category_id", categoryId);

  if (!data) return null;

  const decoded = decodeURIComponent(subcategorySlug);
  // Find exact match after applying the same slugify transform
  return (
    data.find(
      (s) => s.name.replace(/\//g, "-").replace(/\s+/g, "-") === decoded
    )?.name ?? null
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, subcategory: subcategorySlug } = await params;

  const supabase = createClient();
  const { data: categoryData, error } = await supabase
    .from("categories")
    .select("*")
    .eq("name", slug)
    .single();

  if (error || !categoryData) {
    return {
      title: "Category Not Found | TheSupaDevs",
      description: "The requested developer resource category could not be found.",
      robots: { index: false, follow: false },
    };
  }

  const subcategory = await resolveSubcategory(categoryData.id, subcategorySlug, supabase);
  if (!subcategory) return { title: "Not Found | TheSupaDevs", robots: { index: false, follow: false } };

  const baseTitle = `${subcategory} Resources - ${categoryData.name} Tools & Libraries`;
  const title = `${baseTitle} | TheSupaDevs`;
  const description = `Discover the best ${subcategory} resources for ${categoryData.name} development. Curated tools, libraries, frameworks, and guides.`;
  const canonical = `https://thesupadevs.vercel.app/category/${slug}/${subcategorySlug}`;

  return {
    title,
    description,
    openGraph: {
      title: baseTitle,
      description,
      type: "website",
      url: canonical,
      siteName: "TheSupaDevs",
      images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: `${baseTitle} - TheSupaDevs` }],
    },
    twitter: {
      card: "summary_large_image",
      title: baseTitle,
      description: description.slice(0, 160),
      images: ["/opengraph-image.png"],
    },
    alternates: { canonical },
  };
}

export default async function SubcategoryPage({ params }: Props) {
  const { slug, subcategory: subcategorySlug } = await params;

  const supabase = createClient();
  const { data: categoryData, error } = await supabase
    .from("categories")
    .select("*")
    .eq("name", slug)
    .single();

  if (error || !categoryData) notFound();

  const subcategory = await resolveSubcategory(categoryData.id, subcategorySlug, supabase);
  if (!subcategory) notFound();

  return (
    <CategoryPageClient
      category={slug}
      categoryData={categoryData}
      subcategory={subcategory}
    />
  );
}
