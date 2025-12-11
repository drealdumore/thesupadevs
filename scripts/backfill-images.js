require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");
const axios = require("axios");
const cheerio = require("cheerio");

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function scrapeMetadata(url) {
  try {
    // Use your local scrape-metadata API
    const apiBaseUrl = process.env.API_BASE_URL || "http://localhost:3000";
    const response = await axios.get(
      `${apiBaseUrl}/api/scrape-metadata?url=${encodeURIComponent(url)}`,
      { timeout: 10000 }
    );

    if (response.data.success && response.data.metadata.image) {
      return response.data.metadata.image;
    }

    return null;
  } catch (error) {
    console.log(`Failed to scrape ${url}:`, error.message);
    return null;
  }
}

async function backfillImages() {
  console.log("🚀 Starting image backfill process...\n");

  // Fetch all resources without images (null, empty string, or missing)
  const { data: resources, error } = await supabase
    .from("resources")
    .select("id, name, url, image_url")
    .or("image_url.is.null,image_url.eq.");

  if (error) {
    console.error("Error fetching resources:", error);
    return;
  }

  console.log(`Found ${resources.length} resources without images\n`);

  let processed = 0;
  let updated = 0;
  let failed = 0;

  for (const resource of resources) {
    processed++;
    console.log(
      `[${processed}/${resources.length}] Processing: ${resource.name}`
    );
    console.log(`URL: ${resource.url}`);

    const imageUrl = await scrapeMetadata(resource.url);

    if (imageUrl) {
      console.log(`🖼️  Found image: ${imageUrl.substring(0, 60)}...`);
      // Update the resource with the scraped image
      const { error: updateError } = await supabase
        .from("resources")
        .update({ image_url: imageUrl })
        .eq("id", resource.id);

      if (updateError) {
        console.log(
          `❌ Failed to update ${resource.name}:`,
          updateError.message
        );
        failed++;
      } else {
        console.log(`✅ Updated with image: ${imageUrl}`);
        updated++;
      }
    } else {
      console.log(`⚠️  No image found for ${resource.name}`);
      failed++;
    }

    console.log("---");

    // Add delay to be respectful to servers
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log("\n🎉 Backfill complete!");
  console.log(`📊 Results:`);
  console.log(`   • Processed: ${processed}`);
  console.log(`   • Updated: ${updated}`);
  console.log(`   • Failed/No image: ${failed}`);
}

// Run the script
backfillImages().catch(console.error);
