"use client";

import React from "react";
import { createClient } from "@/lib/supabase/client";
import type { Resource, Category } from "@/lib/types/database";
import { motion } from "framer-motion";
import {
  Zap,
  ArrowRight,
  Search,
  Code,
  Server,
  Layers,
  Cloud,
  Palette,
  Wrench,
  BookOpen,
  TrendingUp,
  Plus,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { AddResourceModal } from "@/components/add-resource-modal";
import { Button } from "@/components/ui/button";
import { ResourceCard } from "@/components/resource-card";
import { useRef, useState, useEffect } from "react";

const categories: Category[] = [
  "Frontend",
  "Backend",
  "Fullstack",
  "DevOps",
  "Design",
  "Tools",
  "Learning",
];

const categoryIcons: Record<
  Category,
  React.ComponentType<{ className?: string }>
> = {
  Frontend: Code,
  Backend: Server,
  Fullstack: Layers,
  DevOps: Cloud,
  Design: Palette,
  Tools: Wrench,
  Learning: BookOpen,
};

const categoryColors: Record<Category, string> = {
  Frontend: "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800",
  Backend:
    "bg-green-500/10 text-green-600 border-green-200 dark:border-green-800",
  Fullstack:
    "bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-800",
  DevOps:
    "bg-orange-500/10 text-orange-600 border-orange-200 dark:border-orange-800",
  Design: "bg-pink-500/10 text-pink-600 border-pink-200 dark:border-pink-800",
  Tools:
    "bg-yellow-500/10 text-yellow-600 border-yellow-200 dark:border-yellow-800",
  Learning:
    "bg-indigo-500/10 text-indigo-600 border-indigo-200 dark:border-indigo-800",
};

const subcategories: Record<Category, string[]> = {
  Frontend: ["Motion", "State Management", "Styling", "UI Libraries", "Forms"],
  Backend: ["APIs", "Databases", "Authentication", "Serverless", "ORMs"],
  Fullstack: ["Frameworks", "Boilerplates", "CMS", "Hosting"],
  DevOps: ["CI/CD", "Containers", "Monitoring", "Cloud", "Version Control"],
  Design: ["Prototyping", "Icons", "Colors", "Fonts", "Illustrations"],
  Tools: ["Editors", "Extensions", "CLI", "Package Managers", "Testing"],
  Learning: ["Documentation", "Tutorials", "Courses", "Books", "Blogs"],
};

export default function Home() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<Category | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    fetchResources();

    // Keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  async function fetchResources() {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredResources = resources.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const recentResources = resources.slice(0, 6);

  const isRecentlyAdded = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffDays = (now.getTime() - created.getTime()) / (1000 * 3600 * 24);
    return diffDays <= 7;
  };

  const getMostPopularSubcategory = (category: Category) => {
    const counts = subcategories[category].map((subcat) => ({
      subcat,
      count: resources.filter(
        (r) => r.category === category && r.subcategory === subcat
      ).length,
    }));
    return counts.sort((a, b) => b.count - a.count)[0];
  };

  const scrollToCategory = (category: Category) => {
    setActiveCategory(category);
    setTimeout(() => {
      categoryRefs.current[category]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  return (
    <div className="container py-16 space-y-8 md:py-24 md:space-y-12">
      {/* Hero Section */}
      <div className="flex flex-col border-b border-foreground items-center gap-12 lg:flex-row lg:gap-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 text-left"
        >
          <h1 className="mb-6 font-heading text-4xl font-bold tracking-tight text-foreground md:text-6xl">
            The curated{" "}
            <span className="inline-flex shrink-0 rotate-3 items-center justify-center rounded-xl bg-zinc-900 p-2 align-middle text-white dark:bg-white dark:text-black">
              <Zap className="h-6 w-6" fill="currentColor" />
            </span>{" "}
            shelf <br className="hidden lg:block" />
            for developers
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground lg:mx-0">
            A comprehensive collection of buttons, cards, tools, and resources
            for frontend and backend.
          </p>
        </motion.div>
      </div>

      {/* Stats Section */}
      {/* {!loading && (
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="text-center p-4 rounded-lg border bg-card">
            <div className="text-2xl font-bold font-heading">
              {resources.length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Resources</div>
          </div>
          <div className="text-center p-4 rounded-lg border bg-card">
            <div className="text-2xl font-bold font-heading">
              {categories.length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Categories</div>
          </div>
          <div className="text-center p-4 rounded-lg border bg-card">
            <div className="text-2xl font-bold font-heading">
              {Object.values(subcategories).flat().length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Topics</div>
          </div>
        </div>
      )} */}

      {/* Search Bar */}
      <motion.div
        className="max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search resources... (Press / to focus)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 h-12"
          />
          {searchQuery && (
            <motion.button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="h-4 w-4" />
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Category Filter Buttons */}
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="flex flex-wrap justify-center gap-2 md:gap-3">
          <motion.button
            onClick={() => setActiveCategory("All")}
            className={`rounded-full border px-5 py-3 text-sm font-semibold tracking-wide transition-all duration-200 md:px-6 md:py-2 md:text-sm flex items-center gap-2 min-h-[44px] md:min-h-[36px] ${
              activeCategory === "All"
                ? "border-foreground bg-foreground text-background shadow-lg"
                : "border-border bg-card text-foreground hover:border-foreground/40 hover:bg-muted/50 hover:shadow-md"
            }`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            All
          </motion.button>
          {categories.map((category, index) => {
            const Icon = categoryIcons[category];
            const count = resources.filter(
              (r) => r.category === category
            ).length;
            return (
              <motion.button
                key={category}
                onClick={() =>
                  activeCategory === "All"
                    ? scrollToCategory(category)
                    : setActiveCategory(category)
                }
                className={`rounded-full border px-5 py-3 text-sm font-semibold tracking-wide transition-all duration-200 md:px-6 md:py-2 md:text-sm flex items-center gap-2 min-h-[44px] md:min-h-[36px] relative ${
                  activeCategory === category
                    ? "border-foreground bg-foreground text-background shadow-lg"
                    : "border-border bg-card text-foreground hover:border-foreground/40 hover:bg-muted/50 hover:shadow-md"
                }`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.5 + (index + 1) * 0.05 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="h-4 w-4 md:h-3 md:w-3" />
                {category}
                {count > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/20 text-primary rounded-full">
                    {count}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Subcategory Cards */}
      <div className="space-y-8">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-20 bg-muted/30 animate-pulse rounded-lg"
              />
            ))}
          </div>
        ) : searchQuery ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold font-heading">
              Search Results ({filteredResources.length})
            </h2>
            {filteredResources.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="mx-auto w-24 h-24 bg-muted/30 rounded-full flex items-center justify-center">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">No resources found</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    We couldn't find any resources matching "{searchQuery}". Try
                    a different search term or add this resource yourself!
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="outline" onClick={() => setSearchQuery("")}>
                    Clear Search
                  </Button>
                  <AddResourceModal>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Resource
                    </Button>
                  </AddResourceModal>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {filteredResources.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            )}
          </div>
        ) : activeCategory === "All" ? (
          categories.map((category, categoryIndex) => {
            const popular = getMostPopularSubcategory(category);
            return (
              <motion.div
                key={category}
                className="space-y-4"
                ref={(el) => {
                  categoryRefs.current[category] = el;
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${categoryColors[category]}`}>
                    {React.createElement(categoryIcons[category], {
                      className: "h-5 w-5",
                    })}
                  </div>
                  <h2 className="text-xl font-semibold font-heading">
                    {category}
                  </h2>
                  <span className="px-2 py-1 text-xs bg-muted rounded-full text-muted-foreground">
                    {resources.filter((r) => r.category === category).length}{" "}
                    resources
                  </span>
                </div>
                <motion.div
                  className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    duration: 0.4,
                    delay: categoryIndex * 0.1 + 0.2,
                  }}
                >
                  {subcategories[category].map((subcat, subcatIndex) => {
                    const count = resources.filter(
                      (r) => r.category === category && r.subcategory === subcat
                    ).length;
                    const isPopular =
                      popular && subcat === popular.subcat && popular.count > 5;
                    const resourcesInSubcat = resources
                      .filter(
                        (r) =>
                          r.category === category && r.subcategory === subcat
                      )
                      .slice(0, 3);

                    return count === 0 ? (
                      <motion.div
                        key={subcat}
                        className="group flex items-center justify-between p-4 rounded-lg border bg-muted/20 border-dashed opacity-60 hover:opacity-80 transition-opacity"
                        title="No resources yet - be the first to add one!"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.3,
                          delay: categoryIndex * 0.1 + 0.3 + subcatIndex * 0.05,
                        }}
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
                        transition={{
                          duration: 0.3,
                          delay: categoryIndex * 0.1 + 0.3 + subcatIndex * 0.05,
                        }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Link
                          href={`/category/${category}?subcategory=${encodeURIComponent(
                            subcat
                          )}`}
                          className="group relative flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 hover:border-foreground/40 transition-all duration-200 hover:shadow-sm block"
                          title={resourcesInSubcat
                            .map((r) => r.name)
                            .join(", ")}
                        >
                          {isPopular && (
                            <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                              <TrendingUp className="h-3 w-3" />
                              Popular
                            </div>
                          )}
                          {resourcesInSubcat.some((r) =>
                            isRecentlyAdded(r.created_at)
                          ) && (
                            <div className="absolute -top-2 -left-2 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                              <Sparkles className="h-3 w-3" />
                              New
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="font-medium text-sm mb-1">
                              {subcat}
                            </h3>
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
              </motion.div>
            );
          })
        ) : (
          <div
            className="space-y-4"
            ref={(el) => {
              categoryRefs.current[activeCategory] = el;
            }}
          >
            <h2 className="text-xl font-semibold font-heading">
              {activeCategory}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {subcategories[activeCategory].map((subcat) => {
                const count = resources.filter(
                  (r) =>
                    r.category === activeCategory && r.subcategory === subcat
                ).length;
                const resourcesInSubcat = resources
                  .filter(
                    (r) =>
                      r.category === activeCategory && r.subcategory === subcat
                  )
                  .slice(0, 3);

                return count === 0 ? (
                  <div
                    key={subcat}
                    className="group flex items-center justify-between p-4 rounded-lg border bg-muted/20 border-dashed opacity-60 hover:opacity-80 transition-opacity"
                    title="No resources yet - be the first to add one!"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-sm mb-1">{subcat}</h3>
                      <p className="text-xs text-muted-foreground">
                        Be the first! 🎆
                      </p>
                    </div>
                    <Plus className="h-4 w-4 text-muted-foreground/50" />
                  </div>
                ) : (
                  <Link
                    key={subcat}
                    href={`/category/${activeCategory}?subcategory=${encodeURIComponent(
                      subcat
                    )}`}
                    className="group relative flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 hover:border-foreground/40 transition-all duration-200 hover:shadow-sm"
                    title={resourcesInSubcat.map((r) => r.name).join(", ")}
                  >
                    {resourcesInSubcat.some((r) =>
                      isRecentlyAdded(r.created_at)
                    ) && (
                      <div className="absolute -top-2 -left-2 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                        <Sparkles className="h-3 w-3" />
                        New
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium text-sm mb-1">{subcat}</h3>
                      <p className="text-xs text-muted-foreground">
                        {count} {count === 1 ? "resource" : "resources"}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all duration-200" />
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Recently Added Section */}
      {!loading && !searchQuery && recentResources.length > 0 && (
        <div className="space-y-6 pt-8 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold font-heading">
                Recently Added
              </h2>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recentResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </div>
      )}

      {/* Footer CTA */}
      <div className="pt-12 text-center space-y-4 border-t">
        <h2 className="font-heading text-2xl font-semibold">
          Can't find what you need?
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Help grow the library by submitting your favorite developer resources
        </p>
        <AddResourceModal>
          <Button className="gap-2 rounded-full">
            <Plus className="h-4 w-4" />
            Submit a Resource
          </Button>
        </AddResourceModal>
      </div>
    </div>
  );
}
