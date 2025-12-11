"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddResourceModal } from "@/components/add-resource-modal";

export function FooterCTA() {
  return (
    <div className="pt-12 text-center space-y-4 border-t">
      <h2 className="font-heading text-2xl font-semibold">
        Found something cracked that isn't here?
      </h2>
      <p className="text-muted-foreground max-w-md mx-auto">
        Drop it here and help another dev level up.
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
