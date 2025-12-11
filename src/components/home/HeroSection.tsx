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
        <motion.div
          className="flex items-center gap-3 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <a
            href="https://github.com/drealdumore/thesupadevs"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground border border-border rounded-full hover:border-foreground/40 hover:bg-muted/50 transition-all duration-200 hover:scale-105"
          >
            <svg
              className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="group-hover:text-foreground transition-colors duration-200">
              Open Source
            </span>
          </a>
        </motion.div>
        <h1 className="mb-6 font-heading text-4xl font-bold tracking-tight text-foreground md:text-6xl">
          The curated{" "}
          <span className="inline-flex shrink-0 rotate-3 items-center justify-center rounded-xl bg-zinc-900 p-2 align-middle text-white dark:bg-white dark:text-black">
            <Zap className="h-6 w-6" fill="currentColor" />
          </span>{" "}
          shelf <br className="hidden lg:block" />
          for developers
        </h1>
        <h2 className="mb-6 font-heading text-2xl font-semibold text-foreground md:text-3xl">
          Stop searching everywhere. Start building.
        </h2>
        <p className="mb-8 max-w-2xl text-lg text-muted-foreground">
          UI, APIs, tools, and more. Curated for developers.
        </p>
      </div>
    </motion.div>
  );
}
