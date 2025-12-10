"use client";

import { motion } from "framer-motion";
import type { Category, Resource } from "@/lib/types/database";
import Link from "next/link";

const categories: { name: Category; description: string }[] = [
  { name: "Frontend", description: "React, Vue, Angular components" },
  { name: "Backend", description: "APIs, databases, serverless" },
  { name: "Fullstack", description: "Complete application frameworks" },
  { name: "DevOps", description: "CI/CD, containers, monitoring" },
  { name: "Design", description: "UI/UX tools and resources" },
  { name: "Tools", description: "Development utilities" },
  { name: "Learning", description: "Tutorials, courses, documentation" },
];

interface CategoryFilterProps {
  resources: Resource[];
}

export function CategoryFilter({ resources }: CategoryFilterProps) {
  const getResourceCount = (category: string) => {
    return resources.filter((r) => r.category === category).length;
  };

  return (
    <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {categories.map((category) => {
        const count = getResourceCount(category.name);
        
        return (
          <motion.div
            key={category.name}
            className="space-y-3 text-center"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Link
              href={`/category/${category.name}`}
              className="peer relative inline-flex overflow-hidden rounded-xl border sm:flex w-full h-32 transition-all border-border hover:border-primary/50 dark:border-zinc-700/80"
            >
              <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-muted/30 to-muted/10">
                <div className="text-center">
                  <div className="text-2xl font-semibold mb-1">{category.name}</div>
                  <div className="text-xs text-muted-foreground">{count} Resources</div>
                </div>
              </div>
            </Link>
            
            <div className="[&_a]:peer-hover:underline">
              <h2>
                <Link
                  href={`/category/${category.name}`}
                  className="text-sm font-medium hover:underline"
                >
                  {category.name}
                </Link>
              </h2>
              <p className="text-[13px] text-muted-foreground">
                {category.description}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
