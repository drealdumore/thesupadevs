"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Image as ImageIcon, Sparkles } from "lucide-react";
import type { Resource } from "@/lib/types/database";

interface ResourceCardProps {
  resource: Resource;
}

const getHostname = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

const isRecentlyAdded = (createdAt?: string) =>
  !!createdAt && (Date.now() - new Date(createdAt).getTime()) / 86_400_000 <= 7;

export function ResourceCard({ resource }: ResourceCardProps) {
  const [imageError, setImageError] = useState(false);
  const hostname = getHostname(resource.url);
  const label = resource.subcategory || resource.category;

  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${resource.name} (opens ${hostname} in a new tab)`}
      className="group relative flex w-full flex-col overflow-hidden rounded-2xl border bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      style={{
        transition:
          "transform 200ms cubic-bezier(0.23,1,0.32,1), border-color 200ms cubic-bezier(0.23,1,0.32,1), box-shadow 200ms cubic-bezier(0.23,1,0.32,1)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 8px 24px rgba(0,0,0,0.10)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(0px)";
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
      }}
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden border-b bg-muted">
        {resource.image_url && !imageError ? (
          <Image
            src={resource.image_url}
            alt=""
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
            style={{ transitionTimingFunction: "cubic-bezier(0.23,1,0.32,1)" }}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted/30 text-muted-foreground/50">
            <ImageIcon className="h-8 w-8" strokeWidth={1.5} />
          </div>
        )}

        {isRecentlyAdded(resource.created_at) && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-semibold text-white">
            <Sparkles className="h-3 w-3" />
            New
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading font-semibold leading-tight tracking-tight text-foreground transition-colors group-hover:text-primary">
            {resource.name}
          </h3>
          <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
        </div>

        <p className="line-clamp-2 text-sm text-muted-foreground">
          {resource.description}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-2 text-xs text-muted-foreground">
          <span className="truncate">{hostname}</span>
          {label && (
            <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 font-medium">
              {label}
            </span>
          )}
        </div>
      </div>
    </a>
  );
}