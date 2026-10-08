
"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddResourceModal } from "@/components/add-resource-modal";

const ease = [0.23, 1, 0.32, 1] as const;

export function FooterCTA() {
  return (
    <div className="pt-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5, ease }}
      >
        <motion.div
          className="
            group relative overflow-hidden
            rounded-2xl
            border border-border
            bg-card
            px-6 py-12
            text-center
            shadow-sm
            md:px-12
          "
          whileHover={{
            y: -2,
            transition: {
              duration: 0.25,
              ease,
            },
          }}
        >
          {/* Subtle top highlight */}
          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute inset-x-8 top-0
              h-px
              bg-gradient-to-r
              from-transparent
              via-foreground/10
              to-transparent
            "
          />

          {/* Content */}
          <div className="relative z-10 mx-auto max-w-lg space-y-4">
            <h2 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
              Found something cracked that isn&apos;t here?
            </h2>

            <p className="mx-auto max-w-md text-muted-foreground">
              Drop it here and help another dev level up.
            </p>

            <div className="pt-2">
              <AddResourceModal>
                <Button className="gap-2 rounded-full px-5">
                  <Plus className="h-4 w-4" />
                  Submit a Resource
                </Button>
              </AddResourceModal>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
