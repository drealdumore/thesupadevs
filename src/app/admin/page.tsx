"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Resource, Category } from "@/lib/types/database";
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
  Search,
  Plus,
  BarChart3,
  RefreshCw,
  Download,
  Clock,
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

// Image preview for the edit modal
function EditImagePreview({ imageUrl }: { imageUrl: string }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [imageUrl]);

  return (
    <div className="mt-2 rounded-lg border p-2">
      <p className="mb-2 text-xs text-muted-foreground">Preview image</p>
      {imageUrl && !imageError ? (
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded bg-muted">
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
        <div className="flex aspect-[16/9] w-full items-center justify-center rounded bg-muted/30 text-muted-foreground/50">
          <ImageIcon className="h-8 w-8" strokeWidth={1.5} />
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
      // Keep the current pick; only fall back to the first category when the
      // pick is empty or was deleted
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

  // Never let hidden rows stay selected: otherwise "select all", then a new
  // filter, then "delete" would remove resources you can't see
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

  async function addCategory(name: string) {
    setAddingCategory(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("categories").insert({ name });
      if (error) throw error;
      await fetchCategories();
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Couldn't add category");
    } finally {
      setAddingCategory(false);
    }
  }

  async function deleteCategory(id: string) {
    if (
      !window.confirm(
        "Delete this category? Its subcategories may be removed too."
      )
    )
      return;
    setDeletingCategory(id);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
      await fetchCategories();
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
    } catch (error) {
      console.error("Error adding subcategory:", error);
      toast.error("Couldn't add subcategory");
    } finally {
      setAddingSubcategory(false);
    }
  }

  async function deleteSubcategory(id: string) {
    if (!window.confirm("Delete this subcategory?")) return;
    setDeletingSubcategory(id);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("subcategories")
        .delete()
        .eq("id", id);
      if (error) throw error;
      await fetchCategories();
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

  const editValid =
    editForm.name.trim().length >= 2 &&
    editForm.description.trim().length >= 10 &&
    /^https?:\/\/\S+\.\S+/.test(editForm.url.trim()) &&
    !!editForm.category;

  function handleEditSubmit() {
    if (!editingResource || !editValid) return;
    updateResource(editingResource.id, {
      name: editForm.name.trim(),
      description: editForm.description.trim(),
      url: editForm.url.trim(),
      category: editForm.category,
      subcategory: editForm.subcategory || null,
      tags: editForm.tags,
      image_url: editForm.image_url.trim() || null,
    }).then((ok) => ok && toast.success("Changes saved"));
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

      setBrokenUrls(new Set(broken)); // incremental progress
    }

    setCheckingUrls(false);
    toast.success(`Link check done: ${broken.size} broken`);
  }

  // AI categorization. The batch index is passed in rather than read from
  // state, because state is stale inside the callbacks that start the next batch
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
      // The old subcategory belongs to the old category, so it is cleared too
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
        return; // stay on this batch so nothing is skipped
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

  return (
    <div className="container max-w-7xl overflow-x-hidden py-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
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
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
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
      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {filteredAndSortedResources.length === 0 ? (
            <motion.div
              key="no-results"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-2 p-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/30">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="mb-2 text-muted-foreground">No resources found</p>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {filteredAndSortedResources.map((resource, index) => (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  // Delay is capped: an uncapped index * 0.05 made row 300 wait 15s
                  transition={{
                    duration: 0.35,
                    delay: Math.min(index, 12) * 0.03,
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
      </div>

      {/* Edit resource modal */}
      <SimpleKitModal
        open={!!editingResource}
        onOpenChange={(o) => {
          if (!o) setEditingResource(null);
        }}
      >
        <SimpleKitModalContent>
          <SimpleKitModalHeader>
            <SimpleKitModalTitle>Edit resource</SimpleKitModalTitle>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Update the details. Changes are saved immediately.
            </p>
          </SimpleKitModalHeader>

          <SimpleKitModalBody>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name *</Label>
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
              </div>

              {editSubcategories.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="edit-subcategory">Subcategory</Label>
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
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description *</Label>
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
            <Button
              onClick={handleEditSubmit}
              disabled={!editValid}
              className="w-full"
            >
              Save changes
            </Button>
          </SimpleKitModalFooter>
        </SimpleKitModalContent>
      </SimpleKitModal>

      {/* Resource details modal */}
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
              <div className="space-y-4">
                <div className="flex gap-4">
                  {showResourceDetails.image_url && (
                    <img
                      src={showResourceDetails.image_url}
                      alt={showResourceDetails.name}
                      className="h-24 w-24 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="mb-2 text-lg font-semibold">
                      {showResourceDetails.name}
                    </h3>
                    <div className="mb-2 flex gap-2">
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
                      className="block truncate text-primary hover:underline"
                    >
                      {showResourceDetails.url}
                    </a>
                  </div>
                  <div>
                    <strong>Created:</strong>
                    <span className="block">
                      {new Date(showResourceDetails.created_at).toLocaleString()}
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
                    <div className="mt-1 flex flex-wrap gap-1">
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

      {/* Category manager modal */}
      <SimpleKitModal
        open={showCategoryManager}
        onOpenChange={setShowCategoryManager}
      >
        <SimpleKitModalContent>
          <SimpleKitModalHeader>
            <SimpleKitModalTitle>Category management</SimpleKitModalTitle>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Add or remove categories and subcategories
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
                    aria-label="Add category"
                    onClick={() => {
                      if (newCategory.trim()) {
                        addCategory(newCategory.trim());
                        setNewCategory("");
                      }
                    }}
                    disabled={addingCategory}
                  >
                    {addingCategory ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <div className="space-y-2">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between rounded border p-2"
                    >
                      <span>{category.name}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label={`Delete ${category.name}`}
                        onClick={() => deleteCategory(category.id)}
                        disabled={deletingCategory === category.id}
                      >
                        {deletingCategory === category.id ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : (
                          <X className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="subcategories" className="space-y-4">
                <div className="space-y-2">
                  <Select
                    value={selectedCategoryForSub}
                    onValueChange={setSelectedCategoryForSub}
                  >
                    <SelectTrigger>
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

                  <div className="flex gap-2">
                    <Input
                      placeholder="New subcategory name"
                      value={newSubcategory}
                      onChange={(e) => setNewSubcategory(e.target.value)}
                    />
                    <Button
                      aria-label="Add subcategory"
                      onClick={() => {
                        if (newSubcategory.trim() && selectedCategoryForSub) {
                          addSubcategory(
                            newSubcategory.trim(),
                            selectedCategoryForSub
                          );
                          setNewSubcategory("");
                        }
                      }}
                      disabled={!selectedCategoryForSub || addingSubcategory}
                    >
                      {addingSubcategory ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {getSubcategoriesForCategory(selectedCategoryForSub).map(
                    (subcategory) => (
                      <div
                        key={subcategory.id}
                        className="flex items-center justify-between rounded border p-2"
                      >
                        <span>{subcategory.name}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label={`Delete ${subcategory.name}`}
                          onClick={() => deleteSubcategory(subcategory.id)}
                          disabled={deletingSubcategory === subcategory.id}
                        >
                          {deletingSubcategory === subcategory.id ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
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

      {/* Analytics modal */}
      <SimpleKitModal open={showAnalytics} onOpenChange={setShowAnalytics}>
        <SimpleKitModalContent>
          <SimpleKitModalHeader>
            <SimpleKitModalTitle>Analytics</SimpleKitModalTitle>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Resource statistics and insights
            </p>
          </SimpleKitModalHeader>

          <SimpleKitModalBody>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card className="p-4">
                <div className="mb-2 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Total</span>
                </div>
                <div className="text-2xl font-bold">{allResources.length}</div>
              </Card>

              <Card className="p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Approved</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {counts.approved}
                </div>
              </Card>

              <Card className="p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">Pending</span>
                </div>
                <div className="text-2xl font-bold text-yellow-600">
                  {counts.pending}
                </div>
              </Card>
            </div>

            <div className="mt-6 space-y-4">
              <h4 className="font-medium">Resources by category</h4>
              {categories.map((category) => {
                const count = allResources.filter(
                  (r) => r.category === category.name
                ).length;
                const percentage =
                  allResources.length > 0
                    ? (count / allResources.length) * 100
                    : 0;

                return (
                  <div key={category.id} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{category.name}</span>
                      <span>
                        {count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
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

      {/* Delete confirmation modal */}
      <SimpleKitModal
        open={!!deleteConfirm}
        onOpenChange={(o) => {
          if (!o) setDeleteConfirm(null);
        }}
      >
        <SimpleKitModalContent>
          <SimpleKitModalHeader>
            <SimpleKitModalTitle className="text-destructive">
              Confirm delete
            </SimpleKitModalTitle>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              {deleteConfirm?.type === "single"
                ? "This can't be undone. The resource will be permanently deleted."
                : `This can't be undone. ${deleteConfirm?.count} resources will be permanently deleted.`}
            </p>
          </SimpleKitModalHeader>

          <SimpleKitModalBody>
            {deleteConfirm?.type === "single" && deleteConfirm.resource && (
              <div className="rounded-lg border bg-muted/30 p-4">
                <h4 className="mb-2 font-medium">
                  {deleteConfirm.resource.name}
                </h4>
                <p className="mb-2 text-sm text-muted-foreground">
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
            )}

            {deleteConfirm?.type === "bulk" && (
              <div className="py-4 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                  <Trash2 className="h-8 w-8 text-destructive" />
                </div>
                <p className="mb-2 text-lg font-medium">
                  Delete {deleteConfirm.count} resources
                </p>
                <p className="text-sm text-muted-foreground">
                  You&apos;re about to permanently delete {deleteConfirm.count}{" "}
                  selected resources.
                </p>
              </div>
            )}
          </SimpleKitModalBody>

          <SimpleKitModalFooter>
            <div className="flex w-full gap-2">
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
                disabled={bulkOperating}
                className="flex-1"
              >
                Delete{deleteConfirm?.type === "bulk" ? " all" : ""}
              </Button>
            </div>
          </SimpleKitModalFooter>
        </SimpleKitModalContent>
      </SimpleKitModal>
    </div>
  );
}