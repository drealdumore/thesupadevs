"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {  Plus, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddResourceModal } from "@/components/add-resource-modal";
import { cn } from "@/lib/utils";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      <motion.header 
        className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-sm"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="mx-auto flex h-[70px] max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <motion.div 
            className="flex shrink-0 items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Link
              href="/"
              className="flex items-center gap-2 font-heading text-xl font-bold"
            >
              <motion.span 
                className="inline-flex shrink-0 rotate-3 items-center justify-center rounded-md md:rounded-xl bg-zinc-900 p-1 md:p-2 align-middle text-white dark:bg-white dark:text-black"
                whileHover={{ rotate: -3, scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Zap className="h-6 w-6" fill="currentColor" />
              </motion.span>
            </Link>
          </motion.div>

          {/* Desktop Actions */}
          <motion.div 
            className="hidden items-center gap-3 lg:flex"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <AddResourceModal>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button className="h-10 rounded-full px-5 font-medium">
                  Submit <Plus className="ml-1 h-4 w-4" />
                </Button>
              </motion.div>
            </AddResourceModal>
          </motion.div>

          {/* Mobile/Tablet Actions */}
          <motion.div 
            className="flex items-center gap-2 lg:hidden"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <AddResourceModal>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button
                  size="icon"
                  className="rounded-full bg-foreground text-background hover:bg-foreground/90"
                >
                  <Plus className="h-5 w-5" />
                  <span className="sr-only">Add Resource</span>
                </Button>
              </motion.div>
            </AddResourceModal>
          </motion.div>
        </div>
      </motion.header>
    </>
  );
}
