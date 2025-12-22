import { unstable_cache } from "next/cache";
import { createCacheClient } from "@/lib/supabase/server";

// Cache tags for revalidation
export const CACHE_TAGS = {
  RESOURCES: "resources",
  CATEGORIES: "categories",
  SUBCATEGORIES: "subcategories",
} as const;

// Cache durations (in seconds)
export const CACHE_DURATIONS = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
} as const;

// Cached data fetchers
export const getCachedResources = unstable_cache(
  async () => {
    const supabase = createCacheClient();
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },
  ["resources"],
  {
    tags: [CACHE_TAGS.RESOURCES],
    revalidate: CACHE_DURATIONS.MEDIUM,
  }
);

export const getCachedCategories = unstable_cache(
  async () => {
    const supabase = createCacheClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (error) throw error;
    return data || [];
  },
  ["categories"],
  {
    tags: [CACHE_TAGS.CATEGORIES],
    revalidate: CACHE_DURATIONS.LONG,
  }
);

export const getCachedSubcategories = unstable_cache(
  async () => {
    const supabase = createCacheClient();
    const { data, error } = await supabase
      .from("subcategories")
      .select("*")
      .order("name");

    if (error) throw error;
    return data || [];
  },
  ["subcategories"],
  {
    tags: [CACHE_TAGS.SUBCATEGORIES],
    revalidate: CACHE_DURATIONS.LONG,
  }
);

export const getCachedResourcesByCategory = unstable_cache(
  async (categoryName: string) => {
    const supabase = createCacheClient();
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .eq("status", "approved")
      .eq("category", categoryName)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },
  ["resources-by-category"],
  {
    tags: [CACHE_TAGS.RESOURCES],
    revalidate: CACHE_DURATIONS.MEDIUM,
  }
);

export const getCachedResourcesBySubcategory = unstable_cache(
  async (categoryName: string, subcategoryName: string) => {
    const supabase = createCacheClient();
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .eq("status", "approved")
      .eq("category", categoryName)
      .eq("subcategory", subcategoryName)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },
  ["resources-by-subcategory"],
  {
    tags: [CACHE_TAGS.RESOURCES],
    revalidate: CACHE_DURATIONS.MEDIUM,
  }
);

// Helper function to get all home page data in one go
export const getCachedHomePageData = unstable_cache(
  async () => {
    const [resources, categories, subcategories] = await Promise.all([
      getCachedResources(),
      getCachedCategories(),
      getCachedSubcategories(),
    ]);

    return {
      resources,
      categories,
      subcategories,
      resourceCount: resources.length,
      categoryCount: categories.length,
    };
  },
  ["home-page-data"],
  {
    tags: [
      CACHE_TAGS.RESOURCES,
      CACHE_TAGS.CATEGORIES,
      CACHE_TAGS.SUBCATEGORIES,
    ],
    revalidate: CACHE_DURATIONS.MEDIUM,
  }
);
