require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const cheerio = require('cheerio');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function scrapeMetadata(url) {
  try {
    // Try Microlink API first
    const microlinkResponse = await axios.get(
      `https://api.microlink.io?url=${encodeURIComponent(url)}`,
      { timeout: 5000 }
    );

    if (microlinkResponse.data.status === 'success') {
      const data = microlinkResponse.data.data;
      return data.image?.url || data.logo?.url || null;
    }
  } catch (error) {
    console.log(`Microlink failed for ${url}, trying fallback...`);
  }

  // Fallback scraper
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DevLibrary/1.0; +https://devlibrary.com)',
      },
      timeout: 8000,
    });

    const $ = cheerio.load(data);
    const ogImage = $('meta[property="og:image"]').attr('content');
    const twitterImage = $('meta[name="twitter:image"]').attr('content');
    const favicon = $('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href');

    let imageUrl = ogImage || twitterImage;
    if (!imageUrl && favicon) {
      imageUrl = favicon.startsWith('http') ? favicon : new URL(favicon, url).href;
    }

    return imageUrl || null;
  } catch (error) {
    console.log(`Failed to scrape ${url}:`, error.message);
    return null;
  }
}

async function backfillImages() {
  console.log('🚀 Starting image backfill process...\n');

  // Fetch all resources without images
  const { data: resources, error } = await supabase
    .from('resources')
    .select('id, name, url, image_url')
    .is('image_url', null);

  if (error) {
    console.error('Error fetching resources:', error);
    return;
  }

  console.log(`Found ${resources.length} resources without images\n`);

  let processed = 0;
  let updated = 0;
  let failed = 0;

  for (const resource of resources) {
    processed++;
    console.log(`[${processed}/${resources.length}] Processing: ${resource.name}`);
    console.log(`URL: ${resource.url}`);

    const imageUrl = await scrapeMetadata(resource.url);

    if (imageUrl) {
      // Update the resource with the scraped image
      const { error: updateError } = await supabase
        .from('resources')
        .update({ image_url: imageUrl })
        .eq('id', resource.id);

      if (updateError) {
        console.log(`❌ Failed to update ${resource.name}:`, updateError.message);
        failed++;
      } else {
        console.log(`✅ Updated with image: ${imageUrl}`);
        updated++;
      }
    } else {
      console.log(`⚠️  No image found for ${resource.name}`);
      failed++;
    }

    console.log('---');

    // Add delay to be respectful to servers
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n🎉 Backfill complete!');
  console.log(`📊 Results:`);
  console.log(`   • Processed: ${processed}`);
  console.log(`   • Updated: ${updated}`);
  console.log(`   • Failed/No image: ${failed}`);
}

// Run the script
backfillImages().catch(console.error);