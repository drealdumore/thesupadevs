"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Resource, Category } from "@/lib/types/database";
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
  Search,
  Plus,
  BarChart3,
  Download,
  Clock,
  Percent,
  Loader2,
  Pencil,
  ExternalLink,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  SimpleKitModal,
  SimpleKitModalContent,
  SimpleKitModalHeader,
  SimpleKitModalTitle,
  SimpleKitModalBody,
  SimpleKitModalFooter,
} from "@/components/ui/simple-kit-modal";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { LoadingScreen } from "@/components/admin/LoadingScreen";
import { LoginForm } from "@/components/admin/LoginForm";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { FilterControls } from "@/components/admin/FilterControls";
import { ResourceCard } from "@/components/admin/ResourceCard";
import { BulkCategorizationModal } from "@/components/admin/BulkCategorizationModal";

type CategoryData = {
  id: string;
  name: string;
  created_at: string;
};

type SubcategoryData = {
  id: string;
  name: string;
  category_id: string;
  created_at: string;
};

type Suggestion = {
  id: string;
  currentCategory: string;
  suggestedCategory: string;
  confidence: string;
};

const getHostname = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

/* ---------- small presentational helpers ---------- */

function Field({
  id,
  label,
  required,
  hint,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  hint?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && (
          <span className="ml-0.5 text-destructive" aria-hidden="true">
            *
          </span>
        )}
      </Label>
      {children}
      {hint && <p className="text-sm text-destructive">{hint}</p>}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  iconClass = "",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  iconClass?: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className={`h-4 w-4 ${iconClass}`} />
        {label}
      </div>
      <div className="font-heading text-3xl font-bold">{value}</div>
    </div>
  );
}

function ManagerRow({
  label,
  count,
  deleting,
  onDelete,
}: {
  label: string;
  count: number;
  deleting: boolean;
  onDelete: () => void;
}) {
  return (
    <li className="flex items-center justify-between gap-3 border-t py-2.5 first:border-t-0">
      <span className="min-w-0 truncate text-sm font-medium">{label}</span>
      <div className="flex shrink-0 items-center gap-2">
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {count} {count === 1 ? "resource" : "resources"}
        </span>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          aria-label={`Delete ${label}`}
          onClick={onDelete}
          disabled={deleting}
        >
          {deleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </div>
    </li>
  );
}

// Image preview for the edit modal
function EditImagePreview({ imageUrl }: { imageUrl: string }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [imageUrl]);

  return (
    <div className="mt-2 rounded-xl border p-2">
      {imageUrl && !imageError ? (
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-md bg-muted">
          {!imageLoaded && (
            <div className="absolute inset-0 animate-pulse bg-muted" />
          )}
          <img
            src={imageUrl}
            alt="Resource preview"
            className={`h-full w-full object-cover transition-opacity duration-300 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            loading="lazy"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(false);
            }}
          />
        </div>
      ) : (
        <div className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-1 rounded-md bg-muted/30 text-muted-foreground/60">
          <ImageIcon className="h-8 w-8" strokeWidth={1.5} />
          <span className="text-xs">Image couldn&apos;t be loaded</span>
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
  const [hasLoaded, setHasLoaded] = useState(false);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadingStage, setLoadingStage] = useState("Authenticating");
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [allResources, setAllResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [subcategories, setSubcategories] = useState<SubcategoryData[]>([]);

  // Filtering & search
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "broken"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">(
    "all"
  );
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [brokenUrls, setBrokenUrls] = useState<Set<string>>(new Set());
  const [checkingUrls, setCheckingUrls] = useState(false);

  // Selection & bulk operations
  const [selectedResources, setSelectedResources] = useState<Set<string>>(
    new Set()
  );
  const [bulkOperating, setBulkOperating] = useState(false);

  // Modals & dialogs
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [saving, setSaving] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showResourceDetails, setShowResourceDetails] =
    useState<Resource | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: "single" | "bulk";
    resource?: Resource;
    count?: number;
  } | null>(null);

  // Edit resource form
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    url: "",
    category: "" as Category,
    subcategory: "",
    tags: [] as string[],
    image_url: "",
  });
  const [editTagInput, setEditTagInput] = useState("");

  // Category management
  const [newCategory, setNewCategory] = useState("");
  const [newSubcategory, setNewSubcategory] = useState("");
  const [selectedCategoryForSub, setSelectedCategoryForSub] =
    useState<string>("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [addingSubcategory, setAddingSubcategory] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);
  const [deletingSubcategory, setDeletingSubcategory] = useState<string | null>(
    null
  );

  // AI categorization
  const [showBulkCategorize, setShowBulkCategorize] = useState(false);
  const [categorizing, setCategorizing] = useState(false);
  const [categorySuggestions, setCategorySuggestions] = useState<Suggestion[]>(
    []
  );
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(
    new Set()
  );
  const [currentBatch, setCurrentBatch] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);
  const [batchSize] = useState(50);

  useEffect(() => {
    checkAuth();
  }, []);

  // Restore batch progress on the client only (avoids a hydration mismatch)
  useEffect(() => {
    setCurrentBatch(
      parseInt(localStorage.getItem("ai-batch-current") || "0", 10) || 0
    );
    setTotalBatches(
      parseInt(localStorage.getItem("ai-batch-total") || "0", 10) || 0
    );
  }, []);

  const fetchResources = useCallback(async () => {
    try {
      setResourcesLoading(true);
      setLoadingStage("Loading resources");
      setLoadingProgress(40);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAllResources(data || []);
      setLoadingProgress(90);
    } catch (error) {
      console.error("Error fetching resources:", error);
      toast.error("Couldn't load resources");
    } finally {
      setResourcesLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      setLoadingStage("Loading categories");
      setLoadingProgress(85);
      const supabase = createClient();
      const [categoriesRes, subcategoriesRes] = await Promise.all([
        supabase.from("categories").select("*").order("name"),
        supabase.from("subcategories").select("*").order("name"),
      ]);

      if (categoriesRes.error) throw categoriesRes.error;
      if (subcategoriesRes.error) throw subcategoriesRes.error;

      const cats = categoriesRes.data || [];
      setCategories(cats);
      setSubcategories(subcategoriesRes.data || []);
      setSelectedCategoryForSub((prev) =>
        prev && cats.some((c) => c.id === prev) ? prev : cats[0]?.id ?? ""
      );
      setLoadingProgress(95);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Couldn't load categories");
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  const filteredAndSortedResources = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return allResources
      .filter((resource) => {
        const matchesStatus =
          filter === "all" ||
          (filter === "broken"
            ? brokenUrls.has(resource.id)
            : resource.status === filter);
        const matchesSearch =
          q === "" ||
          resource.name.toLowerCase().includes(q) ||
          resource.description.toLowerCase().includes(q) ||
          resource.url.toLowerCase().includes(q) ||
          resource.tags.some((tag) => tag.toLowerCase().includes(q));
        const matchesCategory =
          selectedCategory === "all" || resource.category === selectedCategory;

        return matchesStatus && matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        let aVal: string | number = a[sortField];
        let bVal: string | number = b[sortField];

        if (sortField === "created_at") {
          aVal = new Date(aVal).getTime();
          bVal = new Date(bVal).getTime();
        }
        if (typeof aVal === "string" && typeof bVal === "string") {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }

        if (sortOrder === "asc") return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      });
  }, [
    allResources,
    filter,
    searchQuery,
    selectedCategory,
    sortField,
    sortOrder,
    brokenUrls,
  ]);

  // Never let hidden rows stay selected
  useEffect(() => {
    setSelectedResources((prev) => {
      if (prev.size === 0) return prev;
      const visible = new Set(filteredAndSortedResources.map((r) => r.id));
      const next = new Set([...prev].filter((id) => visible.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [filteredAndSortedResources]);

  const counts = {
    all: allResources.length,
    pending: allResources.filter((r) => r.status === "pending").length,
    approved: allResources.filter((r) => r.status === "approved").length,
    broken: brokenUrls.size,
  };

  // How many resources use each category / subcategory (shown in the manager)
  const usage = useMemo(() => {
    const byCategory: Record<string, number> = {};
    const bySub: Record<string, number> = {};
    allResources.forEach((r) => {
      byCategory[r.category] = (byCategory[r.category] ?? 0) + 1;
      if (r.subcategory) {
        const key = `${r.category}::${r.subcategory}`;
        bySub[key] = (bySub[key] ?? 0) + 1;
      }
    });
    return { byCategory, bySub };
  }, [allResources]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchResources();
      fetchCategories();
    }
  }, [isAuthenticated, fetchResources, fetchCategories]);

  useEffect(() => {
    const isLoading = resourcesLoading || categoriesLoading;
    setLoading(isLoading);
    if (!isLoading && isAuthenticated) {
      setLoadingStage("Ready");
      setLoadingProgress(100);
      setHasLoaded(true);
    }
  }, [resourcesLoading, categoriesLoading, isAuthenticated]);

  const getSubcategoriesForCategory = (categoryId: string) =>
    subcategories.filter((sub) => sub.category_id === categoryId);

  async function revalidateCache(tags?: string[]) {
    try {
      await fetch("/api/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags }),
      });
    } catch {
      // non-critical — cache expires naturally
    }
  }

  async function addCategory(name: string) {
    setAddingCategory(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("categories").insert({ name });
      if (error) throw error;
      await fetchCategories();
      await revalidateCache(["categories", "subcategories"]);
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Couldn't add category");
    } finally {
      setAddingCategory(false);
    }
  }

  async function deleteCategory(category: CategoryData) {
    const n = usage.byCategory[category.name] ?? 0;
    if (
      !window.confirm(
        `Delete "${category.name}"? ${n} ${
          n === 1 ? "resource uses" : "resources use"
        } it, and its subcategories may be removed too.`
      )
    )
      return;
    setDeletingCategory(category.id);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", category.id);
      if (error) throw error;
      await fetchCategories();
      await revalidateCache(["categories", "subcategories"]);
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Couldn't delete category");
    } finally {
      setDeletingCategory(null);
    }
  }

  async function addSubcategory(name: string, categoryId: string) {
    setAddingSubcategory(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("subcategories")
        .insert({ name, category_id: categoryId });
      if (error) throw error;
      await fetchCategories();
      await revalidateCache(["subcategories"]);
    } catch (error) {
      console.error("Error adding subcategory:", error);
      toast.error("Couldn't add subcategory");
    } finally {
      setAddingSubcategory(false);
    }
  }

  async function deleteSubcategory(sub: SubcategoryData, categoryName: string) {
    const n = usage.bySub[`${categoryName}::${sub.name}`] ?? 0;
    if (
      !window.confirm(
        `Delete "${sub.name}"? ${n} ${
          n === 1 ? "resource uses" : "resources use"
        } it.`
      )
    )
      return;
    setDeletingSubcategory(sub.id);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("subcategories")
        .delete()
        .eq("id", sub.id);
      if (error) throw error;
      await fetchCategories();
      await revalidateCache(["subcategories"]);
    } catch (error) {
      console.error("Error deleting subcategory:", error);
      toast.error("Couldn't delete subcategory");
    } finally {
      setDeletingSubcategory(null);
    }
  }

  async function checkAuth() {
    setLoadingStage("Authenticating");
    setLoadingProgress(10);
    try {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
      if (!data.session) setLoading(false);
      else setLoadingProgress(25);
    } catch (error) {
      console.error("Auth check failed:", error);
      setLoading(false);
    }
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
      toast.error("Login failed", {
        description: "Check your email and password.",
      });
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
      await fetchResources();
    } catch (error) {
      console.error("Error updating resource:", error);
      toast.error("Couldn't update status");
    }
  }

  async function deleteResource(id: string) {
    try {
      const supabase = createClient();
      const { error } = await supabase.from("resources").delete().eq("id", id);
      if (error) throw error;
      setSelectedResources((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setDeleteConfirm(null);
      await fetchResources();
      toast.success("Resource deleted");
    } catch (error) {
      console.error("Error deleting resource:", error);
      toast.error("Couldn't delete resource");
    }
  }

  function confirmDeleteResource(resource: Resource) {
    setDeleteConfirm({ type: "single", resource });
  }

  async function updateResource(
    id: string,
    updates: Partial<Resource>
  ): Promise<boolean> {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("resources")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
      await fetchResources();
      setEditingResource(null);
      return true;
    } catch (error) {
      console.error("Error updating resource:", error);
      toast.error("Couldn't save changes");
      return false;
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
        const status = operation === "approve" ? "approved" : operation;
        const { error } = await supabase
          .from("resources")
          .update({ status })
          .in("id", resourceIds);
        if (error) throw error;
      }

      setSelectedResources(new Set());
      setDeleteConfirm(null);
      await fetchResources();
      toast.success(`Updated ${resourceIds.length} resources`);
    } catch (error) {
      console.error("Bulk operation error:", error);
      toast.error(`Couldn't ${operation} those resources`, {
        description: "Check your permissions and try again.",
      });
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

  function toggleResourceSelection(id: string) {
    setSelectedResources((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllVisible() {
    setSelectedResources(new Set(filteredAndSortedResources.map((r) => r.id)));
  }

  function clearSelection() {
    setSelectedResources(new Set());
  }

  // Edit resource
  function openEditModal(resource: Resource) {
    setEditingResource(resource);
    setEditTagInput("");
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

  const nameOk = editForm.name.trim().length >= 2;
  const descriptionOk = editForm.description.trim().length >= 10;
  const urlOk = /^https?:\/\/\S+\.\S+/.test(editForm.url.trim());
  const editValid = nameOk && descriptionOk && urlOk && !!editForm.category;

  async function handleEditSubmit() {
    if (!editingResource || !editValid || saving) return;
    setSaving(true);
    const ok = await updateResource(editingResource.id, {
      name: editForm.name.trim(),
      description: editForm.description.trim(),
      url: editForm.url.trim(),
      category: editForm.category,
      subcategory: editForm.subcategory || null,
      tags: editForm.tags,
      image_url: editForm.image_url.trim() || null,
    });
    setSaving(false);
    if (ok) toast.success("Changes saved");
  }

  function addEditTag() {
    const tag = editTagInput.trim().replace(/,$/, "");
    if (!tag || editForm.tags.includes(tag)) return;
    setEditForm((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
    setEditTagInput("");
  }

  async function rescrapeImage(resource: Resource) {
    try {
      const response = await fetch(
        `/api/scrape-metadata?url=${encodeURIComponent(resource.url)}`
      );
      const data = await response.json();

      if (data.success && data.metadata.image) {
        await updateResource(resource.id, { image_url: data.metadata.image });
        toast.success("Image updated");
      } else {
        toast.error("No image found for that site");
      }
    } catch (error) {
      console.error("Error re-scraping image:", error);
      toast.error("Couldn't fetch the image");
    }
  }

  // Check for broken URLs, a few at a time
  async function checkBrokenUrls() {
    setCheckingUrls(true);
    const broken = new Set<string>();
    const concurrency = 5;

    for (let i = 0; i < allResources.length; i += concurrency) {
      const chunk = allResources.slice(i, i + concurrency);

      await Promise.all(
        chunk.map(async (resource) => {
          try {
            const response = await fetch(
              `/api/scrape-metadata?url=${encodeURIComponent(resource.url)}`
            );
            const data = await response.json();
            if (!data.success) broken.add(resource.id);
          } catch {
            broken.add(resource.id);
          }
        })
      );

      setBrokenUrls(new Set(broken));
    }

    setCheckingUrls(false);
    toast.success(`Link check done: ${broken.size} broken`);
  }

  // AI categorization. The batch index is passed in rather than read from state
  async function processBatch(batchIndex: number) {
    setCategorizing(true);
    const offset = batchIndex * batchSize;
    const batch = allResources.slice(offset, offset + batchSize);

    if (batch.length === 0) {
      setCategorizing(false);
      return;
    }

    try {
      const response = await fetch("/api/categorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resources: batch,
          categories,
          subcategories,
          offset,
          limit: batchSize,
        }),
      });
      if (!response.ok) throw new Error(`Request failed: ${response.status}`);

      const data = await response.json();
      if (data.suggestions) {
        const suggestions = data.suggestions as Suggestion[];
        setCategorySuggestions(suggestions);
        setSelectedSuggestions(
          new Set(
            suggestions
              .filter((s) => s.suggestedCategory !== s.currentCategory)
              .map((s) => s.id)
          )
        );
      }
    } catch (error) {
      console.error("Error categorizing batch:", error);
      toast.error("Categorization failed", {
        description: "Try this batch again.",
      });
    } finally {
      setCategorizing(false);
    }
  }

  function startBatchCategorization() {
    const total = Math.ceil(allResources.length / batchSize);
    setCurrentBatch(0);
    setTotalBatches(total);
    localStorage.setItem("ai-batch-current", "0");
    localStorage.setItem("ai-batch-total", total.toString());
    setCategorySuggestions([]);
    setSelectedSuggestions(new Set());
    processBatch(0);
  }

  function proceedToNextBatch() {
    const nextBatch = currentBatch + 1;
    setCurrentBatch(nextBatch);
    localStorage.setItem("ai-batch-current", nextBatch.toString());
    setCategorySuggestions([]);
    setSelectedSuggestions(new Set());
    processBatch(nextBatch);
  }

  async function applyCategorySuggestions(suggestions: Suggestion[]) {
    const changes = suggestions.filter(
      (s) => s.suggestedCategory !== s.currentCategory
    );

    try {
      const supabase = createClient();
      const results = await Promise.all(
        changes.map((s) =>
          supabase
            .from("resources")
            .update({ category: s.suggestedCategory, subcategory: null })
            .eq("id", s.id)
        )
      );
      const failed = results.filter((r) => r.error).length;

      await fetchResources();

      if (failed > 0) {
        toast.error(`${failed} of ${changes.length} updates failed`);
        return;
      }
      toast.success(`Recategorized ${changes.length} resources`);

      if (currentBatch + 1 < totalBatches) {
        proceedToNextBatch();
      } else {
        setShowBulkCategorize(false);
        setCategorySuggestions([]);
        setSelectedSuggestions(new Set());
        setCurrentBatch(0);
        setTotalBatches(0);
        localStorage.removeItem("ai-batch-current");
        localStorage.removeItem("ai-batch-total");
      }
    } catch (error) {
      console.error("Error applying suggestions:", error);
      toast.error("Couldn't apply suggestions");
    }
  }

  function toggleSuggestionSelection(id: string) {
    setSelectedSuggestions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function applySelectedSuggestions() {
    applyCategorySuggestions(
      categorySuggestions.filter(
        (s) =>
          selectedSuggestions.has(s.id) &&
          s.suggestedCategory !== s.currentCategory
      )
    );
  }

  function resetBatchState() {
    setCategorySuggestions([]);
    setSelectedSuggestions(new Set());
    setCurrentBatch(0);
    setTotalBatches(0);
    setCategorizing(false);
    localStorage.removeItem("ai-batch-current");
    localStorage.removeItem("ai-batch-total");
  }

  // Only the first load takes over the screen; later refreshes keep the page
  if (loading && !hasLoaded) {
    return (
      <LoadingScreen
        loadingStage={loadingStage}
        loadingProgress={loadingProgress}
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <LoginForm
        email={email}
        password={password}
        loggingIn={loggingIn}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={handleLogin}
      />
    );
  }

  const editCategoryData = categories.find((c) => c.name === editForm.category);
  const editSubcategories = editCategoryData
    ? getSubcategoriesForCategory(editCategoryData.id)
    : [];

  const managerCategoryName =
    categories.find((c) => c.id === selectedCategoryForSub)?.name ?? "";
  const managerSubcategories = getSubcategoriesForCategory(
    selectedCategoryForSub
  );

  const approvalRate =
    allResources.length > 0
      ? Math.round((counts.approved / allResources.length) * 100)
      : 0;
  const categoriesByCount = [...categories].sort(
    (a, b) => (usage.byCategory[b.name] ?? 0) - (usage.byCategory[a.name] ?? 0)
  );

  return (
    // overflow-x-clip (not hidden) so sticky children keep working
    <div className="container max-w-7xl space-y-6 overflow-x-clip py-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <AdminHeader
          counts={counts}
          onShowAnalytics={() => setShowAnalytics(true)}
          onShowCategoryManager={() => setShowCategoryManager(true)}
          onShowBulkCategorize={() => setShowBulkCategorize(true)}
          onLogout={handleLogout}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
      >
        <FilterControls
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
          filter={filter}
          onFilterChange={setFilter}
          counts={counts}
          selectedResources={selectedResources}
          bulkOperating={bulkOperating}
          onBulkOperation={handleBulkOperation}
          onClearSelection={clearSelection}
          onSelectAllVisible={selectAllVisible}
          onConfirmBulkDelete={confirmBulkDelete}
          onRefresh={fetchResources}
          filteredCount={filteredAndSortedResources.length}
          totalCount={allResources.length}
          onSortChange={(field, order) => {
            setSortField(field);
            setSortOrder(order);
          }}
          onCheckBrokenUrls={checkBrokenUrls}
          checkingUrls={checkingUrls}
        />
      </motion.div>

      {/* Resources list */}
      <AnimatePresence mode="wait">
        {filteredAndSortedResources.length === 0 ? (
          <motion.div
            key="no-results"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="rounded-2xl border border-dashed bg-card px-6 py-16 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-heading text-lg font-semibold">
                No resources match
              </h3>
              <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                Try a different search, or clear the status and category
                filters.
              </p>
              {(searchQuery ||
                filter !== "all" ||
                selectedCategory !== "all") && (
                <Button
                  variant="outline"
                  className="mt-5 rounded-full"
                  onClick={() => {
                    setSearchQuery("");
                    setFilter("all");
                    setSelectedCategory("all");
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-3"
          >
            {filteredAndSortedResources.map((resource, index) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                // Capped so row 300 doesn't wait seconds to appear
                transition={{
                  duration: 0.3,
                  delay: Math.min(index, 12) * 0.025,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <ResourceCard
                  resource={resource}
                  index={index}
                  isSelected={selectedResources.has(resource.id)}
                  onToggleSelection={toggleResourceSelection}
                  onEdit={openEditModal}
                  onShowDetails={setShowResourceDetails}
                  onUpdateStatus={updateResourceStatus}
                  onConfirmDelete={confirmDeleteResource}
                  onRescrapeImage={rescrapeImage}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------- Edit resource ---------- */}
      <SimpleKitModal
        open={!!editingResource}
        onOpenChange={(o) => {
          if (!o) setEditingResource(null);
        }}
      >
        <SimpleKitModalContent>
          <SimpleKitModalHeader>
            <SimpleKitModalTitle>Edit resource</SimpleKitModalTitle>
            {editingResource && (
              <p className="mt-2 text-center text-sm text-muted-foreground">
                {getHostname(editingResource.url)} · saved immediately
              </p>
            )}
          </SimpleKitModalHeader>

          <SimpleKitModalBody>
            <form
              id="edit-form"
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                handleEditSubmit();
              }}
            >
              <Field
                id="edit-name"
                label="Name"
                required
                hint={
                  editForm.name && !nameOk
                    ? "Name must be at least 2 characters"
                    : null
                }
              >
                <Input
                  id="edit-name"
                  placeholder="e.g., Framer Motion"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </Field>

              <Field
                id="edit-url"
                label="Link"
                required
                hint={
                  editForm.url && !urlOk
                    ? "Enter a full URL, like https://example.com"
                    : null
                }
              >
                <Input
                  id="edit-url"
                  type="text"
                  inputMode="url"
                  placeholder="https://example.com"
                  value={editForm.url}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, url: e.target.value }))
                  }
                />
              </Field>

              <Field
                id="edit-description"
                label="Description"
                required
                hint={
                  editForm.description && !descriptionOk
                    ? "Description must be at least 10 characters"
                    : null
                }
              >
                <Textarea
                  id="edit-description"
                  placeholder="What does it do, and why is it useful?"
                  rows={4}
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="edit-category" label="Category" required>
                  <Select
                    value={editForm.category}
                    onValueChange={(value) =>
                      setEditForm((prev) => ({
                        ...prev,
                        category: value as Category,
                        // A subcategory only belongs to its own category
                        subcategory:
                          value === prev.category ? prev.subcategory : "",
                      }))
                    }
                  >
                    <SelectTrigger id="edit-category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                {editSubcategories.length > 0 && (
                  <Field id="edit-subcategory" label="Subcategory">
                    <Select
                      value={editForm.subcategory}
                      onValueChange={(value) =>
                        setEditForm((prev) => ({ ...prev, subcategory: value }))
                      }
                    >
                      <SelectTrigger id="edit-subcategory">
                        <SelectValue placeholder="Optional" />
                      </SelectTrigger>
                      <SelectContent>
                        {editSubcategories.map((subcat) => (
                          <SelectItem key={subcat.id} value={subcat.name}>
                            {subcat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              </div>

              <Field id="edit-image" label="Image URL">
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
                          `/api/scrape-metadata?url=${encodeURIComponent(
                            editForm.url
                          )}`
                        );
                        const data = await response.json();
                        if (data.success && data.metadata.image) {
                          setEditForm((prev) => ({
                            ...prev,
                            image_url: data.metadata.image,
                          }));
                        } else {
                          toast.error("No image found for that site");
                        }
                      } catch (error) {
                        console.error("Error fetching image:", error);
                        toast.error("Couldn't fetch the image");
                      }
                    }}
                    disabled={!editForm.url}
                    className="h-10 gap-1 whitespace-nowrap"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Fetch
                  </Button>
                </div>
                {editForm.image_url && (
                  <EditImagePreview imageUrl={editForm.image_url} />
                )}
              </Field>

              <Field id="edit-tags" label="Tags">
                <div className="flex gap-2">
                  <Input
                    id="edit-tags"
                    placeholder="Type a tag, then press Enter"
                    value={editTagInput}
                    onChange={(e) => setEditTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        addEditTag();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addEditTag}>
                    Add
                  </Button>
                </div>
                {editForm.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {editForm.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button
                          type="button"
                          aria-label={`Remove tag ${tag}`}
                          onClick={() =>
                            setEditForm((prev) => ({
                              ...prev,
                              tags: prev.tags.filter((t) => t !== tag),
                            }))
                          }
                          className="ml-1 rounded hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </Field>
            </form>
          </SimpleKitModalBody>

          <SimpleKitModalFooter>
            <div className="flex w-full gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-full"
                onClick={() => setEditingResource(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="edit-form"
                disabled={!editValid || saving}
                className="flex-1 gap-2 rounded-full"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </SimpleKitModalFooter>
        </SimpleKitModalContent>
      </SimpleKitModal>

      {/* ---------- Resource details ---------- */}
      <SimpleKitModal
        open={!!showResourceDetails}
        onOpenChange={(o) => {
          if (!o) setShowResourceDetails(null);
        }}
      >
        <SimpleKitModalContent>
          <SimpleKitModalHeader>
            <SimpleKitModalTitle>Resource details</SimpleKitModalTitle>
          </SimpleKitModalHeader>

          <SimpleKitModalBody>
            {showResourceDetails && (
              <div className="space-y-5">
                {showResourceDetails.image_url && (
                  <img
                    src={showResourceDetails.image_url}
                    alt=""
                    className="aspect-video w-full rounded-xl border object-cover"
                  />
                )}

                <div className="space-y-2">
                  <h3 className="font-heading text-xl font-semibold leading-tight">
                    {showResourceDetails.name}
                  </h3>
                  <div className="flex flex-wrap gap-2">
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
                      {showResourceDetails.subcategory
                        ? ` / ${showResourceDetails.subcategory}`
                        : ""}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {showResourceDetails.description}
                  </p>
                </div>

                <dl className="grid grid-cols-2 gap-x-4 gap-y-4 rounded-xl border p-4 text-sm">
                  <div className="min-w-0">
                    <dt className="text-xs text-muted-foreground">Link</dt>
                    <dd className="truncate font-medium">
                      {getHostname(showResourceDetails.url)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Added</dt>
                    <dd className="font-medium">
                      {new Date(
                        showResourceDetails.created_at
                      ).toLocaleDateString(undefined, { dateStyle: "medium" })}
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="mb-1 text-xs text-muted-foreground">Tags</dt>
                    <dd className="flex flex-wrap gap-1">
                      {showResourceDetails.tags.length > 0 ? (
                        showResourceDetails.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground">No tags</span>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            )}
          </SimpleKitModalBody>

          {showResourceDetails && (
            <SimpleKitModalFooter>
              <div className="flex w-full gap-2">
                <Button
                  asChild
                  variant="outline"
                  className="flex-1 gap-2 rounded-full"
                >
                  <a
                    href={showResourceDetails.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Visit site
                  </a>
                </Button>
                <Button
                  className="flex-1 gap-2 rounded-full"
                  onClick={() => {
                    const r = showResourceDetails;
                    setShowResourceDetails(null);
                    openEditModal(r);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
              </div>
            </SimpleKitModalFooter>
          )}
        </SimpleKitModalContent>
      </SimpleKitModal>

      {/* ---------- Category manager ---------- */}
      <SimpleKitModal
        open={showCategoryManager}
        onOpenChange={setShowCategoryManager}
      >
        <SimpleKitModalContent>
          <SimpleKitModalHeader>
            <SimpleKitModalTitle>Categories</SimpleKitModalTitle>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Add or remove categories and subcategories
            </p>
          </SimpleKitModalHeader>

          <SimpleKitModalBody>
            <Tabs defaultValue="categories" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="categories">
                  Categories ({categories.length})
                </TabsTrigger>
                <TabsTrigger value="subcategories">Subcategories</TabsTrigger>
              </TabsList>

              <TabsContent value="categories" className="mt-4 space-y-4">
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const name = newCategory.trim();
                    if (name) {
                      addCategory(name);
                      setNewCategory("");
                    }
                  }}
                >
                  <Input
                    placeholder="New category name"
                    aria-label="New category name"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                  <Button
                    type="submit"
                    className="gap-1"
                    disabled={addingCategory || !newCategory.trim()}
                  >
                    {addingCategory ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    Add
                  </Button>
                </form>

                {categories.length === 0 ? (
                  <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                    No categories yet.
                  </p>
                ) : (
                  <ul className="rounded-xl border px-3">
                    {categories.map((category) => (
                      <ManagerRow
                        key={category.id}
                        label={category.name}
                        count={usage.byCategory[category.name] ?? 0}
                        deleting={deletingCategory === category.id}
                        onDelete={() => deleteCategory(category)}
                      />
                    ))}
                  </ul>
                )}
              </TabsContent>

              <TabsContent value="subcategories" className="mt-4 space-y-4">
                <Select
                  value={selectedCategoryForSub}
                  onValueChange={setSelectedCategoryForSub}
                >
                  <SelectTrigger aria-label="Category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const name = newSubcategory.trim();
                    if (name && selectedCategoryForSub) {
                      addSubcategory(name, selectedCategoryForSub);
                      setNewSubcategory("");
                    }
                  }}
                >
                  <Input
                    placeholder="New subcategory name"
                    aria-label="New subcategory name"
                    value={newSubcategory}
                    onChange={(e) => setNewSubcategory(e.target.value)}
                  />
                  <Button
                    type="submit"
                    className="gap-1"
                    disabled={
                      !selectedCategoryForSub ||
                      addingSubcategory ||
                      !newSubcategory.trim()
                    }
                  >
                    {addingSubcategory ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    Add
                  </Button>
                </form>

                {managerSubcategories.length === 0 ? (
                  <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                    No subcategories for{" "}
                    {managerCategoryName || "this category"} yet.
                  </p>
                ) : (
                  <ul className="rounded-xl border px-3">
                    {managerSubcategories.map((subcategory) => (
                      <ManagerRow
                        key={subcategory.id}
                        label={subcategory.name}
                        count={
                          usage.bySub[
                            `${managerCategoryName}::${subcategory.name}`
                          ] ?? 0
                        }
                        deleting={deletingSubcategory === subcategory.id}
                        onDelete={() =>
                          deleteSubcategory(subcategory, managerCategoryName)
                        }
                      />
                    ))}
                  </ul>
                )}
              </TabsContent>
            </Tabs>
          </SimpleKitModalBody>
        </SimpleKitModalContent>
      </SimpleKitModal>

      {/* ---------- Analytics ---------- */}
      <SimpleKitModal open={showAnalytics} onOpenChange={setShowAnalytics}>
        <SimpleKitModalContent>
          <SimpleKitModalHeader>
            <SimpleKitModalTitle>Analytics</SimpleKitModalTitle>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              How the library is doing
            </p>
          </SimpleKitModalHeader>

          <SimpleKitModalBody>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <StatCard
                icon={BarChart3}
                label="Total"
                value={allResources.length}
                iconClass="text-blue-500"
              />
              <StatCard
                icon={Check}
                label="Approved"
                value={counts.approved}
                iconClass="text-green-500"
              />
              <StatCard
                icon={Clock}
                label="Pending"
                value={counts.pending}
                iconClass="text-yellow-500"
              />
              <StatCard
                icon={Percent}
                label="Approval rate"
                value={`${approvalRate}%`}
              />
            </div>

            <div className="mt-8 space-y-4">
              <h4 className="font-heading text-lg font-semibold">
                Resources by category
              </h4>
              {categoriesByCount.map((category) => {
                const count = usage.byCategory[category.name] ?? 0;
                const percentage =
                  allResources.length > 0
                    ? (count / allResources.length) * 100
                    : 0;

                return (
                  <div key={category.id} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{category.name}</span>
                      <span className="text-muted-foreground">
                        {count} · {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary transition-all"
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

      <BulkCategorizationModal
        open={showBulkCategorize}
        onOpenChange={setShowBulkCategorize}
        allResources={allResources}
        batchSize={batchSize}
        currentBatch={currentBatch}
        totalBatches={totalBatches}
        categorizing={categorizing}
        categorySuggestions={categorySuggestions}
        selectedSuggestions={selectedSuggestions}
        onStartBatchCategorization={startBatchCategorization}
        onToggleSuggestionSelection={toggleSuggestionSelection}
        onApplySelectedSuggestions={applySelectedSuggestions}
        onProceedToNextBatch={proceedToNextBatch}
        onResetBatchState={resetBatchState}
      />

      {/* ---------- Delete confirmation ---------- */}
      <SimpleKitModal
        open={!!deleteConfirm}
        onOpenChange={(o) => {
          if (!o) setDeleteConfirm(null);
        }}
      >
        <SimpleKitModalContent>
          <SimpleKitModalHeader>
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <Trash2 className="h-6 w-6 text-destructive" />
            </div>
            <SimpleKitModalTitle>
              {deleteConfirm?.type === "bulk"
                ? `Delete ${deleteConfirm.count} resources?`
                : "Delete this resource?"}
            </SimpleKitModalTitle>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              This can&apos;t be undone.
            </p>
          </SimpleKitModalHeader>

          {deleteConfirm?.type === "single" && deleteConfirm.resource && (
            <SimpleKitModalBody>
              <div className="rounded-xl border bg-muted/30 p-4">
                <h4 className="mb-1 font-heading font-semibold">
                  {deleteConfirm.resource.name}
                </h4>
                <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
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
            </SimpleKitModalBody>
          )}

          <SimpleKitModalFooter>
            <div className="flex w-full gap-2">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 rounded-full"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmedDelete}
                disabled={bulkOperating}
                className="flex-1 gap-2 rounded-full"
              >
                {bulkOperating && <Loader2 className="h-4 w-4 animate-spin" />}
                Delete{deleteConfirm?.type === "bulk" ? " all" : ""}
              </Button>
            </div>
          </SimpleKitModalFooter>
        </SimpleKitModalContent>
      </SimpleKitModal>
    </div>
  );
}