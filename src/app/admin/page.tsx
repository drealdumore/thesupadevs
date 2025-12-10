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
import { Check, X, Trash2, ExternalLink, LogOut, Zap } from "lucide-react";
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const fetchResources = useCallback(async () => {
    try {
      const supabase = createClient();
      const query = supabase
        .from("resources")
        .select("*")
        .order("created_at", { ascending: false });

      if (filter !== "all") {
        query.eq("status", filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error("Error fetching resources:", error);
    }
  }, [filter]);

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
      <div className="flex items-center justify-between mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 text-left"
        >
          <h1 className="mb-6 font-heading text-4xl font-bold tracking-tight text-foreground md:text-6xl">
            Admin Dashboard
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground lg:mx-0">
            Manage and curate developer resources
          </p>
        </motion.div>
        <Button variant="outline" onClick={handleLogout} className="gap-2">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      <div className="mb-6 flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
        >
          All ({resources.length})
        </Button>
        <Button
          variant={filter === "pending" ? "default" : "outline"}
          onClick={() => setFilter("pending")}
        >
          Pending
        </Button>
        <Button
          variant={filter === "approved" ? "default" : "outline"}
          onClick={() => setFilter("approved")}
        >
          Approved
        </Button>
      </div>

      <div className="space-y-4">
        {resources.length === 0 ? (
          <Card className="border-2 p-12 text-center">
            <p className="text-muted-foreground">No resources found</p>
          </Card>
        ) : (
          resources.map((resource) => (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-2 p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-display text-xl font-semibold">
                          {resource.name}
                        </h3>
                        <Badge
                          variant={
                            resource.status === "approved"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {resource.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {resource.description}
                      </p>
                      <div className="flex flex-wrap gap-2 items-center">
                        <Select
                          value={resource.category}
                          onValueChange={(value) =>
                            updateResourceCategory(
                              resource.id,
                              value as Category
                            )
                          }
                        >
                          <SelectTrigger className="w-40">
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
                          <Badge variant="outline">
                            {resource.subcategory}
                          </Badge>
                        )}
                        {resource.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {resource.status === "pending" && (
                        <Button
                          size="icon"
                          onClick={() =>
                            updateResourceStatus(resource.id, "approved")
                          }
                          title="Approve"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      {resource.status === "approved" && (
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() =>
                            updateResourceStatus(resource.id, "pending")
                          }
                          title="Unapprove"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      <Button size="icon" variant="outline" asChild>
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Visit"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => deleteResource(resource.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
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
