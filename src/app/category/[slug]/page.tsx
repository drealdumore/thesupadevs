"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ResourceCard } from "@/components/resource-card";
import { createClient } from "@/lib/supabase/client";
import type { Resource, Category } from "@/lib/types/database";

import { notFound } from "next/navigation";
import { AddResourceModal } from "@/components/add-resource-modal";
import { Button } from "@/components/ui/button";
import { Plus, ChevronRight, ArrowRight, TrendingUp } from "lucide-react";
import Link from "next/link";

const subcategories: Record<Category, string[]> = {
  Frontend: ["Motion", "State Management", "Styling", "UI Libraries", "Forms"],
  Backend: ["APIs", "Databases", "Authentication", "Serverless", "ORMs"],
  Fullstack: ["Frameworks", "Boilerplates", "CMS", "Hosting"],
  DevOps: ["CI/CD", "Containers", "Monitoring", "Cloud", "Version Control"],
  Design: ["Prototyping", "Icons", "Colors", "Fonts", "Illustrations"],
  Tools: ["Editors", "Extensions", "CLI", "Package Managers", "Testing"],
  Learning: ["Documentation", "Tutorials", "Courses", "Books", "Blogs"],
};

const categoryInfo: Record<Category, { title: string; description: string }> = {
  Frontend: {
    title: "Frontend",
    description:
      "A growing collection of frontend components, libraries, and tools built with React, Vue, Angular and more.",
  },
  Backend: {
    title: "Backend",
    description:
      "A curated collection of backend tools, APIs, databases, and serverless solutions for modern development.",
  },
  Fullstack: {
    title: "Fullstack",
    description:
      "Complete application frameworks and boilerplates for rapid full-stack development.",
  },
  DevOps: {
    title: "DevOps",
    description:
      "Essential DevOps tools for CI/CD, containers, monitoring, and cloud infrastructure.",
  },
  Design: {
    title: "Design",
    description:
      "Design resources including UI/UX tools, icons, colors, fonts, and illustrations.",
  },
  Tools: {
    title: "Tools",
    description:
      "Development utilities, editors, extensions, CLI tools, and testing frameworks.",
  },
  Learning: {
    title: "Learning",
    description:
      "Educational resources including documentation, tutorials, courses, and books.",
  },
};

export default function CategoryPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ subcategory?: string }> }) {
  return <CategoryPageWrapper params={params} searchParams={searchParams} />;
}

function CategoryPageWrapper({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ subcategory?: string }> }) {
  const [resolvedParams, setResolvedParams] = useState<{ slug: string } | null>(null);
  const [resolvedSearchParams, setResolvedSearchParams] = useState<{ subcategory?: string } | null>(null);

  useEffect(() => {
    Promise.all([params, searchParams]).then(([p, sp]) => {
      setResolvedParams(p);
      setResolvedSearchParams(sp);
    });
  }, [params, searchParams]);

  if (!resolvedParams || !resolvedSearchParams) {
    return <div>Loading...</div>;
  }

  const category = resolvedParams.slug as Category;
  const info = categoryInfo[category];

  if (!info) {
    notFound();
  }

  return <CategoryPageClient category={category} info={info} subcategory={resolvedSearchParams.subcategory} />;
}

function CategoryPageClient({ category, info, subcategory }: { category: Category; info: { title: string; description: string }; subcategory?: string }) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResources() {
      try {
        const supabase = createClient();
        let query = supabase
          .from("resources")
          .select("*")
          .eq("status", "approved")
          .eq("category", category);
        
        if (subcategory) {
          query = query.eq("subcategory", subcategory);
        }
        
        const { data, error } = await query.order("created_at", { ascending: false });

        if (error) throw error;
        setResources(data || []);
      } catch (error) {
        console.error("Error fetching resources:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchResources();
  }, [category, subcategory]);

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
          {info.title}
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
          {subcategory || info.title}
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          {subcategory
            ? `${info.title} resources in the ${subcategory} category`
            : info.description}
        </p>
      </motion.div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(subcategory ? 6 : subcategories[category].length)].map(
            (_, i) => (
              <div
                key={i}
                className={`bg-muted/30 animate-pulse rounded-lg ${
                  subcategory ? "h-48" : "h-20"
                }`}
              />
            )
          )}
        </div>
      ) : !subcategory ? (
        // Show subcategory cards when no subcategory is selected
        <motion.div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {subcategories[category].map((subcat, index) => {
            const count = resources.filter(
              (r) => r.subcategory === subcat
            ).length;
            const resourcesInSubcat = resources
              .filter((r) => r.subcategory === subcat)
              .slice(0, 3);

            return count === 0 ? (
              <motion.div
                key={subcat}
                className="group flex items-center justify-between p-4 rounded-lg border bg-muted/20 border-dashed opacity-60 hover:opacity-80 transition-opacity"
                title="No resources yet - be the first to add one!"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex-1">
                  <h3 className="font-medium text-sm mb-1">{subcat}</h3>
                  <p className="text-xs text-muted-foreground">
                    Be the first! 🎆
                  </p>
                </div>
                <Plus className="h-4 w-4 text-muted-foreground/50" />
              </motion.div>
            ) : (
              <motion.div
                key={subcat}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href={`/category/${category}?subcategory=${encodeURIComponent(
                    subcat
                  )}`}
                  className="group relative flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 hover:border-foreground/40 transition-all duration-200 hover:shadow-sm block"
                  title={resourcesInSubcat.map((r) => r.name).join(", ")}
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-sm mb-1">{subcat}</h3>
                    <p className="text-xs text-muted-foreground">
                      {count} {count === 1 ? "resource" : "resources"}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all duration-200" />
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      ) : resources.length === 0 ? (
        <motion.div
          className="flex flex-col items-center justify-center py-20 text-center space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p className="text-lg text-muted-foreground">
            No resources found in this {subcategory} subcategory yet.
          </p>
          <p className="text-sm text-muted-foreground">
            Be the first to add one!
          </p>
        </motion.div>
      ) : (
        <motion.div
          className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
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

      <motion.div
        className="pt-12 text-center space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <h2 className="font-heading text-2xl font-semibold">
          Didn't find what you were looking for?
        </h2>
        <AddResourceModal>
          <Button className="gap-2 rounded-full">
            <Plus className="h-4 w-4" />
            Add Resource
          </Button>
        </AddResourceModal>
      </motion.div>
    </motion.main>
  );
}
