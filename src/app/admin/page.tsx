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
  WandSparkles,
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

// Import new components
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

          {imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
          )}
        </div>
      ) : (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted/30 rounded flex items-center justify-center">
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
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z"
              />
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
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadingStage, setLoadingStage] = useState('Authenticating');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [allResources, setAllResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [subcategories, setSubcategories] = useState<SubcategoryData[]>([]);

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
    useState<string>("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [addingSubcategory, setAddingSubcategory] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);
  const [deletingSubcategory, setDeletingSubcategory] = useState<string | null>(
    null
  );

  // AI Categorization
  const [showBulkCategorize, setShowBulkCategorize] = useState(false);
  const [categorizing, setCategorizing] = useState(false);
  const [categorySuggestions, setCategorySuggestions] = useState<
    Array<{
      id: string;
      currentCategory: string;
      suggestedCategory: string;
      confidence: string;
    }>
  >([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set());
  const [currentBatch, setCurrentBatch] = useState(() => {
    if (typeof window !== 'undefined') {
      return parseInt(localStorage.getItem('ai-batch-current') || '0');
    }
    return 0;
  });
  const [totalBatches, setTotalBatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return parseInt(localStorage.getItem('ai-batch-total') || '0');
    }
    return 0;
  });
  const [batchSize] = useState(50);

  useEffect(() => {
    checkAuth();
  }, []);

  const fetchResources = useCallback(async () => {
    try {
      setResourcesLoading(true);
      setLoadingStage('Loading Resources');
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
    } finally {
      setResourcesLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      setLoadingStage('Loading Categories');
      setLoadingProgress(85);
      const supabase = createClient();
      const [categoriesRes, subcategoriesRes] = await Promise.all([
        supabase.from("categories").select("*").order("name"),
        supabase.from("subcategories").select("*").order("name"),
      ]);

      if (categoriesRes.error) throw categoriesRes.error;
      if (subcategoriesRes.error) throw subcategoriesRes.error;

      setCategories(categoriesRes.data || []);
      setSubcategories(subcategoriesRes.data || []);
      if (categoriesRes.data?.[0]) {
        setSelectedCategoryForSub(categoriesRes.data[0].id);
      }
      setLoadingProgress(95);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setCategoriesLoading(false);
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
      let aVal: string | number | Date = a[sortField];
      let bVal: string | number | Date = b[sortField];

      if (sortField === "created_at") {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      if (typeof aVal === "string" && typeof bVal === "string") {
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
      fetchCategories();
    }
  }, [isAuthenticated, fetchResources, fetchCategories]);

  useEffect(() => {
    const isLoading = resourcesLoading || categoriesLoading;
    setLoading(isLoading);
    if (!isLoading && isAuthenticated) {
      setLoadingStage('Ready');
      setLoadingProgress(100);
    }
  }, [resourcesLoading, categoriesLoading, isAuthenticated]);

  const getSubcategoriesForCategory = (categoryId: string) => {
    return subcategories.filter((sub) => sub.category_id === categoryId);
  };

  async function addCategory(name: string) {
    setAddingCategory(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("categories").insert({ name });
      if (error) throw error;
      fetchCategories();
    } catch (error) {
      console.error("Error adding category:", error);
    } finally {
      setAddingCategory(false);
    }
  }

  async function deleteCategory(id: string) {
    setDeletingCategory(id);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
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
      fetchCategories();
    } catch (error) {
      console.error("Error adding subcategory:", error);
    } finally {
      setAddingSubcategory(false);
    }
  }

  async function deleteSubcategory(id: string) {
    setDeletingSubcategory(id);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("subcategories")
        .delete()
        .eq("id", id);
      if (error) throw error;
      fetchCategories();
    } catch (error) {
      console.error("Error deleting subcategory:", error);
    } finally {
      setDeletingSubcategory(null);
    }
  }

  async function checkAuth() {
    setLoadingStage('Authenticating');
    setLoadingProgress(10);
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    setIsAuthenticated(!!data.session);
    if (!data.session) {
      setLoading(false);
    } else {
      setLoadingProgress(25);
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

  // AI Categorization
  async function startBatchCategorization() {
    const total = Math.ceil(allResources.length / batchSize);
    setCurrentBatch(0);
    setTotalBatches(total);
    localStorage.setItem('ai-batch-current', '0');
    localStorage.setItem('ai-batch-total', total.toString());
    setCategorySuggestions([]);
    setSelectedSuggestions(new Set());
    processNextBatch();
  }

  async function processNextBatch() {
    setCategorizing(true);
    const batchNum = currentBatch + 1;
    const offset = currentBatch * batchSize;
    const batch = allResources.slice(offset, offset + batchSize);
    
    if (batch.length === 0) {
      setCategorizing(false);
      return;
    }

    try {
      console.log(`🚀 Starting batch ${batchNum}/${totalBatches} (${batch.length} resources)`);
      const startTime = Date.now();

      const response = await fetch("/api/categorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resources: batch,
          categories: categories,
          subcategories: subcategories,
          offset,
          limit: batchSize,
        }),
      });

      const data = await response.json();
      if (data.suggestions) {
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        const changes = data.suggestions.filter((s: { suggestedCategory: string; currentCategory: string }) => s.suggestedCategory !== s.currentCategory).length;
        console.log(`✅ Batch ${batchNum} completed in ${duration}s - ${changes} changes found`);
        
        setCategorySuggestions(data.suggestions);
        setSelectedSuggestions(new Set(data.suggestions.filter((s: { suggestedCategory: string; currentCategory: string; id: string }) => s.suggestedCategory !== s.currentCategory).map((s: { id: string }) => s.id)));
      }
    } catch (error) {
      console.error("❌ Error categorizing batch:", error);
    } finally {
      setCategorizing(false);
    }
  }

  function proceedToNextBatch() {
    const nextBatch = currentBatch + 1;
    setCurrentBatch(nextBatch);
    localStorage.setItem('ai-batch-current', nextBatch.toString());
    setCategorySuggestions([]);
    setSelectedSuggestions(new Set());
    setTimeout(processNextBatch, 100);
  }

  async function applyCategorySuggestions(
    suggestions: typeof categorySuggestions
  ) {
    try {
      const supabase = createClient();

      for (const suggestion of suggestions) {
        if (suggestion.suggestedCategory !== suggestion.currentCategory) {
          await supabase
            .from("resources")
            .update({ category: suggestion.suggestedCategory })
            .eq("id", suggestion.id);
        }
      }

      fetchResources();
      
      // Check if there are more batches
      if (currentBatch + 1 < totalBatches) {
        proceedToNextBatch();
      } else {
        // All batches complete
        setShowBulkCategorize(false);
        setCategorySuggestions([]);
        setSelectedSuggestions(new Set());
        setCurrentBatch(0);
        setTotalBatches(0);
      }
    } catch (error) {
      console.error("Error applying suggestions:", error);
    }
  }

  function toggleSuggestionSelection(id: string) {
    const newSelection = new Set(selectedSuggestions);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedSuggestions(newSelection);
  }

  function applySelectedSuggestions() {
    const selectedSuggestionsList = categorySuggestions.filter((s) => 
      selectedSuggestions.has(s.id) && s.suggestedCategory !== s.currentCategory
    );
    applyCategorySuggestions(selectedSuggestionsList);
  }

  function resetBatchState() {
    setCategorySuggestions([]);
    setSelectedSuggestions(new Set());
    setCurrentBatch(0);
    setTotalBatches(0);
    setCategorizing(false);
    localStorage.removeItem('ai-batch-current');
    localStorage.removeItem('ai-batch-total');
  }

  if (loading) {
    return <LoadingScreen loadingStage={loadingStage} loadingProgress={loadingProgress} />;
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

  return (
    <div className="container py-8 max-w-7xl overflow-x-hidden">
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
        />
      </motion.div>

      {/* Resources List */}
      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <AnimatePresence mode="wait">
          {filteredAndSortedResources.length === 0 ? (
            <motion.div
              key="no-results"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <Card className="border-2 p-12 text-center">
                <motion.div 
                  className="mx-auto w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mb-4"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    duration: 0.8, 
                    delay: 0.3, 
                    type: "spring", 
                    stiffness: 200, 
                    damping: 15 
                  }}
                >
                  <Search className="h-6 w-6 text-muted-foreground" />
                </motion.div>
                <motion.p 
                  className="text-muted-foreground mb-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  No resources found
                </motion.p>
                <motion.p 
                  className="text-sm text-muted-foreground"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  Try adjusting your search or filters
                </motion.p>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              {filteredAndSortedResources.map((resource, index) => (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.05,
                    ease: [0.16, 1, 0.3, 1]
                  }}
                  whileHover={{ 
                    scale: 1.02, 
                    y: -4,
                    transition: { duration: 0.2, ease: "easeOut" }
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
      </motion.div>

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
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {editForm.category &&
                (() => {
                  const categoryData = categories.find(
                    (c) => c.name === editForm.category
                  );
                  const categorySubcategories = categoryData
                    ? getSubcategoriesForCategory(categoryData.id)
                    : [];
                  return categorySubcategories.length > 0 ? (
                    <div className="space-y-2">
                      <Label htmlFor="edit-subcategory">Subcategory</Label>
                      <Select
                        value={editForm.subcategory}
                        onValueChange={(value) =>
                          setEditForm((prev) => ({
                            ...prev,
                            subcategory: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a subcategory (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {categorySubcategories.map((subcat) => (
                            <SelectItem key={subcat.id} value={subcat.name}>
                              {subcat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : null;
                })()}

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
                        }
                      } catch (error) {
                        console.error("Error fetching image:", error);
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
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <span>{category.name}</span>
                      <Button
                        size="sm"
                        variant="ghost"
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
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <span>{subcategory.name}</span>
                        <Button
                          size="sm"
                          variant="ghost"
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
