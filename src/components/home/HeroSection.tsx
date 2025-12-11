"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";

export function HeroSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col border-b border-border items-center gap-12 lg:flex-row lg:gap-24"
    >
      <div className="flex-1 text-left">
        <h1 className="mb-6 font-heading text-4xl font-bold tracking-tight text-foreground md:text-6xl">
          The curated{" "}
          <span className="inline-flex shrink-0 rotate-3 items-center justify-center rounded-xl bg-zinc-900 p-2 align-middle text-white dark:bg-white dark:text-black">
            <Zap className="h-6 w-6" fill="currentColor" />
          </span>{" "}
          shelf <br className="hidden lg:block" />
          for developers
        </h1>
        <h3 className="mb-6 font-heading text-2xl font-semibold text-foreground md:text-3xl">
          Stop searching everywhere. Start building.
        </h3>
        <p className="mb-8 max-w-2xl text-lg text-muted-foreground">
          UI, APIs, tools, and more. Curated for developers.
        </p>
      </div>
    </motion.div>
  );
}