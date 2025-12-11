"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { X, Loader2, Image as ImageIcon, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";
import type { Category } from "@/lib/types/database";
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




const resourceSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  url: z.string().url("Must be a valid URL"),
});

type ResourceForm = z.infer<typeof resourceSchema>;

interface AddResourceModalProps {
  children: React.ReactNode;
}

export function AddResourceModal({ children }: AddResourceModalProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [scrapedImage, setScrapedImage] = useState<string | null>(null);
  const [scraping, setScraping] = useState(false);
  const [urlValue, setUrlValue] = useState("");
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [urlValid, setUrlValid] = useState<boolean | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [autoFilled, setAutoFilled] = useState(false);
  const [showSkip, setShowSkip] = useState(false);
  const [skipTimer, setSkipTimer] = useState<NodeJS.Timeout | null>(null);
  const [lastScrapedUrl, setLastScrapedUrl] = useState<string>("");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [subcategories, setSubcategories] = useState<{ id: string; name: string; category_id: string }[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ResourceForm>({
    resolver: zodResolver(resourceSchema),
  });

  const normalizeUrl = (url: string): string => {
    let normalized = url.trim();
    
    // Add https:// if no protocol
    if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
      normalized = "https://" + normalized;
    }
    
    // Remove trailing slash
    if (normalized.endsWith("/")) {
      normalized = normalized.slice(0, -1);
    }
    
    return normalized;
  };

  const isValidDomain = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.includes(".");
    } catch {
      return false;
    }
  };

  // Fetch categories and subcategories
  useEffect(() => {
    if (open) {
      fetchCategoriesAndSubcategories();
      
      const draft = localStorage.getItem("resource-draft");
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          if (parsed.name) setValue("name", parsed.name);
          if (parsed.description) setValue("description", parsed.description);
          if (parsed.url) {
            setUrlValue(parsed.url);
            setValue("url", parsed.url);
          }
          if (parsed.tags) setTags(parsed.tags);
          toast.info("Draft restored", { description: "Your previous work was saved" });
        } catch (e) {
          console.error("Failed to parse draft", e);
        }
      }
    }
  }, [open, setValue]);

  const fetchCategoriesAndSubcategories = async () => {
    try {
      const supabase = createClient();
      const [categoriesRes, subcategoriesRes] = await Promise.all([
        supabase.from("categories").select("*").order("name"),
        supabase.from("subcategories").select("*").order("name")
      ]);

      if (categoriesRes.error) throw categoriesRes.error;
      if (subcategoriesRes.error) throw subcategoriesRes.error;

      setCategories(categoriesRes.data || []);
      setSubcategories(subcategoriesRes.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Save draft to localStorage
  useEffect(() => {
    if (open) {
      const nameValue = watch("name");
      const descriptionValue = watch("description");
      const draft = {
        name: nameValue,
        description: descriptionValue,
        url: urlValue,
        tags,
      };
      if (draft.name || draft.description || draft.url) {
        localStorage.setItem("resource-draft", JSON.stringify(draft));
      }
    }
  }, [watch, urlValue, tags, open]);

  const selectedCategory = watch("category");
  const selectedCategoryData = categories.find(c => c.name === selectedCategory);
  const availableSubcategories = selectedCategoryData 
    ? subcategories.filter(s => s.category_id === selectedCategoryData.id)
    : [];

  const checkDuplicateUrl = async (url: string): Promise<boolean> => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("resources")
        .select("id")
        .eq("url", url)
        .limit(1);
      return (data?.length || 0) > 0;
    } catch {
      return false;
    }
  };

  const scrapeMetadata = async (url: string) => {
    // Normalize URL
    const normalized = normalizeUrl(url);
    
    // Validate domain
    if (!isValidDomain(normalized)) {
      setUrlError("Please enter a valid domain (e.g., example.com)");
      return;
    }
    
    // Update URL field with normalized version
    if (normalized !== url) {
      setUrlValue(normalized);
      setValue("url", normalized);
    }
    
    // Check if URL changed - clear previous data
    if (lastScrapedUrl && lastScrapedUrl !== normalized) {
      setScrapedImage(null);
      setUrlValid(null);
      setAutoFilled(false);
    }
    
    // Check for duplicate
    const isDuplicate = await checkDuplicateUrl(normalized);
    if (isDuplicate) {
      setUrlValid(false);
      setUrlError("This resource already exists in our library!");
      return;
    }
    
    console.log("Starting scrape for:", normalized);
    setScraping(true);
    setUrlValid(null);
    setUrlError(null);
    setAutoFilled(false);
    setShowSkip(false);
    
    // Show skip button after 3 seconds
    const timer = setTimeout(() => {
      setShowSkip(true);
    }, 3000);
    setSkipTimer(timer);
    
    try {
      const response = await fetch(`/api/scrape-metadata?url=${encodeURIComponent(normalized)}`);
      const data = await response.json();
      
      console.log("Scrape response:", data);
      
      if (skipTimer) clearTimeout(skipTimer);
      setShowSkip(false);
      
      if (data.error) {
        setUrlValid(false);
        setUrlError(data.error);
        return;
      }
      
      if (data.success && data.metadata) {
        setUrlValid(true);
        setScrapedImage(data.metadata.image);
        setLastScrapedUrl(normalized);
        
        // Auto-fill fields
        if (data.metadata.title) {
          console.log("Setting name to:", data.metadata.title);
          setValue("name", data.metadata.title, { shouldValidate: true });
          setAutoFilled(true);
        }
        if (data.metadata.description) {
          console.log("Setting description to:", data.metadata.description);
          setValue("description", data.metadata.description, { shouldValidate: true });
          setAutoFilled(true);
        }
      }
    } catch (error) {
      console.error("Error scraping metadata:", error);
      if (skipTimer) clearTimeout(skipTimer);
      setShowSkip(false);
      setUrlValid(false);
      setUrlError("Can't connect to this URL. Please check if it's correct and accessible.");
    } finally {
      setScraping(false);
    }
  };

  const skipScraping = () => {
    if (skipTimer) clearTimeout(skipTimer);
    if (debounceTimer) clearTimeout(debounceTimer);
    setScraping(false);
    setShowSkip(false);
    setUrlValid(null);
    setUrlError(null);
  };

  const debouncedScrape = (url: string) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    const timer = setTimeout(() => {
      scrapeMetadata(url);
    }, 800);
    setDebounceTimer(timer);
  };

  const onSubmit = async (data: ResourceForm) => {
    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("resources").insert({
        name: data.name,
        category: data.category as Category,
        subcategory: data.subcategory || null,
        description: data.description,
        url: data.url,
        tags,
        status: "pending",
        image_url: scrapedImage,
      });

      if (error) throw error;

      setSuccess(true);
      reset();
      setTags([]);
      setScrapedImage(null);
      setUrlValue("");
      localStorage.removeItem("resource-draft");
      
      toast.success("Resource submitted!", {
        description: "Your resource has been submitted for review.",
      });

      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Error submitting resource:", error);
      toast.error("Failed to submit", {
        description: "Please try again or contact support.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <SimpleKitModal open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) {
        // Cleanup on close
        if (debounceTimer) clearTimeout(debounceTimer);
        if (skipTimer) clearTimeout(skipTimer);
        setScraping(false);
        setShowSkip(false);
      }
    }}>
      <SimpleKitModalTrigger asChild>{children}</SimpleKitModalTrigger>
      <SimpleKitModalContent>
        <SimpleKitModalHeader>
          <SimpleKitModalTitle>Submit a Developer Resource</SimpleKitModalTitle>
          <p className="text-sm text-muted-foreground text-center mt-2">
            Share a developer tool or resource you find useful. If approved, it will appear in the main collection. Please limit submissions to 5 per day.
          </p>
        </SimpleKitModalHeader>
        <SimpleKitModalBody>
          {success ? (
            <div className="py-12 text-center space-y-4">
              <div className="mx-auto h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
                <svg
                  className="h-6 w-6 text-green-600 dark:text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="font-display text-xl font-semibold">
                Resource Submitted!
              </h3>
              <p className="text-muted-foreground">
                Your resource has been submitted for review.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Resource Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Framer Motion"
                  {...register("name")}
                  value={watch("name") || ""}
                  onChange={(e) => setValue("name", e.target.value)}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select onValueChange={(value) => setValue("category", value)}>
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
                {errors.category && (
                  <p className="text-sm text-destructive">
                    {errors.category.message}
                  </p>
                )}
              </div>

              {selectedCategory && availableSubcategories.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <Select
                    onValueChange={(value) => setValue("subcategory", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subcategory (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSubcategories.map((subcat) => (
                        <SelectItem key={subcat.id} value={subcat.name}>
                          {subcat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this resource does and why it's useful..."
                  rows={4}
                  {...register("description")}
                  value={watch("description") || ""}
                  onChange={(e) => setValue("description", e.target.value)}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">URL *</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="url"
                      type="url"
                      placeholder="example.com or https://example.com"
                      {...register("url")}
                      value={urlValue}
                      onChange={(e) => {
                        const value = e.target.value;
                        setUrlValue(value);
                        setValue("url", value);
                        if (value.length > 3) {
                          debouncedScrape(value);
                        }
                      }}
                      className={urlValid === true ? "border-green-500" : urlValid === false ? "border-red-500" : ""}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {scraping && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                      {!scraping && urlValid === true && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                      {!scraping && urlValid === false && <XCircle className="h-4 w-4 text-red-500" />}
                    </div>
                  </div>
                  {showSkip && scraping && (
                    <Button type="button" variant="outline" size="sm" onClick={skipScraping}>
                      Skip
                    </Button>
                  )}
                </div>
                {errors.url && (
                  <p className="text-sm text-destructive">
                    {errors.url.message}
                  </p>
                )}
                {urlError && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    {urlError}
                  </p>
                )}
                {urlValid && autoFilled && (
                  <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Fields auto-filled from website. Feel free to edit!
                  </p>
                )}
                {scrapedImage && (
                  <div className="mt-2 p-2 border rounded-lg">
                    <p className="text-xs text-muted-foreground mb-2">Preview Image:</p>
                    <img
                      src={scrapedImage}
                      alt="Resource preview"
                      className="w-full h-32 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}
                {!scrapedImage && !scraping && urlValue && (
                  <div className="mt-2 p-4 border border-dashed rounded-lg flex items-center justify-center text-muted-foreground">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    placeholder="Add a tag and press Enter"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    Add
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </form>
          )}
        </SimpleKitModalBody>
        {!success && (
          <SimpleKitModalFooter>
            <Button
              onClick={handleSubmit(onSubmit)}
              className="w-full"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Resource"}
            </Button>
          </SimpleKitModalFooter>
        )}
      </SimpleKitModalContent>
    </SimpleKitModal>
  );
}