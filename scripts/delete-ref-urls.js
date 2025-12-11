require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteRefUrls() {
  console.log('🔍 Finding resources with ?ref=onur.dev...');
  
  const { data: resources, error } = await supabase
    .from('resources')
    .select('id, name, url')
    .like('url', '%?ref=onur.dev%');

  if (error) {
    console.error('Error fetching resources:', error);
    return;
  }

  console.log(`📊 Found ${resources.length} resources with ?ref=onur.dev`);
  
  if (resources.length === 0) {
    console.log('✅ No resources found with ?ref=onur.dev');
    return;
  }

  // Show what will be deleted
  console.log('\n🗑️  Resources to be deleted:');
  resources.forEach((resource, index) => {
    console.log(`${index + 1}. ${resource.name}`);
    console.log(`   URL: ${resource.url}`);
    console.log(`   ID: ${resource.id}`);
    console.log('');
  });

  // Delete them
  console.log(`\n🚨 Deleting ${resources.length} resources...`);
  
  const resourceIds = resources.map(r => r.id);
  const { error: deleteError } = await supabase
    .from('resources')
    .delete()
    .in('id', resourceIds);

  if (deleteError) {
    console.error('❌ Error deleting resources:', deleteError);
  } else {
    console.log(`✅ Successfully deleted ${resources.length} resources with ?ref=onur.dev`);
  }
}

// Run the cleanup
deleteRefUrls().catch(console.error);