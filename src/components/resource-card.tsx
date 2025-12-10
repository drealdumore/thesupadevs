"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import type { Resource } from "@/lib/types/database";

interface ResourceCardProps {
  resource: Resource;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <motion.a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex w-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-300 hover:shadow-md hover:ring-2 hover:ring-primary/20"
      whileHover={{ 
        scale: 1.02, 
        y: -4,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      whileTap={{ scale: 0.98 }}
      layout
    >
      {resource.image_url && !imageError ? (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
          {/* Loading skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          )}
          
          <img
            src={resource.image_url}
            alt={resource.name}
            className={`h-full w-full object-cover transition-all duration-300 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(false);
            }}
          />
          
          {imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
      ) : (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted/30 flex items-center justify-center">
          <div className="text-muted-foreground/50">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
        
        {/* <div className="mt-auto flex items-center justify-between pt-2">
          {resource.tags && resource.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {resource.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-secondary/50 px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium text-secondary-foreground"
                >
                  {tag}
                </span>
              ))}
              {resource.tags.length > 2 && (
                <span className="text-[10px] text-muted-foreground">
                  +{resource.tags.length - 2}
                </span>
              )}
            </div>
          )}
          <span className="text-xs font-medium text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
            View -&gt;
          </span>
        </div> */}
      </div>
    </motion.a>
  );
}
