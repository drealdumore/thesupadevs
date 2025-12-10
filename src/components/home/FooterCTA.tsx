"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddResourceModal } from "@/components/add-resource-modal";

export function FooterCTA() {
  return (
    <div className="pt-12 text-center space-y-4 border-t">
      <h2 className="font-heading text-2xl font-semibold">
        Can't find what you need?
      </h2>
      <p className="text-muted-foreground max-w-md mx-auto">
        Help grow the library by submitting your favorite developer resources
      </p>
      <AddResourceModal>
        <Button className="gap-2 rounded-full">
          <Plus className="h-4 w-4" />
          Submit a Resource
        </Button>
      </AddResourceModal>
    </div>
  );
}