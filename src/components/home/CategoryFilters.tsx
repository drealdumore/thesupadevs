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

export function CategoryFilters({
  categories,
  activeCategory,
  onCategoryChange,
  onScrollToCategory,
  resources,
  categoryIcons,
}: CategoryFiltersProps) {
  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <div className="flex flex-wrap md:justify-center gap-2 md:gap-3">
        <motion.button
          onClick={() => onCategoryChange("All")}
          className={`rounded-full border px-3 text-sm font-semibold tracking-wide transition-all duration-200 md:px-6 md:py-2 md:text-sm flex items-center gap-2 min-h-[44px] md:min-h-[36px] ${
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
          const Icon = categoryIcons[category.name] || Code;
          const count = resources.filter((r: { category: string }) => r.category === category.name).length;
          return (
            <motion.button
              key={category.id}
              onClick={() =>
                activeCategory === "All"
                  ? onScrollToCategory(category.name)
                  : onCategoryChange(category.name)
              }
              className={`rounded-full border px-3 text-sm font-semibold tracking-wide transition-all duration-200 md:px-6 md:py-2 md:text-sm flex items-center gap-2 min-h-[44px] md:min-h-[36px] relative ${
                activeCategory === category.name
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
              {category.name}
              {count > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 hidden md:block text-xs rounded-full ${
                  activeCategory === category.name
                    ? "bg-background/20 text-background"
                    : "bg-primary/20 text-primary"
                }`}>
                  {count}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}