require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function scrapeMetadata(url) {
  try {
    // Use your local scrape-metadata API (same as the admin button)
    const response = await axios.get(
      `http://localhost:3000/api/scrape-metadata?url=${encodeURIComponent(url)}`,
      { timeout: 15000 }
    );

    if (response.data.success && response.data.metadata.image) {
      return response.data.metadata.image;
    }
    
    return null;
  } catch (error) {
    console.log(`Failed to scrape ${url}:`, error.response?.status || error.message);
    return null;
  }
}

async function forceRescrapeImages() {
  console.log('🔄 Force re-scraping ALL resource images...\n');

  // Fetch ALL resources (not just ones without images)
  const { data: resources, error } = await supabase
    .from('resources')
    .select('id, name, url, image_url')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching resources:', error);
    return;
  }

  console.log(`Found ${resources.length} total resources to re-scrape\n`);

  const changes = [];
  let processed = 0;

  // First pass: scrape all images and collect changes
  console.log('🔍 PREVIEW MODE: Scraping images (no database changes yet)...\n');
  
  for (const resource of resources) {
    processed++;
    console.log(`[${processed}/${resources.length}] Scraping: ${resource.name}`);
    console.log(`URL: ${resource.url}`);

    const imageUrl = await scrapeMetadata(resource.url);

    if (imageUrl) {
      const hasCurrentImage = resource.image_url && resource.image_url.trim() !== '';
      console.log(`🖼️  Found new image: ${imageUrl.substring(0, 60)}...`);
      console.log(`📋 Current: ${hasCurrentImage ? resource.image_url.substring(0, 60) + '...' : 'No image'}`);
      
      changes.push({
        id: resource.id,
        name: resource.name,
        url: resource.url,
        currentImage: resource.image_url,
        newImage: imageUrl,
        action: hasCurrentImage ? 'UPDATE' : 'ADD'
      });
      console.log(`✅ Will ${hasCurrentImage ? 'UPDATE' : 'ADD'} image`);
    } else {
      console.log(`⚠️  No image found`);
    }

    console.log('---');
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Show summary and ask for confirmation
  console.log('\n📊 PREVIEW SUMMARY:');
  console.log(`   • Total resources checked: ${processed}`);
  console.log(`   • Images found: ${changes.length}`);
  console.log(`   • New images (ADD): ${changes.filter(c => c.action === 'ADD').length}`);
  console.log(`   • Updated images (UPDATE): ${changes.filter(c => c.action === 'UPDATE').length}`);
  
  if (changes.length === 0) {
    console.log('\n❌ No images found to update. Exiting.');
    return;
  }

  console.log('\n🔍 CHANGES TO BE MADE:');
  changes.forEach((change, index) => {
    console.log(`${index + 1}. [${change.action}] ${change.name}`);
    console.log(`   New: ${change.newImage.substring(0, 80)}...`);
  });

  // Ask for confirmation
  console.log('\n❓ Do you want to apply these changes to the database?');
  console.log('   Type "yes" to proceed, anything else to cancel:');
  
  // Wait for user input
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const answer = await new Promise(resolve => {
    rl.question('> ', resolve);
  });
  rl.close();

  if (answer.toLowerCase() !== 'yes') {
    console.log('\n❌ Operation cancelled. No changes made to database.');
    return;
  }

  // Apply changes
  console.log('\n🚀 Applying changes to database...');
  let updated = 0;
  let failed = 0;

  for (const change of changes) {
    try {
      const { error: updateError } = await supabase
        .from('resources')
        .update({ image_url: change.newImage })
        .eq('id', change.id);

      if (updateError) {
        console.log(`❌ Failed to update ${change.name}:`, updateError.message);
        failed++;
      } else {
        console.log(`✅ Updated: ${change.name}`);
        updated++;
      }
    } catch (error) {
      console.log(`❌ Error updating ${change.name}:`, error.message);
      failed++;
    }
  }

  console.log('\n🎉 Force re-scrape complete!');
  console.log(`📊 Final Results:`);
  console.log(`   • Successfully updated: ${updated}`);
  console.log(`   • Failed: ${failed}`);
}

// Run the script
forceRescrapeImages().catch(console.error);