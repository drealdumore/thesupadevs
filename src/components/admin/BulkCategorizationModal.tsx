"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  SimpleKitModal,
  SimpleKitModalContent,
  SimpleKitModalHeader,
  SimpleKitModalTitle,
  SimpleKitModalBody,
  SimpleKitModalFooter,
} from "@/components/ui/simple-kit-modal";
import { WandSparkles, RefreshCw } from "lucide-react";
import type { Resource } from "@/lib/types/database";

interface BulkCategorizationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allResources: Resource[];
  batchSize: number;
  currentBatch: number;
  totalBatches: number;
  categorizing: boolean;
  categorySuggestions: Array<{
    id: string;
    currentCategory: string;
    suggestedCategory: string;
    confidence: string;
  }>;
  selectedSuggestions: Set<string>;
  onStartBatchCategorization: () => void;
  onToggleSuggestionSelection: (id: string) => void;
  onApplySelectedSuggestions: () => void;
  onProceedToNextBatch: () => void;
  onResetBatchState: () => void;
}

export function BulkCategorizationModal({
  open,
  onOpenChange,
  allResources,
  batchSize,
  currentBatch,
  totalBatches,
  categorizing,
  categorySuggestions,
  selectedSuggestions,
  onStartBatchCategorization,
  onToggleSuggestionSelection,
  onApplySelectedSuggestions,
  onProceedToNextBatch,
  onResetBatchState,
}: BulkCategorizationModalProps) {
  return (
    <SimpleKitModal open={open} onOpenChange={onOpenChange}>
      <SimpleKitModalContent>
        <SimpleKitModalHeader>
          <SimpleKitModalTitle>AI Bulk Categorization</SimpleKitModalTitle>
          <p className="text-sm text-muted-foreground text-center mt-2">
            Use AI to analyze and suggest better categories for your resources
          </p>
        </SimpleKitModalHeader>

        <SimpleKitModalBody>
          {categorySuggestions.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <WandSparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-medium mb-2">Analyze Resource Categories</h3>
              <p className="text-sm text-muted-foreground mb-4">
                AI will analyze {allResources.length} resources in batches of {batchSize}. You'll review each batch before proceeding.
              </p>
              {totalBatches > 0 && (
                <div className="mb-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Batch Progress</span>
                    <span className="text-muted-foreground">
                      {currentBatch + (categorizing ? 1 : 0)} / {totalBatches}
                    </span>
                  </div>
                  
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className="bg-primary h-3 rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                      style={{ width: `${Math.max(8, ((currentBatch + (categorizing ? 1 : 0)) / totalBatches) * 100)}%` }}
                    >
                      <span className="text-xs text-white font-medium">
                        {Math.round(((currentBatch + (categorizing ? 1 : 0)) / totalBatches) * 100)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground">
                    <div className="text-center">
                      <div className="font-medium text-green-600">{currentBatch}</div>
                      <div>Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-blue-600">
                        {Math.max(0, totalBatches - currentBatch - (categorizing ? 1 : 0))}
                      </div>
                      <div>Remaining</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-purple-600">
                        {categorizing ? 'Processing...' : 'Ready'}
                      </div>
                      <div>Status</div>
                    </div>
                  </div>
                </div>
              )}
              <Button
                onClick={onStartBatchCategorization}
                disabled={categorizing}
                className="gap-2"
              >
                {categorizing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <WandSparkles className="h-4 w-4" />
                )}
                {categorizing ? 'Processing Batch...' : 'Start Batch Analysis'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Batch {currentBatch + 1} of {totalBatches}</h4>
                  <p className="text-xs text-muted-foreground">Review and select changes to apply</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary">
                    {categorySuggestions.filter((s) => s.suggestedCategory !== s.currentCategory).length} changes
                  </Badge>
                  {categorySuggestions.filter(s => s.suggestedCategory !== s.currentCategory).length > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const changeIds = categorySuggestions
                          .filter(s => s.suggestedCategory !== s.currentCategory)
                          .map(s => s.id);
                        onToggleSuggestionSelection(changeIds.join(','));
                      }}
                    >
                      Select All
                    </Button>
                  )}
                </div>
              </div>

              <div className="max-h-96 space-y-2">
                {categorySuggestions.map((suggestion) => {
                  const resource = allResources.find((r) => r.id === suggestion.id);
                  const hasChange = suggestion.suggestedCategory !== suggestion.currentCategory;

                  return (
                    <div
                      key={suggestion.id}
                      className={`p-3 border rounded-lg ${
                        hasChange
                          ? "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950"
                          : "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {hasChange && (
                            <Checkbox
                              checked={selectedSuggestions.has(suggestion.id)}
                              onCheckedChange={() => onToggleSuggestionSelection(suggestion.id)}
                              className="flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-sm truncate">
                              {resource?.name}
                            </h5>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <Badge variant="outline" className="text-xs flex-shrink-0">
                                {suggestion.currentCategory}{resource?.subcategory ? ` > ${resource.subcategory}` : ''}
                              </Badge>
                              {hasChange && (
                                <>
                                  <span className="text-xs text-muted-foreground flex-shrink-0">→</span>
                                  <Badge className="text-xs flex-shrink-0">
                                    {suggestion.suggestedCategory}{(suggestion as { suggestedSubcategory?: string }).suggestedSubcategory ? ` > ${(suggestion as { suggestedSubcategory?: string }).suggestedSubcategory}` : ''}
                                  </Badge>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {hasChange ? (
                            <Badge variant="secondary" className="text-xs">Change</Badge>
                          ) : (
                            <Badge variant="default" className="text-xs">Correct</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </SimpleKitModalBody>

        {categorySuggestions.length > 0 && (
          <SimpleKitModalFooter>
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                onClick={() => {
                  if (currentBatch + 1 < totalBatches) {
                    onProceedToNextBatch();
                  } else {
                    onResetBatchState();
                    onOpenChange(false);
                  }
                }}
                className="flex-1"
              >
                {currentBatch + 1 < totalBatches ? 'Skip Batch' : 'Cancel'}
              </Button>
              <Button onClick={onApplySelectedSuggestions} className="flex-1">
                {currentBatch + 1 < totalBatches 
                  ? `Apply & Next Batch (${selectedSuggestions.size})` 
                  : `Apply & Finish (${selectedSuggestions.size})`
                }
              </Button>
            </div>
          </SimpleKitModalFooter>
        )}
      </SimpleKitModalContent>
    </SimpleKitModal>
  );
}