"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BarChart3, Settings, WandSparkles, LogOut, Clock } from "lucide-react";

interface AdminHeaderProps {
  counts: {
    all: number;
    approved: number;
    pending: number;
  };
  onShowAnalytics: () => void;
  onShowCategoryManager: () => void;
  onShowBulkCategorize: () => void;
  onLogout: () => void;
}

export function AdminHeader({
  counts,
  onShowAnalytics,
  onShowCategoryManager,
  onShowBulkCategorize,
  onLogout,
}: AdminHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1"
      >
        <h1 className="mb-2 font-heading text-2xl sm:text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
          Admin Dashboard
        </h1>
        <p className="mb-4 text-base sm:text-lg text-muted-foreground">
          Manage and curate developer resources
        </p>

        {/* Quick Stats */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>{counts.approved} Approved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span>{counts.pending} Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            <span>Last updated: {new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </motion.div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={onShowAnalytics}
          className="gap-2"
        >
          <BarChart3 className="h-4 w-4" />
          Analytics
        </Button>
        <Button
          variant="outline"
          onClick={onShowCategoryManager}
          className="gap-2"
        >
          <Settings className="h-4 w-4" />
          Categories
        </Button>
        <Button
          variant="outline"
          onClick={onShowBulkCategorize}
          className="gap-2"
        >
          <WandSparkles className="h-4 w-4" />
          AI Categorize
        </Button>
        <Button variant="outline" onClick={onLogout} className="gap-2">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}