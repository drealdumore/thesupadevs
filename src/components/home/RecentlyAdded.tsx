"use client";

import { Sparkles } from "lucide-react";
import { ResourceCard } from "@/components/resource-card";
import type { Resource } from "@/lib/types/database";

interface RecentlyAddedProps {
  recentResources: Resource[];
}

export function RecentlyAdded({ recentResources }: RecentlyAddedProps) {
  return (
    <div className="space-y-6 pt-8 border-t">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-semibold font-heading">
            Recently Added
          </h2>
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {recentResources.map((resource) => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </div>
    </div>
  );
}