"use client";

import React from "react";
import { createClient } from "@/lib/supabase/client";
import type { Resource, Category } from "@/lib/types/database";
import { motion } from "framer-motion";
import {
  ArrowRight,
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
  Search,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ResourceCard } from "@/components/resource-card";
import { AddResourceModal } from "@/components/add-resource-modal";
import { useRef, useState, useEffect } from "react";

// Import new components
import { HeroSection } from "@/components/home/HeroSection";
import { SearchBar } from "@/components/home/SearchBar";
import { CategoryFilters } from "@/components/home/CategoryFilters";
import { RecentlyAdded } from "@/components/home/RecentlyAdded";
import { FooterCTA } from "@/components/home/FooterCTA";

type CategoryData = {
  id: string;
  name: string;
  created_at: string;
};

type SubcategoryData = {
  id: string;
  name: string;
  category_id: string;
  created_at: string;
};

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Frontend: Code,
  Backend: Server,
  Fullstack: Layers,
  DevOps: Cloud,
  Design: Palette,
  Tools: Wrench,
  Learning: BookOpen,
  Wallpaper: Sparkles,
};

const categoryColors: Record<string, string> = {
  Frontend: "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800",
  Backend: "bg-green-500/10 text-green-600 border-green-200 dark:border-green-800",
  Fullstack: "bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-800",
  DevOps: "bg-orange-500/10 text-orange-600 border-orange-200 dark:border-orange-800",
  Design: "bg-pink-500/10 text-pink-600 border-pink-200 dark:border-pink-800",
  Tools: "bg-yellow-500/10 text-yellow-600 border-yellow-200 dark:border-yellow-800",
  Learning: "bg-indigo-500/10 text-indigo-600 border-indigo-200 dark:border-indigo-800",
  Wallpaper: "bg-teal-500/10 text-teal-600 border-teal-200 dark:border-teal-800",
};

export default function Home() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [subcategories, setSubcategories] = useState<SubcategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    fetchResources();
    fetchCategories();

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

  async function fetchCategories() {
    try {
      const supabase = createClient();
      const [categoriesRes, subcategoriesRes] = await Promise.all([
        supabase.from("categories").select("*").order("name"),
        supabase.from("subcategories").select("*").order("name")
      ]);

      if (categoriesRes.error) throw categoriesRes.error;
      if (subcategoriesRes.error) throw subcategoriesRes.error;

      setCategories(categoriesRes.data || []);
      setSubcategories(subcategoriesRes.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }

  const getSubcategoriesForCategory = (categoryName: string) => {
    const category = categories.find(c => c.name === categoryName);
    if (!category) return [];
    return subcategories.filter(sub => sub.category_id === category.id);
  };

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

  const getMostPopularSubcategory = (categoryName: string) => {
    const categorySubcategories = getSubcategoriesForCategory(categoryName);
    const counts = categorySubcategories.map((subcat) => ({
      subcat: subcat.name,
      count: resources.filter(
        (r) => r.category === categoryName && r.subcategory === subcat.name
      ).length,
    }));
    return counts.sort((a, b) => b.count - a.count)[0];
  };

  const scrollToCategory = (categoryName: string) => {
    setActiveCategory(categoryName);
    setTimeout(() => {
      categoryRefs.current[categoryName]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  return (
    <div className="container py-16 space-y-8 md:py-24 md:space-y-12">
      <HeroSection />

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

      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchInputRef={searchInputRef}
      />

      <CategoryFilters
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        onScrollToCategory={scrollToCategory}
        resources={resources}
        categoryIcons={categoryIcons}
      />

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
            const popular = getMostPopularSubcategory(category.name);
            const categorySubcategories = getSubcategoriesForCategory(category.name);
            return (
              <motion.div
                key={category.id}
                className="space-y-4"
                ref={(el) => {
                  categoryRefs.current[category.name] = el;
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${categoryColors[category.name]}`}>
                    {React.createElement(categoryIcons[category.name] || Code, {
                      className: "h-5 w-5",
                    })}
                  </div>
                  <h2 className="text-xl font-semibold font-heading">
                    {category.name}
                  </h2>
                  <span className="px-2 py-1 text-xs bg-muted rounded-full text-muted-foreground">
                    {resources.filter((r) => r.category === category.name).length}{" "}
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
                  {categorySubcategories.map((subcat, subcatIndex) => {
                    const count = resources.filter(
                      (r) => r.category === category.name && r.subcategory === subcat.name
                    ).length;
                    const isPopular =
                      popular && subcat.name === popular.subcat && popular.count > 5;
                    const resourcesInSubcat = resources
                      .filter(
                        (r) =>
                          r.category === category.name && r.subcategory === subcat.name
                      )
                      .slice(0, 3);

                    return count === 0 ? (
                      <motion.div
                        key={subcat.id}
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
                          <h3 className="font-medium text-sm mb-1">{subcat.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            Be the first! 🎆
                          </p>
                        </div>
                        <Plus className="h-4 w-4 text-muted-foreground/50" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key={subcat.id}
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
                          href={`/category/${category.name}?subcategory=${encodeURIComponent(
                            subcat.name
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
                              {subcat.name}
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
              {getSubcategoriesForCategory(activeCategory).map((subcat) => {
                const count = resources.filter(
                  (r) =>
                    r.category === activeCategory && r.subcategory === subcat.name
                ).length;
                const resourcesInSubcat = resources
                  .filter(
                    (r) =>
                      r.category === activeCategory && r.subcategory === subcat.name
                  )
                  .slice(0, 3);

                return count === 0 ? (
                  <div
                    key={subcat.id}
                    className="group flex items-center justify-between p-4 rounded-lg border bg-muted/20 border-dashed opacity-60 hover:opacity-80 transition-opacity"
                    title="No resources yet - be the first to add one!"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-sm mb-1">{subcat.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        Be the first! 🎆
                      </p>
                    </div>
                    <Plus className="h-4 w-4 text-muted-foreground/50" />
                  </div>
                ) : (
                  <Link
                    key={subcat.id}
                    href={`/category/${activeCategory}?subcategory=${encodeURIComponent(
                      subcat.name
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
                      <h3 className="font-medium text-sm mb-1">{subcat.name}</h3>
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

      {!loading && !searchQuery && recentResources.length > 0 && (
        <RecentlyAdded recentResources={recentResources} />
      )}

      <FooterCTA />
    </div>
  );
}
