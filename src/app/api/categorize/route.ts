import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { resources, categories, subcategories, offset = 0, limit = 50 } = await request.json();

    if (!resources || !categories) {
      return NextResponse.json(
        { error: "Resources and categories are required" },
        { status: 400 }
      );
    }

    // Build category-subcategory mapping
    const categoryMap = categories.reduce((acc: Record<string, string[]>, cat: any) => {
      const catSubcategories = subcategories?.filter((sub: any) => sub.category_id === cat.id) || [];
      acc[cat.name] = catSubcategories.map((sub: any) => sub.name);
      return acc;
    }, {});

    const suggestions = [];
    console.log(`🤖 Processing batch: ${resources.length} resources (offset: ${offset})`);

    for (let i = 0; i < resources.length; i++) {
      const resource = resources[i];
      try {
        // Build detailed category info
        const categoryInfo = categories.map((cat: any) => {
          const subs = categoryMap[cat.name] || [];
          return subs.length > 0 ? `${cat.name} (${subs.join(", ")})` : cat.name;
        }).join(", ");

        const prompt = `Analyze this resource and suggest the best category and subcategory:

Available categories with subcategories:
${categoryInfo}

Resource details:
- Name: ${resource.name}
- Description: ${resource.description}
- URL: ${resource.url}
- Current category: ${resource.category}
- Current subcategory: ${resource.subcategory || "None"}

Based on the resource details, which category fits best? If the category has subcategories, also suggest the most appropriate subcategory.

Respond in this exact format: "CategoryName" or "CategoryName > SubcategoryName" (nothing else).`;

        console.log(`📝 Analyzing [${i + 1}/${resources.length}]: "${resource.name}" (${resource.category})`);
        
        const completion = await groq.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "llama-3.1-8b-instant",
          temperature: 0.1,
          max_tokens: 50,
        });

        const suggestion = completion.choices[0]?.message?.content?.trim();
        
        // Parse category and subcategory
        let suggestedCategory = suggestion;
        let suggestedSubcategory = null;
        
        if (suggestion?.includes(" > ")) {
          const parts = suggestion.split(" > ");
          suggestedCategory = parts[0];
          suggestedSubcategory = parts[1];
        }
        
        const categoryChanged = suggestedCategory !== resource.category;
        const subcategoryChanged = suggestedSubcategory !== resource.subcategory;
        
        if (categoryChanged || subcategoryChanged) {
          console.log(`🔄 Change suggested: "${resource.name}" ${resource.category} → ${suggestedCategory}${suggestedSubcategory ? ` > ${suggestedSubcategory}` : ''}`);
        } else {
          console.log(`✅ Correct: "${resource.name}" stays in ${resource.category}`);
        }
        
        suggestions.push({
          id: resource.id,
          currentCategory: resource.category,
          currentSubcategory: resource.subcategory,
          suggestedCategory: suggestedCategory,
          suggestedSubcategory: suggestedSubcategory,
          confidence: (!categoryChanged && !subcategoryChanged) ? "high" : "medium",
        });

      } catch (error) {
        console.error(`Error categorizing resource ${resource.id}:`, error);
        suggestions.push({
          id: resource.id,
          currentCategory: resource.category,
          suggestedCategory: resource.category,
          confidence: "error",
        });
      }
    }

    const changesCount = suggestions.filter(s => s.suggestedCategory !== s.currentCategory).length;
    console.log(`🏁 Batch complete: ${changesCount}/${resources.length} changes suggested`);
    
    return NextResponse.json({ 
      suggestions,
      processed: resources.length,
      offset: offset + resources.length
    });
  } catch (error) {
    console.error("Categorization error:", error);
    return NextResponse.json(
      { error: "Failed to categorize resources" },
      { status: 500 }
    );
  }
}