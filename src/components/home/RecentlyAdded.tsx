"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { ResourceCard } from "@/components/resource-card";
import type { Resource } from "@/lib/types/database";

interface RecentlyAddedProps {
  recentResources: Resource[];
}

const ease = [0.23, 1, 0.32, 1] as const;

export function RecentlyAdded({ recentResources }: RecentlyAddedProps) {
  return (
    <section className="space-y-6 pt-8">
      {/* Animated border */}
      <motion.div
        className="border-t border-border -mx-0"
        initial={{ opacity: 0, scaleX: 0.85 }}
        animate={{ opacity: 1, scaleX: 1 }}
        style={{ transformOrigin: "left center" }}
        transition={{ duration: 0.5, ease }}
      />
      <motion.div
        className="flex items-center gap-2"
        initial={{ opacity: 0, transform: "translateY(10px)" }}
        animate={{ opacity: 1, transform: "translateY(0px)" }}
        transition={{ duration: 0.4, ease }}
      >
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="font-heading text-2xl font-semibold">Recently added</h2>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {recentResources.map((resource, i) => (
          <motion.div
            key={resource.id}
            initial={{ opacity: 0, transform: "translateY(12px)" }}
            animate={{ opacity: 1, transform: "translateY(0px)" }}
            transition={{ duration: 0.4, ease, delay: i * 0.05 }}
          >
            <ResourceCard resource={resource} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
