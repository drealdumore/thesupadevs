"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Check,
  X,
  Trash2,
  ExternalLink,
  Calendar,
  Tag,
  Image as ImageIcon,
  Edit,
  Eye,
  RefreshCw,
  Copy,
  MoreHorizontal,
  Clock,
} from "lucide-react";
import type { Resource } from "@/lib/types/database";

interface ResourceCardProps {
  resource: Resource;
  index: number;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
  onEdit: (resource: Resource) => void;
  onShowDetails: (resource: Resource) => void;
  onUpdateStatus: (id: string, status: "approved" | "pending") => void;
  onConfirmDelete: (resource: Resource) => void;
  onRescrapeImage: (resource: Resource) => void;
}

export function ResourceCard({
  resource,
  index,
  isSelected,
  onToggleSelection,
  onEdit,
  onShowDetails,
  onUpdateStatus,
  onConfirmDelete,
  onRescrapeImage,
}: ResourceCardProps) {
  return (
    <motion.div
      key={resource.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
    >
      <Card
        className={`border-2 p-4 sm:p-6 hover:shadow-md transition-all overflow-hidden ${
          isSelected ? "ring-2 ring-primary" : ""
        }`}
      >
        <div className="flex gap-4 min-w-0">
          {/* Selection Checkbox */}
          <div className="flex-shrink-0 pt-1">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleSelection(resource.id)}
            />
          </div>

          {/* Image Preview */}
          <div className="flex-shrink-0">
            <div className="relative group">
              {resource.image_url ? (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-muted">
                  <img
                    src={resource.image_url}
                    alt={resource.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = "flex";
                    }}
                  />
                  <div
                    className="w-full h-full bg-muted/30 flex items-center justify-center"
                    style={{ display: "none" }}
                  >
                    <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  </div>
                </div>
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-muted/30 flex items-center justify-center">
                  <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                </div>
              )}

              {/* Re-scrape button */}
              <Button
                size="sm"
                variant="ghost"
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 text-white"
                onClick={() => onRescrapeImage(resource)}
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-2 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                  <h3 className="font-semibold text-base sm:text-lg truncate">
                    {resource.name}
                  </h3>
                  <div className="flex gap-2">
                    <Badge
                      variant={resource.status === "approved" ? "default" : "secondary"}
                      className="self-start"
                    >
                      {resource.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {resource.category}
                    </Badge>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {resource.description}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs text-muted-foreground mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    {new Date(resource.created_at).toLocaleDateString()}
                  </div>
                  <span className="hidden sm:inline">•</span>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors truncate block max-w-xs"
                  >
                    {resource.url}
                  </a>
                </div>

                {/* Tags */}
                {resource.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {resource.tags.slice(0, 4).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        <Tag className="h-2 w-2 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                    {resource.tags.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{resource.tags.length - 4} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(resource)}
                className="gap-1 text-xs"
              >
                <Edit className="h-3 w-3" />
                <span className="hidden sm:inline">Edit</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => onShowDetails(resource)}
                className="gap-1 text-xs"
              >
                <Eye className="h-3 w-3" />
                <span className="hidden sm:inline">Details</span>
              </Button>

              {resource.status === "pending" ? (
                <Button
                  size="sm"
                  onClick={() => onUpdateStatus(resource.id, "approved")}
                  className="gap-1 text-xs"
                >
                  <Check className="h-3 w-3" />
                  <span className="hidden sm:inline">Approve</span>
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdateStatus(resource.id, "pending")}
                  className="gap-1 text-xs"
                >
                  <Clock className="h-3 w-3" />
                  <span className="hidden sm:inline">Pending</span>
                </Button>
              )}

              <Button size="sm" variant="outline" asChild>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gap-1 text-xs"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span className="hidden sm:inline">Visit</span>
                </a>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost" className="gap-1 text-xs">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={() => navigator.clipboard.writeText(resource.url)}
                  >
                    <Copy className="h-3 w-3 mr-2" />
                    Copy URL
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onRescrapeImage(resource)}>
                    <RefreshCw className="h-3 w-3 mr-2" />
                    Re-scrape Image
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onConfirmDelete(resource)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-3 w-3 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}