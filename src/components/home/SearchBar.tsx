"use client";

import { motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { RefObject } from "react";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchInputRef: RefObject<HTMLInputElement>;
}

export function SearchBar({
  searchQuery,
  onSearchChange,
  searchInputRef,
}: SearchBarProps) {
  return (
    <motion.div
      className="max-w-2xl mx-auto"
      initial={{ opacity: 0, transform: "translateY(14px)" }}
      animate={{ opacity: 1, transform: "translateY(0px)" }}
      transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1], delay: 0.15 }}
    >
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={searchInputRef}
          type="text"
          placeholder="Search icons, databases, courses..."
          aria-label="Search resources"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-12 rounded-xl pl-11 pr-11 text-base"
        />
        {searchQuery ? (
          <motion.button
            onClick={() => onSearchChange("")}
            className="absolute right-3 inset-y-0 my-auto flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Clear search"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="h-4 w-4" />
          </motion.button>
        ) : (
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border bg-muted px-1.5 text-xs font-medium text-muted-foreground sm:block">
            /
          </kbd>
        )}
      </div>
    </motion.div>
  );
}