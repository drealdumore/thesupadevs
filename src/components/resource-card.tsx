"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Image from "next/image";
import type { Resource } from "@/lib/types/database";

interface ResourceCardProps {
  resource: Resource;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <motion.a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex w-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-300 hover:shadow-md hover:ring-1 hover:ring-primary/20"
      whileHover={{
        scale: 1.02,
        y: -4,
        transition: { duration: 0.2, ease: "easeIn" },
      }}
      whileTap={{ scale: 0.98 }}
      layout
    >
      {resource.image_url && !imageError ? (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
          <Image
            src={resource.image_url}
            alt={resource.name}
            fill
            className="object-cover transition-all duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={false}
            onError={() => setImageError(true)}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      ) : (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted/30 flex items-center justify-center">
          <div className="text-muted-foreground/50">
            <svg
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-tight tracking-tight text-foreground group-hover:text-primary transition-colors">
            {resource.name}
          </h3>
        </div>

        <p className="line-clamp-2 text-sm text-muted-foreground">
          {resource.description}
        </p>
      </div>
    </motion.a>
  );
}
