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
import { motion } from "framer-motion";
import { Check, X, Trash2, ExternalLink, LogOut, Zap, Search, Filter, MoreHorizontal, Eye, Calendar, Tag, AlertTriangle, Image as ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { Category } from "@/lib/types/database";

const categories: Category[] = [
  "Frontend",
  "Backend",
  "Fullstack",
  "DevOps",
  "Design",
  "Tools",
  "Learning",
];

export default function AdminPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">("all");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [allResources, setAllResources] = useState<Resource[]>([]);

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
      setAllResources(data || []);
    } catch (error) {
      console.error("Error fetching resources:", error);
    }
  }, []);

  // Filter resources based on current filters
  const filteredResources = allResources.filter((resource) => {
    const matchesStatus = filter === "all" || resource.status === filter;
    const matchesSearch = searchQuery === "" || 
      resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || resource.category === selectedCategory;
    
    return matchesStatus && matchesSearch && matchesCategory;
  });

  // Get counts for filter buttons
  const getCounts = () => {
    const pending = allResources.filter(r => r.status === "pending").length;
    const approved = allResources.filter(r => r.status === "approved").length;
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
    if (!confirm("Are you sure you want to delete this resource?")) return;

    try {
      const supabase = createClient();
      const { error } = await supabase.from("resources").delete().eq("id", id);

      if (error) throw error;
      fetchResources();
    } catch (error) {
      console.error("Error deleting resource:", error);
    }
  }

  async function updateResourceCategory(id: string, category: Category) {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("resources")
        .update({ category })
        .eq("id", id);

      if (error) throw error;
      fetchResources();
    } catch (error) {
      console.error("Error updating category:", error);
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
    <div className="container py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 text-left"
        >
          <h1 className="mb-4 font-heading text-2xl sm:text-4xl font-bold tracking-tight text-foreground md:text-6xl">
            Admin Dashboard
          </h1>
          <p className="mb-4 sm:mb-8 max-w-2xl text-base sm:text-lg text-muted-foreground">
            Manage and curate developer resources
          </p>
        </motion.div>
        <Button variant="outline" onClick={handleLogout} className="gap-2 self-start sm:self-auto">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as Category | "all")}>
            <SelectTrigger className="w-full sm:w-48">
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
        </div>
        
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
      </div>

      {/* Results Summary */}
      <div className="mb-4 text-sm text-muted-foreground">
        Showing {filteredResources.length} of {allResources.length} resources
      </div>

      <div className="space-y-4">
        {filteredResources.length === 0 ? (
          <Card className="border-2 p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-2">No resources found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
          </Card>
        ) : (
          filteredResources.map((resource, index) => (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-2 p-4 sm:p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                  {/* Image Preview */}
                  <div className="flex-shrink-0 self-start">
                    {resource.image_url ? (
                      <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-muted">
                        <img
                          src={resource.image_url}
                          alt={resource.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = 'flex';
                          }}
                        />
                        <div className="w-full h-full bg-muted/30 flex items-center justify-center" style={{display: 'none'}}>
                          <ImageIcon className="h-4 w-4 sm:h-6 sm:w-6 text-muted-foreground" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-lg bg-muted/30 flex items-center justify-center">
                        <ImageIcon className="h-4 w-4 sm:h-6 sm:w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                          <h3 className="font-semibold text-base sm:text-lg truncate">
                            {resource.name}
                          </h3>
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
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {resource.description}
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs text-muted-foreground mb-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            {new Date(resource.created_at).toLocaleDateString()}
                          </div>
                          <span className="hidden sm:inline mx-1">•</span>
                          <a 
                            href={resource.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-foreground transition-colors truncate block"
                          >
                            {resource.url}
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Category and Tags */}
                    <div className="flex flex-wrap gap-2 items-center mb-4">
                      <Select
                        value={resource.category}
                        onValueChange={(value) =>
                          updateResourceCategory(
                            resource.id,
                            value as Category
                          )
                        }
                      >
                        <SelectTrigger className="w-32 sm:w-40 h-8 text-xs sm:text-sm">
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
                      {resource.subcategory && (
                        <Badge variant="outline" className="text-xs">
                          {resource.subcategory}
                        </Badge>
                      )}
                      {resource.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          <Tag className="h-2 w-2 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                      {resource.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{resource.tags.length - 3} more
                        </Badge>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      {resource.status === "pending" && (
                        <Button
                          size="sm"
                          onClick={() =>
                            updateResourceStatus(resource.id, "approved")
                          }
                          className="gap-1 text-xs sm:text-sm"
                        >
                          <Check className="h-3 w-3" />
                          <span className="hidden sm:inline">Approve</span>
                        </Button>
                      )}
                      {resource.status === "approved" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateResourceStatus(resource.id, "pending")
                          }
                          className="gap-1 text-xs sm:text-sm"
                        >
                          <X className="h-3 w-3" />
                          <span className="hidden sm:inline">Unapprove</span>
                        </Button>
                      )}
                      <Button size="sm" variant="outline" asChild>
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="gap-1 text-xs sm:text-sm"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span className="hidden sm:inline">Visit</span>
                        </a>
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteResource(resource.id)}
                        className="gap-1 text-xs sm:text-sm"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span className="hidden sm:inline">Delete</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
