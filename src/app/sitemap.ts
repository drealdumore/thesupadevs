import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/client';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://thesupadevs.vercel.app';
  const supabase = createClient();

  // Get all categories and subcategories
  const [categoriesRes, subcategoriesRes] = await Promise.all([
    supabase.from('categories').select('name, created_at'),
    supabase.from('subcategories').select('name, category_id, created_at').limit(100)
  ]);

  const categories = categoriesRes.data || [];
  const subcategories = subcategoriesRes.data || [];

  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    }
  ];

  // Add category pages
  categories.forEach((category) => {
    routes.push({
      url: `${baseUrl}/category/${category.name}`,
      lastModified: new Date(category.created_at),
      changeFrequency: 'weekly',
      priority: 0.8,
    });

    // Add subcategory pages for this category
    const categorySubcategories = subcategories.filter(
      sub => sub.category_id === category.name
    );
    
    categorySubcategories.forEach((subcategory) => {
      routes.push({
        url: `${baseUrl}/category/${category.name}?subcategory=${encodeURIComponent(subcategory.name)}`,
        lastModified: new Date(subcategory.created_at),
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    });
  });

  return routes;
}