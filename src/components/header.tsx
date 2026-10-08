"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddResourceModal } from "@/components/add-resource-modal";
import { cn } from "@/lib/utils";

const GITHUB_URL = "https://github.com/drealdumore/thesupadevs";

function GithubMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  // Show a bottom border only once the page has scrolled under the header
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm transition-colors duration-200",
        scrolled ? "border-border" : "border-transparent",
      )}
      initial={{ opacity: 0, transform: "translateY(-12px)" }}
      animate={{ opacity: 1, transform: "translateY(0px)" }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
    >
      <div className="mx-auto flex h-[70px] max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          aria-label="TheSupaDevs home"
          className="group flex items-center gap-[10px] font-heading select-none"
        >
          <span className="inline-flex h-7 w-7 shrink-0 rotate-3 items-center justify-center rounded-lg bg-foreground text-xl font-extrabold leading-none text-background transition-transform duration-200 group-hover:-rotate-3 group-active:scale-95 md:h-10 md:w-10 md:rounded-xl">
            /
          </span>
          <span className="text-[16px] md:text-xl font-medium tracking-tight">
            for developers
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {/* GitHub: text link on desktop, icon on small screens */}
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden h-10 items-center gap-2 rounded-full px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground lg:inline-flex"
          >
            <GithubMark className="h-4 w-4" />
            Open source
          </a>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View source on GitHub"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground lg:hidden"
          >
            <GithubMark className="h-5 w-5" />
          </a>

          {/* Submit: labelled on desktop, icon-only on small screens */}
          <AddResourceModal>
            <Button className="hidden h-10 gap-1 rounded-md px-5 font-medium lg:inline-flex">
              Submit
              <Plus className="h-4 w-4" />
            </Button>
          </AddResourceModal>
          <AddResourceModal>
            <button className="items-center inline-flex justify-center rounded-full bg-foreground text-background lg:hidden  w-8 h-8  transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:brightness-105 active:scale-95 cursor-pointer">
              <Plus className="h-5 w-5" />
              <span className="sr-only">Submit a resource</span>
            </button>
          </AddResourceModal>
        </div>
      </div>
    </motion.header>
  );
}
