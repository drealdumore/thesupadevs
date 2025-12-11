"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ResourceCard } from "@/components/resource-card";
import { createClient } from "@/lib/supabase/client";
import type { Resource } from "@/lib/types/database";
import { Plus, ChevronRight } from "lucide-react";
import Link from "next/link";

type CategoryPageClientProps = {
  category: string;
  categoryData: { id: string; name: string; description?: string };
  subcategory?: string;
};

export default function CategoryPageClient({ category, categoryData, subcategory }: CategoryPageClientProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [subcategories, setSubcategories] = useState<{ id: string; name: string; category_id: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();
        
        let resourceQuery = supabase
          .from("resources")
          .select("*")
          .eq("status", "approved")
          .eq("category", category);
        
        if (subcategory) {
          resourceQuery = resourceQuery.eq("subcategory", subcategory);
        }
        
        const [resourcesRes, subcategoriesRes] = await Promise.all([
          resourceQuery.order("created_at", { ascending: false }),
          supabase.from("subcategories").select("*").order("name")
        ]);

        if (resourcesRes.error) throw resourcesRes.error;
        if (subcategoriesRes.error) throw subcategoriesRes.error;
        
        setResources(resourcesRes.data || []);
        
        const categorySubcategories = subcategoriesRes.data?.filter(
          sub => sub.category_id === categoryData.id
        ) || [];
        setSubcategories(categorySubcategories);
        
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [category, subcategory, categoryData.id]);

  return (
    <motion.main
      className="container py-8 space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.nav
        className="flex items-center gap-2 text-sm text-muted-foreground"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link
          href={`/category/${category}`}
          className="hover:text-foreground transition-colors"
        >
          {categoryData.name}
        </Link>
        {subcategory && (
          <>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">{subcategory}</span>
          </>
        )}
      </motion.nav>

      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h1 className="font-heading text-4xl font-bold tracking-tight md:text-5xl">
          {subcategory || categoryData.name}
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          {subcategory
            ? `${categoryData.name} resources in the ${subcategory} category`
            : categoryData.description || `Explore ${categoryData.name} resources and tools.`}
        </p>
      </motion.div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-20 bg-muted/30 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : !subcategory ? (
        <motion.div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {subcategories.map((subcat, index) => {
            const count = resources.filter(r => r.subcategory === subcat.name).length;

            return count === 0 ? (
              <motion.div
                key={subcat.id}
                className="group flex items-center justify-between p-4 rounded-lg border bg-muted/20 border-dashed opacity-60 hover:opacity-80 transition-opacity"
                title="No resources yet - be the first to add one!"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex-1">
                  <h3 className="font-medium text-sm mb-1">{subcat.name}</h3>
                  <p className="text-xs text-muted-foreground">Be the first! 🎆</p>
                </div>
                <Plus className="h-4 w-4 text-muted-foreground/50" />
              </motion.div>
            ) : (
              <motion.div
                key={subcat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href={`/category/${category}?subcategory=${encodeURIComponent(subcat.name)}`}
                  className="group relative flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 hover:border-foreground/40 transition-all duration-200 hover:shadow-sm block"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-sm mb-1">{subcat.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {count} {count === 1 ? "resource" : "resources"}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {resources.map((resource, index) => (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
            >
              <ResourceCard resource={resource} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.main>
  );
}