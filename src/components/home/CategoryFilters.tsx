"use client";

import React from "react";
import { motion } from "framer-motion";
import { Code } from "lucide-react";

type CategoryData = {
  id: string;
  name: string;
  created_at: string;
};

interface CategoryFiltersProps {
  categories: CategoryData[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  onScrollToCategory: (category: string) => void;
  resources: { category: string }[];
  categoryIcons: Record<string, React.ComponentType<{ className?: string }>>;
}

const ease = [0.23, 1, 0.32, 1] as const;

const base =
  "flex min-h-[40px] shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors duration-200";
const on = "border-foreground bg-foreground text-background";
const off =
  "border-border bg-card text-foreground hover:border-foreground/40 hover:bg-muted/50";

export function CategoryFilters({
  categories,
  activeCategory,
  onCategoryChange,
  onScrollToCategory,
  resources,
  categoryIcons,
}: CategoryFiltersProps) {
  return (
    <div className="sticky top-0 z-20 -mx-4 border-b bg-background/90 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] md:flex-wrap [&::-webkit-scrollbar]:hidden">
        {/* "All" pill */}
        <motion.button
          type="button"
          aria-pressed={activeCategory === "All"}
          onClick={() => onCategoryChange("All")}
          className={`${base} ${activeCategory === "All" ? on : off}`}
          initial={{ opacity: 0, transform: "translateY(6px)" }}
          animate={{ opacity: 1, transform: "translateY(0px)" }}
          transition={{ duration: 0.3, ease, delay: 0 }}
          whileTap={{ scale: 0.95 }}
        >
          All
          <span className="text-xs font-medium opacity-60">
            {resources.length}
          </span>
        </motion.button>

        {categories.map((category, i) => {
          const Icon = categoryIcons[category.name] || Code;
          const count = resources.filter(
            (r) => r.category === category.name
          ).length;
          const isActive = activeCategory === category.name;

          return (
            <motion.button
              key={category.id}
              type="button"
              aria-pressed={isActive}
              onClick={() =>
                activeCategory === "All"
                  ? onScrollToCategory(category.name)
                  : onCategoryChange(category.name)
              }
              className={`${base} ${isActive ? on : off}`}
              initial={{ opacity: 0, transform: "translateY(6px)" }}
              animate={{ opacity: 1, transform: "translateY(0px)" }}
              transition={{ duration: 0.3, ease, delay: (i + 1) * 0.04 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon className="h-4 w-4" />
              {category.name}
              {count > 0 && (
                <span className="text-xs font-medium opacity-60">{count}</span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
