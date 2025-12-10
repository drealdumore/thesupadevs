const { createClient } = require('@supabase/supabase-js');
const { EXTENSIONS } = require('../src/lib/data/extensions.ts');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function importExtensions() {
  console.log(`Starting import of ${EXTENSIONS.length} extensions...`);
  
  let added = 0;
  let skipped = 0;
  
  for (const ext of EXTENSIONS) {
    try {
      // Check if extension already exists by URL
      const { data: existing } = await supabase
        .from('resources')
        .select('id')
        .eq('url', ext.vsMarketplaceLink)
        .single();
      
      if (existing) {
        console.log(`⏭️  Skipped: ${ext.name} (already exists)`);
        skipped++;
        continue;
      }
      
      // Insert new extension
      const { error } = await supabase
        .from('resources')
        .insert({
          name: ext.name,
          category: 'tools',
          subcategory: 'extensions',
          description: ext.description,
          url: ext.vsMarketplaceLink,
          tags: [ext.publisher, 'vscode', 'extension'],
          status: 'pending'
        });
      
      if (error) {
        console.error(`❌ Error adding ${ext.name}:`, error.message);
      } else {
        console.log(`✅ Added: ${ext.name}`);
        added++;
      }
      
    } catch (error) {
      console.error(`❌ Error processing ${ext.name}:`, error.message);
    }
  }
  
  console.log(`\n📊 Import complete:`);
  console.log(`   Added: ${added}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Total: ${EXTENSIONS.length}`);
}

importExtensions().catch(console.error);