"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, ArrowUpDown, Check, Clock, Trash2, RefreshCw, AlertTriangle } from "lucide-react";
import type { Category } from "@/lib/types/database";

type SortField = "name" | "created_at" | "category" | "status";
type SortOrder = "asc" | "desc";

interface FilterControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: Category | "all";
  onCategoryChange: (category: Category | "all") => void;
  categories: Array<{ id: string; name: string }>;
  filter: "all" | "pending" | "approved" | "broken";
  onFilterChange: (filter: "all" | "pending" | "approved" | "broken") => void;
  counts: { all: number; pending: number; approved: number; broken: number };
  selectedResources: Set<string>;
  bulkOperating: boolean;
  onBulkOperation: (operation: "approve" | "pending" | "delete") => void;
  onClearSelection: () => void;
  onSelectAllVisible: () => void;
  onConfirmBulkDelete: () => void;
  onRefresh: () => void;
  filteredCount: number;
  totalCount: number;
  onSortChange: (field: SortField, order: SortOrder) => void;
  onCheckBrokenUrls: () => void;
  checkingUrls: boolean;
}

export function FilterControls({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  filter,
  onFilterChange,
  counts,
  selectedResources,
  bulkOperating,
  onBulkOperation,
  onClearSelection,
  onSelectAllVisible,
  onConfirmBulkDelete,
  onRefresh,
  filteredCount,
  totalCount,
  onSortChange,
  onCheckBrokenUrls,
  checkingUrls,
}: FilterControlsProps) {
  return (
    <Card className="p-6 mb-6">
      <div className="space-y-4">
        {/* Search and Category Filter */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search resources by name, description, URL, or tags..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={selectedCategory}
            onValueChange={(value) => onCategoryChange(value as Category | "all")}
          >
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.name}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort Controls */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <ArrowUpDown className="h-4 w-4" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onSortChange("created_at", "desc")}>
                Newest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange("created_at", "asc")}>
                Oldest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange("name", "asc")}>
                Name A-Z
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange("category", "asc")}>
                Category A-Z
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange("status", "asc")}>
                Status
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Status Filters and Bulk Actions */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => onFilterChange("all")}
              className="text-xs sm:text-sm"
            >
              All ({counts.all})
            </Button>
            <Button
              variant={filter === "pending" ? "default" : "outline"}
              onClick={() => onFilterChange("pending")}
              className="text-xs sm:text-sm"
            >
              Pending ({counts.pending})
            </Button>
            <Button
              variant={filter === "approved" ? "default" : "outline"}
              onClick={() => onFilterChange("approved")}
              className="text-xs sm:text-sm"
            >
              Approved ({counts.approved})
            </Button>
            <Button
              variant={filter === "broken" ? "destructive" : "outline"}
              onClick={() => onFilterChange("broken")}
              className="text-xs sm:text-sm"
            >
              Broken URLs ({counts.broken})
            </Button>
            <Button
              variant="outline"
              onClick={onCheckBrokenUrls}
              disabled={checkingUrls}
              className="text-xs sm:text-sm gap-1"
            >
              {checkingUrls ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                "Check URLs"
              )}
            </Button>
          </div>

          {/* Bulk Actions */}
          {selectedResources.size > 0 && (
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="px-3 py-1">
                {selectedResources.size} selected
              </Badge>
              <Button
                size="sm"
                onClick={() => onBulkOperation("approve")}
                disabled={bulkOperating}
                className="gap-1"
              >
                <Check className="h-3 w-3" />
                Approve All
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onBulkOperation("pending")}
                disabled={bulkOperating}
                className="gap-1"
              >
                <Clock className="h-3 w-3" />
                Pending
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={onConfirmBulkDelete}
                disabled={bulkOperating}
                className="gap-1"
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </Button>
              <Button size="sm" variant="ghost" onClick={onClearSelection}>
                Clear
              </Button>
            </div>
          )}
        </div>

        {/* Selection Controls */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>
              Showing {filteredCount} of {totalCount} resources
            </span>
            {filteredCount > 0 && (
              <Button variant="ghost" size="sm" onClick={onSelectAllVisible}>
                Select All Visible
              </Button>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            className="gap-1"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh
          </Button>
        </div>
      </div>
    </Card>
  );
}