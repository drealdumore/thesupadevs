"use client";

import { motion } from "framer-motion";
import { Settings } from "lucide-react";
import { Card } from "@/components/ui/card";

interface LoadingScreenProps {
  loadingStage: string;
  loadingProgress: number;
}

export function LoadingScreen({ loadingStage, loadingProgress }: LoadingScreenProps) {
  return (
    <div className="container py-8 max-w-7xl min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center"
            >
              <Settings className="h-8 w-8 text-primary" />
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 w-16 h-16 mx-auto bg-primary/5 rounded-full"
            />
          </div>
          
          <div className="space-y-3">
            <h2 className="font-heading text-2xl font-bold">Loading Admin Dashboard</h2>
            <motion.p
              key={loadingStage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-muted-foreground"
            >
              {loadingStage}...
            </motion.p>
          </div>
          
          <div className="w-80 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{loadingStage}</span>
              <span className="text-muted-foreground">{loadingProgress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <motion.div
                className="bg-primary h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${loadingProgress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}