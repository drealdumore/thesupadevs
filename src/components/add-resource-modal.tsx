"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
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
import {
  X,
  Loader2,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import type { Category } from "@/lib/types/database";
import {
  SimpleKitModal,
  SimpleKitModalTrigger,
  SimpleKitModalContent,
  SimpleKitModalHeader,
  SimpleKitModalTitle,
  SimpleKitModalBody,
  SimpleKitModalFooter,
} from "@/components/ui/simple-kit-modal";

const resourceSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  category: z.string().min(1, "Pick a category"),
  subcategory: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  url: z.string().url("Enter a valid URL, like https://example.com"),
});

type ResourceForm = z.infer<typeof resourceSchema>;
type Timer = ReturnType<typeof setTimeout>;

interface AddResourceModalProps {
  children: React.ReactNode;
}

const MAX_TAGS = 10;

const normalizeUrl = (url: string): string => {
  let normalized = url.trim();
  if (!/^https?:\/\//i.test(normalized)) normalized = "https://" + normalized;
  return normalized.replace(/\/$/, "");
};

const isValidDomain = (url: string): boolean => {
  try {
    return new URL(url).hostname.includes(".");
  } catch {
    return false;
  }
};

function Field({
  id,
  label,
  required,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
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
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
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
  const [urlValid, setUrlValid] = useState<boolean | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [autoFilled, setAutoFilled] = useState(false);
  const [showSkip, setShowSkip] = useState(false);
  const [lastScrapedUrl, setLastScrapedUrl] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );
  const [subcategories, setSubcategories] = useState<
    { id: string; name: string; category_id: string }[]
  >([]);

  // Refs, not state: timers and request ids must never be stale inside callbacks
  const debounceRef = useRef<Timer | null>(null);
  const skipRef = useRef<Timer | null>(null);
  const requestId = useRef(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    clearErrors,
    reset,
  } = useForm<ResourceForm>({
    resolver: zodResolver(resourceSchema),
  });

  const [nameValue, descriptionValue] = watch(["name", "description"]);
  const selectedCategory = watch("category");
  const selectedSubcategory = watch("subcategory");

  const selectedCategoryData = categories.find(
    (c) => c.name === selectedCategory
  );
  const availableSubcategories = selectedCategoryData
    ? subcategories.filter((s) => s.category_id === selectedCategoryData.id)
    : [];

  const clearTimers = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (skipRef.current) clearTimeout(skipRef.current);
  };

  useEffect(() => clearTimers, []);

  // Load categories, then restore any saved draft, whenever the modal opens
  useEffect(() => {
    if (!open) return;

    (async () => {
      try {
        const supabase = createClient();
        const [categoriesRes, subcategoriesRes] = await Promise.all([
          supabase.from("categories").select("*").order("name"),
          supabase.from("subcategories").select("*").order("name"),
        ]);
        if (categoriesRes.error) throw categoriesRes.error;
        if (subcategoriesRes.error) throw subcategoriesRes.error;
        setCategories(categoriesRes.data || []);
        setSubcategories(subcategoriesRes.data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    })();

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
        toast.info("Draft restored", {
          description: "Your previous work was saved.",
        });
      } catch (e) {
        console.error("Failed to parse draft", e);
      }
    }
  }, [open, setValue]);

  // Save draft (watching the values means name and description are saved too)
  useEffect(() => {
    if (!open || success) return;
    if (nameValue || descriptionValue || urlValue) {
      localStorage.setItem(
        "resource-draft",
        JSON.stringify({
          name: nameValue,
          description: descriptionValue,
          url: urlValue,
          tags,
        })
      );
    }
  }, [open, success, nameValue, descriptionValue, urlValue, tags]);

  // A subcategory only makes sense for its own category
  useEffect(() => {
    setValue("subcategory", "");
    clearErrors("subcategory");
  }, [selectedCategory, setValue, clearErrors]);

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
    const normalized = normalizeUrl(url);

    if (!isValidDomain(normalized)) {
      setUrlValid(false);
      setUrlError("Enter a valid domain, like example.com.");
      return;
    }

    if (normalized !== url) {
      setUrlValue(normalized);
      setValue("url", normalized, { shouldValidate: true });
    }

    if (lastScrapedUrl && lastScrapedUrl !== normalized) {
      setScrapedImage(null);
      setAutoFilled(false);
    }

    // Check for duplicates before starting the scrape spinner
    const isDuplicate = await checkDuplicateUrl(normalized);
    if (isDuplicate) {
      setUrlValid(false);
      setUrlError("This resource is already in the library.");
      setScraping(false);
      return;
    }

    const id = ++requestId.current;
    setScraping(true);
    setUrlValid(null);
    setUrlError(null);
    setShowSkip(false);

    if (skipRef.current) clearTimeout(skipRef.current);
    skipRef.current = setTimeout(() => setShowSkip(true), 3000);

    try {
      const response = await fetch(
        `/api/scrape-metadata?url=${encodeURIComponent(normalized)}`
      );
      const data = await response.json();
      if (id !== requestId.current) return;

      if (data.error) {
        setUrlValid(false);
        setUrlError(data.error);
        return;
      }

      if (data.success && data.metadata) {
        setUrlValid(true);
        setScrapedImage(data.metadata.image);
        setLastScrapedUrl(normalized);

        if (data.metadata.title) {
          setValue("name", data.metadata.title, { shouldValidate: true });
          setAutoFilled(true);
        }
        if (data.metadata.description) {
          setValue("description", data.metadata.description, {
            shouldValidate: true,
          });
          setAutoFilled(true);
        }
      }
    } catch (error) {
      console.error("Error scraping metadata:", error);
      if (id !== requestId.current) return;
      setUrlValid(false);
      setUrlError("Can't reach this URL. Check that it's correct and public.");
    } finally {
      if (id === requestId.current) {
        if (skipRef.current) clearTimeout(skipRef.current);
        setShowSkip(false);
        setScraping(false);
      }
    }
  };

  const debouncedScrape = (url: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => scrapeMetadata(url), 800);
  };

  const manualRescrape = () => {
    if (!urlValue.trim()) return;
    setScrapedImage(null);
    setUrlValid(null);
    setUrlError(null);
    setAutoFilled(false);
    setLastScrapedUrl("");
    scrapeMetadata(urlValue);
  };

  const skipScraping = () => {
    clearTimers();
    requestId.current++; // drop any in-flight response
    setScraping(false);
    setShowSkip(false);
    setUrlValid(null);
    setUrlError(null);
  };

  const resetAll = () => {
    clearTimers();
    requestId.current++;
    reset();
    setTags([]);
    setTagInput("");
    setScrapedImage(null);
    setUrlValue("");
    setUrlValid(null);
    setUrlError(null);
    setAutoFilled(false);
    setLastScrapedUrl("");
    setScraping(false);
    setShowSkip(false);
  };

  const onSubmit = async (data: ResourceForm) => {
    setSubmitting(true);
    try {
      const supabase = createClient();

      // Guard against duplicates at submit time, not just during scrape
      const { data: existing } = await supabase
        .from("resources")
        .select("id")
        .eq("url", data.url)
        .limit(1);

      if (existing && existing.length > 0) {
        setUrlValid(false);
        setUrlError("This resource is already in the library.");
        setSubmitting(false);
        return;
      }

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
      resetAll();
      localStorage.removeItem("resource-draft");
      toast.success("Resource submitted", {
        description: "We'll review it and add it to the library.",
      });

      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Error submitting resource:", error);
      toast.error("Couldn't submit your resource", {
        description: "Try again in a moment, or contact support.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const addTag = () => {
    const tag = tagInput.trim().replace(/,$/, "");
    if (!tag || tags.includes(tag) || tags.length >= MAX_TAGS) return;
    setTags([...tags, tag]);
    setTagInput("");
  };

  const removeTag = (tagToRemove: string) =>
    setTags(tags.filter((tag) => tag !== tagToRemove));

  const urlRegister = register("url", {
    onChange: (e) => {
      const value = e.target.value as string;
      setUrlValue(value);
      if (value.length > 3) debouncedScrape(value);
    },
  });

  return (
    <SimpleKitModal
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          clearTimers();
          setScraping(false);
          setShowSkip(false);
        }
      }}
    >
      <SimpleKitModalTrigger asChild>{children}</SimpleKitModalTrigger>
      <SimpleKitModalContent>
        <SimpleKitModalHeader>
          <SimpleKitModalTitle>Submit a resource</SimpleKitModalTitle>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Paste a link and we&apos;ll fill in the rest. Approved resources
            join the main library.
          </p>
        </SimpleKitModalHeader>

        <SimpleKitModalBody>
          {success ? (
            <motion.div
              className="space-y-4 py-12 text-center"
              initial={{ opacity: 0, transform: "scale(0.95)" }}
              animate={{ opacity: 1, transform: "scale(1)" }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            >
              <motion.div
                className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30"
                initial={{ transform: "scale(0.5)", opacity: 0 }}
                animate={{ transform: "scale(1)", opacity: 1 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1], delay: 0.05 }}
              >
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </motion.div>
              <h3 className="font-heading text-xl font-semibold">
                Resource submitted
              </h3>
              <p className="text-muted-foreground">
                We&apos;ll review it and add it to the library.
              </p>
            </motion.div>
          ) : (
            <form
              id="resource-form"
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
            >
              {/* URL first: it fills in the name and description below */}
              <Field id="url" label="Link" required error={errors.url?.message}>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="url"
                      type="text"
                      inputMode="url"
                      autoComplete="off"
                      placeholder="example.com or https://example.com"
                      aria-invalid={urlValid === false}
                      {...urlRegister}
                      onBlur={(e) => {
                        urlRegister.onBlur(e);
                        const v = e.target.value.trim();
                        if (v && !/^https?:\/\//i.test(v)) {
                          const n = normalizeUrl(v);
                          setUrlValue(n);
                          setValue("url", n, { shouldValidate: true });
                        }
                      }}
                      className={`pr-10 ${
                        urlValid === true
                          ? "border-green-500"
                          : urlValid === false
                          ? "border-destructive"
                          : ""
                      }`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {scraping && (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                      {!scraping && urlValid === true && (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                      {!scraping && urlValid === false && (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                  </div>
                  {urlValue.trim() && !scraping && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={manualRescrape}
                      className="px-3"
                      aria-label="Fetch details again"
                      title="Fetch details again"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  )}
                  {showSkip && scraping && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={skipScraping}
                    >
                      Skip
                    </Button>
                  )}
                </div>

                {urlError && (
                  <p className="flex items-center gap-1 text-sm text-destructive">
                    <XCircle className="h-3 w-3" />
                    {urlError}
                  </p>
                )}
                {urlValid && autoFilled && (
                  <p className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                    <Sparkles className="h-3 w-3" />
                    Filled in from the website. Edit anything you like.
                  </p>
                )}
                {scrapedImage ? (
                  <div className="mt-2 rounded-xl border p-2">
                    <img
                      src={scrapedImage}
                      alt="Preview of the resource"
                      className="aspect-video w-full rounded-md object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                ) : (
                  !scraping &&
                  urlValue && (
                    <div className="mt-2 flex items-center justify-center gap-2 rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                      <ImageIcon className="h-5 w-5" />
                      No preview image found
                    </div>
                  )
                )}
              </Field>

              <Field
                id="name"
                label="Name"
                required
                error={errors.name?.message}
              >
                <Input
                  id="name"
                  placeholder="e.g., Framer Motion"
                  {...register("name")}
                />
              </Field>

              <Field
                id="description"
                label="Description"
                required
                error={errors.description?.message}
              >
                <Textarea
                  id="description"
                  placeholder="What does it do, and why is it useful?"
                  rows={4}
                  {...register("description")}
                />
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  id="category"
                  label="Category"
                  required
                  error={errors.category?.message}
                >
                  <Select
                    value={selectedCategory || ""}
                    onValueChange={(value) =>
                      setValue("category", value, { shouldValidate: true })
                    }
                  >
                    <SelectTrigger id="category">
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

                {selectedCategory && availableSubcategories.length > 0 && (
                  <Field id="subcategory" label="Subcategory">
                    <Select
                      value={selectedSubcategory || ""}
                      onValueChange={(value) => setValue("subcategory", value)}
                    >
                      <SelectTrigger id="subcategory">
                        <SelectValue placeholder="Optional" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSubcategories.map((subcat) => (
                          <SelectItem key={subcat.id} value={subcat.name}>
                            {subcat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              </div>

              <Field id="tags" label="Tags">
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    placeholder="Type a tag, then press Enter"
                    value={tagInput}
                    disabled={tags.length >= MAX_TAGS}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
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
                  <div className="mt-2 flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          aria-label={`Remove tag ${tag}`}
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
          )}
        </SimpleKitModalBody>

        {!success && (
          <SimpleKitModalFooter>
            <Button
              type="submit"
              form="resource-form"
              className="w-full gap-2 rounded-full"
              disabled={submitting}
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? "Submitting..." : "Submit resource"}
            </Button>
          </SimpleKitModalFooter>
        )}
      </SimpleKitModalContent>
    </SimpleKitModal>
  );
}