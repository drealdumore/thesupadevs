"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AddResourceModal } from "@/components/add-resource-modal";
import { Home, Plus, Search, Zap } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container py-16 space-y-8 md:py-24 md:space-y-12">
      <motion.div
        className="flex flex-col items-center text-center space-y-8 max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* 404 Icon */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="w-32 h-32 rounded-full bg-muted/30 flex items-center justify-center">
            <motion.div
              className="inline-flex shrink-0 rotate-3 items-center justify-center rounded-xl bg-zinc-900 p-4 text-white dark:bg-white dark:text-black"
              whileHover={{ rotate: -3, scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              <Zap className="h-8 w-8" fill="currentColor" />
            </motion.div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h1 className="font-heading text-6xl font-bold tracking-tight text-foreground md:text-8xl">
            404
          </h1>
          <h2 className="font-heading text-2xl font-semibold text-foreground md:text-3xl">
            Page Not Found
          </h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Looks like this resource got lost in the digital shelf. Let's help you find what you're looking for.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 pt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link href="/">
              <Button className="gap-2 rounded-full">
                <Home className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <AddResourceModal>
              <Button variant="outline" className="gap-2 rounded-full">
                <Plus className="h-4 w-4" />
                Add Resource
              </Button>
            </AddResourceModal>
          </motion.div>
        </motion.div>

        {/* Suggestions */}
        <motion.div
          className="pt-8 space-y-4 text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <p className="font-medium">Here are some things you can try:</p>
          <div className="grid gap-2 text-left max-w-md mx-auto">
            <motion.div
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              whileHover={{ x: 4 }}
            >
              <Search className="h-4 w-4 text-primary" />
              <span>Search for resources on the homepage</span>
            </motion.div>
            <motion.div
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              whileHover={{ x: 4 }}
            >
              <Zap className="h-4 w-4 text-primary" />
              <span>Browse categories and subcategories</span>
            </motion.div>
            <motion.div
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              whileHover={{ x: 4 }}
            >
              <Plus className="h-4 w-4 text-primary" />
              <span>Submit a new resource to help others</span>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}