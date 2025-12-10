"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Resource } from "@/lib/types/database";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  X,
  Trash2,
  ExternalLink,
  LogOut,
  Search,
  Calendar,
  Tag,
  Image as ImageIcon,
  Edit,
  Plus,
  Settings,
  BarChart3,
  ArrowUpDown,
  Filter,
  MoreHorizontal,
  Eye,
  RefreshCw,
  Download,
  Upload,
  Copy,
  Archive,
  Star,
  Clock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  SimpleKitModal,
  SimpleKitModalTrigger,
  SimpleKitModalContent,
  SimpleKitModalHeader,
  SimpleKitModalTitle,
  SimpleKitModalBody,
  SimpleKitModalFooter,
  SimpleKitModalClose,
} from "@/components/ui/simple-kit-modal";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Category } from "@/lib/types/database";

const defaultCategories: Category[] = [
  "Frontend",
  "Backend",
  "Fullstack",
  "DevOps",
  "Design",
  "Tools",
  "Learning",
];

const subcategoriesMap: Record<Category, string[]> = {
  Frontend: ["React", "Vue", "Angular", "CSS", "JavaScript", "TypeScript"],
  Backend: ["Node.js", "Python", "Java", "Go", "Rust", "PHP"],
  Fullstack: ["Next.js", "Nuxt", "SvelteKit", "T3 Stack"],
  DevOps: ["Docker", "Kubernetes", "CI/CD", "AWS", "Monitoring"],
  Design: ["UI/UX", "Icons", "Colors", "Typography", "Wireframing"],
  Tools: ["IDE", "CLI", "Browser Extensions", "Productivity"],
  Learning: ["Tutorials", "Courses", "Books", "Documentation"],
};

// Enhanced Image Preview Component for Edit Modal
function EditImagePreview({ imageUrl }: { imageUrl: string }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Reset states when URL changes
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [imageUrl]);

  return (
    <div className="mt-2 p-2 border rounded-lg">
      <p className="text-xs text-muted-foreground mb-2">Preview Image:</p>
      {imageUrl && !imageError ? (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted rounded">
          {/* Loading skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          )}
          
          <img
            src={imageUrl}
            alt="Resource preview"
            className={`h-full w-full object-cover transition-all duration-300 ${
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
          )}
        </div>
      ) : (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted/30 rounded flex items-center justify-center">
          <div className="text-muted-foreground/50">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}

type SortField = "name" | "created_at" | "category" | "status";
type SortOrder = "asc" | "desc";

export default function AdminPage() {
  // Core state
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [allResources, setAllResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);

  // Filtering & Search
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">(
    "all"
  );
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Selection & Bulk Operations
  const [selectedResources, setSelectedResources] = useState<Set<string>>(
    new Set()
  );
  const [bulkOperating, setBulkOperating] = useState(false);

  // Modals & Dialogs
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showResourceDetails, setShowResourceDetails] =
    useState<Resource | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: "single" | "bulk";
    resource?: Resource;
    count?: number;
  } | null>(null);

  // Edit Resource Form
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    url: "",
    category: "" as Category,
    subcategory: "",
    tags: [] as string[],
    image_url: "",
  });

  // Category Management
  const [newCategory, setNewCategory] = useState("");
  const [newSubcategory, setNewSubcategory] = useState("");
  const [selectedCategoryForSub, setSelectedCategoryForSub] =
    useState<Category>("Frontend");

  useEffect(() => {
    checkAuth();
  }, []);

  const fetchResources = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      console.log("Fetched resources:", data);
      console.log(
        "Pending resources:",
        data?.filter((r) => r.status === "pending")
      );
      setAllResources(data || []);
    } catch (error) {
      console.error("Error fetching resources:", error);
    }
  }, []);

  // Enhanced filtering and sorting
  const filteredAndSortedResources = allResources
    .filter((resource) => {
      const matchesStatus = filter === "all" || resource.status === filter;
      const matchesSearch =
        searchQuery === "" ||
        resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        resource.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );
      const matchesCategory =
        selectedCategory === "all" || resource.category === selectedCategory;

      return matchesStatus && matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === "created_at") {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (sortOrder === "asc") {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });

  // Get counts for filter buttons
  const getCounts = () => {
    const pending = allResources.filter((r) => r.status === "pending").length;
    const approved = allResources.filter((r) => r.status === "approved").length;
    return { all: allResources.length, pending, approved };
  };

  const counts = getCounts();

  useEffect(() => {
    if (isAuthenticated) {
      fetchResources();
    }
  }, [isAuthenticated, fetchResources]);

  async function checkAuth() {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    setIsAuthenticated(!!data.session);
    setLoading(false);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoggingIn(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Please check your credentials.");
    } finally {
      setLoggingIn(false);
    }
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setIsAuthenticated(false);
  }

  async function updateResourceStatus(
    id: string,
    status: "approved" | "pending"
  ) {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("resources")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
      fetchResources();
    } catch (error) {
      console.error("Error updating resource:", error);
    }
  }

  async function deleteResource(id: string) {
    try {
      const supabase = createClient();
      const { error } = await supabase.from("resources").delete().eq("id", id);

      if (error) throw error;
      fetchResources();
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting resource:", error);
    }
  }

  function confirmDeleteResource(resource: Resource) {
    setDeleteConfirm({ type: "single", resource });
  }

  async function updateResource(id: string, updates: Partial<Resource>) {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("resources")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
      fetchResources();
      setEditingResource(null);
    } catch (error) {
      console.error("Error updating resource:", error);
    }
  }

  // Bulk operations
  async function handleBulkOperation(
    operation: "approve" | "pending" | "delete"
  ) {
    if (selectedResources.size === 0) return;

    setBulkOperating(true);
    try {
      const supabase = createClient();
      const resourceIds = Array.from(selectedResources);

      if (operation === "delete") {
        const { error } = await supabase
          .from("resources")
          .delete()
          .in("id", resourceIds);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("resources")
          .update({ status: operation })
          .in("id", resourceIds);
        if (error) throw error;
      }

      setSelectedResources(new Set());
      fetchResources();
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Bulk operation error:", error);
    } finally {
      setBulkOperating(false);
    }
  }

  function confirmBulkDelete() {
    setDeleteConfirm({ type: "bulk", count: selectedResources.size });
  }

  async function handleConfirmedDelete() {
    if (!deleteConfirm) return;

    if (deleteConfirm.type === "single" && deleteConfirm.resource) {
      await deleteResource(deleteConfirm.resource.id);
    } else if (deleteConfirm.type === "bulk") {
      await handleBulkOperation("delete");
    }
  }

  // Resource selection
  function toggleResourceSelection(id: string) {
    const newSelection = new Set(selectedResources);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedResources(newSelection);
  }

  function selectAllVisible() {
    const visibleIds = filteredAndSortedResources.map((r) => r.id);
    setSelectedResources(new Set(visibleIds));
  }

  function clearSelection() {
    setSelectedResources(new Set());
  }

  // Edit resource functions
  function openEditModal(resource: Resource) {
    setEditingResource(resource);
    setEditForm({
      name: resource.name,
      description: resource.description,
      url: resource.url,
      category: resource.category,
      subcategory: resource.subcategory || "",
      tags: resource.tags,
      image_url: resource.image_url || "",
    });
  }

  function handleEditSubmit() {
    if (!editingResource) return;
    updateResource(editingResource.id, editForm);
  }

  // Re-scrape image
  async function rescrapeImage(resource: Resource) {
    try {
      const response = await fetch(
        `/api/scrape-metadata?url=${encodeURIComponent(resource.url)}`
      );
      const data = await response.json();

      if (data.success && data.metadata.image) {
        await updateResource(resource.id, { image_url: data.metadata.image });
      }
    } catch (error) {
      console.error("Error re-scraping image:", error);
    }
  }

  if (loading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container max-w-md py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-2 p-8">
            <h1 className="font-display text-3xl font-bold mb-2">
              Admin Login
            </h1>
            <p className="text-muted-foreground mb-6">
              Sign in to manage resources
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loggingIn}>
                {loggingIn ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-7xl overflow-x-hidden">
      {/* Header with Analytics */}
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
            onClick={() => setShowAnalytics(true)}
            className="gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowCategoryManager(true)}
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            Categories
          </Button>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Enhanced Search and Filters */}
      <Card className="p-6 mb-6">
        <div className="space-y-4">
          {/* Search and Category Filter */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search resources by name, description, URL, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={selectedCategory}
              onValueChange={(value) =>
                setSelectedCategory(value as Category | "all")
              }
            >
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
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
                <DropdownMenuItem
                  onClick={() => {
                    setSortField("created_at");
                    setSortOrder("desc");
                  }}
                >
                  Newest First
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSortField("created_at");
                    setSortOrder("asc");
                  }}
                >
                  Oldest First
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSortField("name");
                    setSortOrder("asc");
                  }}
                >
                  Name A-Z
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSortField("category");
                    setSortOrder("asc");
                  }}
                >
                  Category A-Z
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSortField("status");
                    setSortOrder("asc");
                  }}
                >
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
                onClick={() => setFilter("all")}
                className="text-xs sm:text-sm"
              >
                All ({counts.all})
              </Button>
              <Button
                variant={filter === "pending" ? "default" : "outline"}
                onClick={() => setFilter("pending")}
                className="text-xs sm:text-sm"
              >
                Pending ({counts.pending})
              </Button>
              <Button
                variant={filter === "approved" ? "default" : "outline"}
                onClick={() => setFilter("approved")}
                className="text-xs sm:text-sm"
              >
                Approved ({counts.approved})
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
                  onClick={() => handleBulkOperation("approve")}
                  disabled={bulkOperating}
                  className="gap-1"
                >
                  <Check className="h-3 w-3" />
                  Approve All
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkOperation("pending")}
                  disabled={bulkOperating}
                  className="gap-1"
                >
                  <Clock className="h-3 w-3" />
                  Pending
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={confirmBulkDelete}
                  disabled={bulkOperating}
                  className="gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </Button>
                <Button size="sm" variant="ghost" onClick={clearSelection}>
                  Clear
                </Button>
              </div>
            )}
          </div>

          {/* Selection Controls */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>
                Showing {filteredAndSortedResources.length} of{" "}
                {allResources.length} resources
              </span>
              {filteredAndSortedResources.length > 0 && (
                <Button variant="ghost" size="sm" onClick={selectAllVisible}>
                  Select All Visible
                </Button>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchResources}
              className="gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Resources List */}
      <div className="space-y-4">
        {filteredAndSortedResources.length === 0 ? (
          <Card className="border-2 p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-2">No resources found</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </Card>
        ) : (
          filteredAndSortedResources.map((resource, index) => (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
            >
              <Card
                className={`border-2 p-4 sm:p-6 hover:shadow-md transition-all overflow-hidden ${
                  selectedResources.has(resource.id)
                    ? "ring-2 ring-primary"
                    : ""
                }`}
              >
                <div className="flex gap-4 min-w-0">
                  {/* Selection Checkbox */}
                  <div className="flex-shrink-0 pt-1">
                    <Checkbox
                      checked={selectedResources.has(resource.id)}
                      onCheckedChange={() =>
                        toggleResourceSelection(resource.id)
                      }
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
                              (e.currentTarget
                                .nextElementSibling as HTMLElement)!.style.display =
                                "flex";
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
                        onClick={() => rescrapeImage(resource)}
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
                              variant={
                                resource.status === "approved"
                                  ? "default"
                                  : "secondary"
                              }
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
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-xs"
                              >
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
                        onClick={() => openEditModal(resource)}
                        className="gap-1 text-xs"
                      >
                        <Edit className="h-3 w-3" />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowResourceDetails(resource)}
                        className="gap-1 text-xs"
                      >
                        <Eye className="h-3 w-3" />
                        <span className="hidden sm:inline">Details</span>
                      </Button>

                      {resource.status === "pending" ? (
                        <Button
                          size="sm"
                          onClick={() =>
                            updateResourceStatus(resource.id, "approved")
                          }
                          className="gap-1 text-xs"
                        >
                          <Check className="h-3 w-3" />
                          <span className="hidden sm:inline">Approve</span>
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateResourceStatus(resource.id, "pending")
                          }
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
                          <Button
                            size="sm"
                            variant="ghost"
                            className="gap-1 text-xs"
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={() =>
                              navigator.clipboard.writeText(resource.url)
                            }
                          >
                            <Copy className="h-3 w-3 mr-2" />
                            Copy URL
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => rescrapeImage(resource)}
                          >
                            <RefreshCw className="h-3 w-3 mr-2" />
                            Re-scrape Image
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => confirmDeleteResource(resource)}
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
          ))
        )}
      </div>

      {/* Edit Resource Modal */}
      <SimpleKitModal
        open={!!editingResource}
        onOpenChange={() => setEditingResource(null)}
      >
        <SimpleKitModalContent>
          <SimpleKitModalHeader>
            <SimpleKitModalTitle>Edit Resource</SimpleKitModalTitle>
            <p className="text-sm text-muted-foreground text-center mt-2">
              Update resource details and metadata. Changes will be saved
              immediately.
            </p>
          </SimpleKitModalHeader>

          <SimpleKitModalBody>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Resource Name *</Label>
                <Input
                  id="edit-name"
                  placeholder="e.g., Framer Motion"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-category">Category *</Label>
                <Select
                  value={editForm.category}
                  onValueChange={(value) =>
                    setEditForm((prev) => ({
                      ...prev,
                      category: value as Category,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {editForm.category && subcategoriesMap[editForm.category] && (
                <div className="space-y-2">
                  <Label htmlFor="edit-subcategory">Subcategory</Label>
                  <Select
                    value={editForm.subcategory}
                    onValueChange={(value) =>
                      setEditForm((prev) => ({ ...prev, subcategory: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subcategory (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategoriesMap[editForm.category].map((subcat) => (
                        <SelectItem key={subcat} value={subcat}>
                          {subcat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description *</Label>
                <Textarea
                  id="edit-description"
                  placeholder="Describe what this resource does and why it's useful..."
                  rows={4}
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-url">URL *</Label>
                <Input
                  id="edit-url"
                  type="url"
                  placeholder="https://example.com"
                  value={editForm.url}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, url: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-image">Image URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="edit-image"
                    placeholder="https://example.com/image.jpg (optional)"
                    value={editForm.image_url}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        image_url: e.target.value,
                      }))
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      if (!editForm.url) return;
                      try {
                        const response = await fetch(
                          `/api/scrape-metadata?url=${encodeURIComponent(editForm.url)}`
                        );
                        const data = await response.json();
                        if (data.success && data.metadata.image) {
                          setEditForm(prev => ({ ...prev, image_url: data.metadata.image }));
                        }
                      } catch (error) {
                        console.error('Error fetching image:', error);
                      }
                    }}
                    disabled={!editForm.url}
                    className="gap-1 whitespace-nowrap"
                  >
                    <Download className="h-3 w-3" />
                    Fetch
                  </Button>
                </div>
                {editForm.image_url && (
                  <EditImagePreview imageUrl={editForm.image_url} />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-tags">Tags</Label>
                <div className="flex gap-2">
                  <Input
                    id="edit-tags"
                    placeholder="Add tags separated by commas"
                    value={editForm.tags.join(", ")}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        tags: e.target.value
                          .split(",")
                          .map((tag) => tag.trim())
                          .filter(Boolean),
                      }))
                    }
                  />
                </div>
                {editForm.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {editForm.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() =>
                            setEditForm((prev) => ({
                              ...prev,
                              tags: prev.tags.filter((_, i) => i !== index),
                            }))
                          }
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </SimpleKitModalBody>

          <SimpleKitModalFooter>
            <Button onClick={handleEditSubmit} className="w-full">
              Save Changes
            </Button>
          </SimpleKitModalFooter>
        </SimpleKitModalContent>
      </SimpleKitModal>

      {/* Resource Details Modal */}
      <SimpleKitModal
        open={!!showResourceDetails}
        onOpenChange={() => setShowResourceDetails(null)}
      >
        <SimpleKitModalContent>
          <SimpleKitModalHeader>
            <SimpleKitModalTitle>Resource Details</SimpleKitModalTitle>
          </SimpleKitModalHeader>

          <SimpleKitModalBody>
            {showResourceDetails && (
              <div className="space-y-4">
                <div className="flex gap-4">
                  {showResourceDetails.image_url && (
                    <img
                      src={showResourceDetails.image_url}
                      alt={showResourceDetails.name}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">
                      {showResourceDetails.name}
                    </h3>
                    <div className="flex gap-2 mb-2">
                      <Badge
                        variant={
                          showResourceDetails.status === "approved"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {showResourceDetails.status}
                      </Badge>
                      <Badge variant="outline">
                        {showResourceDetails.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {showResourceDetails.description}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>URL:</strong>
                    <a
                      href={showResourceDetails.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-blue-500 hover:underline truncate"
                    >
                      {showResourceDetails.url}
                    </a>
                  </div>
                  <div>
                    <strong>Created:</strong>
                    <span className="block">
                      {new Date(
                        showResourceDetails.created_at
                      ).toLocaleString()}
                    </span>
                  </div>
                  {showResourceDetails.subcategory && (
                    <div>
                      <strong>Subcategory:</strong>
                      <span className="block">
                        {showResourceDetails.subcategory}
                      </span>
                    </div>
                  )}
                  <div>
                    <strong>Tags:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {showResourceDetails.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </SimpleKitModalBody>
        </SimpleKitModalContent>
      </SimpleKitModal>

      {/* Category Manager Modal */}
      <SimpleKitModal
        open={showCategoryManager}
        onOpenChange={setShowCategoryManager}
      >
        <SimpleKitModalContent>
          <SimpleKitModalHeader>
            <SimpleKitModalTitle>Category Management</SimpleKitModalTitle>
            <p className="text-sm text-muted-foreground text-center mt-2">
              Add, edit, or remove categories and subcategories
            </p>
          </SimpleKitModalHeader>

          <SimpleKitModalBody>
            <Tabs defaultValue="categories" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="categories">Categories</TabsTrigger>
                <TabsTrigger value="subcategories">Subcategories</TabsTrigger>
              </TabsList>

              <TabsContent value="categories" className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="New category name"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                  <Button
                    onClick={() => {
                      if (newCategory.trim()) {
                        setCategories((prev) => [
                          ...prev,
                          newCategory.trim() as Category,
                        ]);
                        setNewCategory("");
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  {categories.map((category) => (
                    <div
                      key={category}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <span>{category}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setCategories((prev) =>
                            prev.filter((c) => c !== category)
                          )
                        }
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="subcategories" className="space-y-4">
                <div className="space-y-2">
                  <Select
                    value={selectedCategoryForSub}
                    onValueChange={(value) =>
                      setSelectedCategoryForSub(value as Category)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex gap-2">
                    <Input
                      placeholder="New subcategory name"
                      value={newSubcategory}
                      onChange={(e) => setNewSubcategory(e.target.value)}
                    />
                    <Button
                      onClick={() => {
                        if (newSubcategory.trim()) {
                          setNewSubcategory("");
                        }
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {subcategoriesMap[selectedCategoryForSub]?.map(
                    (subcategory) => (
                      <div
                        key={subcategory}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <span>{subcategory}</span>
                        <Button size="sm" variant="ghost">
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </SimpleKitModalBody>
        </SimpleKitModalContent>
      </SimpleKitModal>

      {/* Analytics Modal */}
      <SimpleKitModal open={showAnalytics} onOpenChange={setShowAnalytics}>
        <SimpleKitModalContent>
          <SimpleKitModalHeader>
            <SimpleKitModalTitle>Analytics Dashboard</SimpleKitModalTitle>
            <p className="text-sm text-muted-foreground text-center mt-2">
              Resource statistics and insights
            </p>
          </SimpleKitModalHeader>

          <SimpleKitModalBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Total Resources</span>
                </div>
                <div className="text-2xl font-bold">{allResources.length}</div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Approved</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {counts.approved}
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">Pending</span>
                </div>
                <div className="text-2xl font-bold text-yellow-600">
                  {counts.pending}
                </div>
              </Card>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Resources by Category</h4>
              {categories.map((category) => {
                const count = allResources.filter(
                  (r) => r.category === category
                ).length;
                const percentage =
                  allResources.length > 0
                    ? (count / allResources.length) * 100
                    : 0;

                return (
                  <div key={category} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{category}</span>
                      <span>
                        {count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </SimpleKitModalBody>
        </SimpleKitModalContent>
      </SimpleKitModal>

      {/* Delete Confirmation Modal */}
      <SimpleKitModal
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <SimpleKitModalContent>
          <SimpleKitModalHeader>
            <SimpleKitModalTitle className="text-destructive">
              Confirm Delete
            </SimpleKitModalTitle>
            <p className="text-sm text-muted-foreground text-center mt-2">
              {deleteConfirm?.type === "single"
                ? "This action cannot be undone. The resource will be permanently deleted."
                : `This action cannot be undone. ${deleteConfirm?.count} resources will be permanently deleted.`}
            </p>
          </SimpleKitModalHeader>

          <SimpleKitModalBody>
            {deleteConfirm?.type === "single" && deleteConfirm.resource && (
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/30">
                  <h4 className="font-medium mb-2">
                    {deleteConfirm.resource.name}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    {deleteConfirm.resource.description}
                  </p>
                  <div className="flex gap-2">
                    <Badge variant="outline">
                      {deleteConfirm.resource.category}
                    </Badge>
                    <Badge
                      variant={
                        deleteConfirm.resource.status === "approved"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {deleteConfirm.resource.status}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {deleteConfirm?.type === "bulk" && (
              <div className="text-center py-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
                  <Trash2 className="h-8 w-8 text-destructive" />
                </div>
                <p className="text-lg font-medium mb-2">
                  Delete {deleteConfirm.count} Resources
                </p>
                <p className="text-sm text-muted-foreground">
                  You are about to permanently delete {deleteConfirm.count}{" "}
                  selected resources.
                </p>
              </div>
            )}
          </SimpleKitModalBody>

          <SimpleKitModalFooter>
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmedDelete}
                className="flex-1"
              >
                Delete {deleteConfirm?.type === "bulk" ? "All" : ""}
              </Button>
            </div>
          </SimpleKitModalFooter>
        </SimpleKitModalContent>
      </SimpleKitModal>
    </div>
  );
}
