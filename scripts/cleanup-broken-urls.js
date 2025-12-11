require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  console.error('Make sure .env.local exists with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUrl(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000,
      validateStatus: (status) => status < 500, // Don't throw on 4xx errors
    });
    
    return {
      url,
      status: response.status,
      working: response.status < 400,
    };
  } catch (error) {
    return {
      url,
      status: error.response?.status || 'TIMEOUT/ERROR',
      working: false,
      error: error.code || error.message,
    };
  }
}

async function cleanupBrokenUrls() {
  console.log('🔍 Fetching all resources from database...');
  
  const { data: resources, error } = await supabase
    .from('resources')
    .select('id, name, url, status');

  if (error) {
    console.error('Error fetching resources:', error);
    return;
  }

  console.log(`📊 Found ${resources.length} resources to check`);
  
  const brokenUrls = [];
  const workingUrls = [];
  
  for (let i = 0; i < resources.length; i++) {
    const resource = resources[i];
    console.log(`\n[${i + 1}/${resources.length}] Checking: ${resource.name}`);
    console.log(`URL: ${resource.url}`);
    
    const result = await checkUrl(resource.url);
    
    if (result.working) {
      console.log(`✅ Working (${result.status})`);
      workingUrls.push({ ...resource, ...result });
    } else {
      console.log(`❌ Broken (${result.status}) - ${result.error || 'Not accessible'}`);
      brokenUrls.push({ ...resource, ...result });
    }
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n📋 SUMMARY:');
  console.log(`✅ Working URLs: ${workingUrls.length}`);
  console.log(`❌ Broken URLs: ${brokenUrls.length}`);
  
  if (brokenUrls.length > 0) {
    console.log('\n🚨 BROKEN RESOURCES:');
    brokenUrls.forEach((resource, index) => {
      console.log(`${index + 1}. ${resource.name}`);
      console.log(`   URL: ${resource.url}`);
      console.log(`   Status: ${resource.status}`);
      console.log(`   ID: ${resource.id}`);
      console.log('');
    });
    
    console.log('\n❓ What would you like to do with broken URLs?');
    console.log('1. Delete them automatically');
    console.log('2. Mark them as "pending" for review');
    console.log('3. Just show the list (no action)');
    
    // For now, just show the list. You can uncomment below to enable auto-cleanup:
    
    /*
    // Uncomment this section if you want to automatically delete broken URLs:
    console.log('\n🗑️  Deleting broken resources...');
    const brokenIds = brokenUrls.map(r => r.id);
    
    const { error: deleteError } = await supabase
      .from('resources')
      .delete()
      .in('id', brokenIds);
    
    if (deleteError) {
      console.error('Error deleting resources:', deleteError);
    } else {
      console.log(`✅ Successfully deleted ${brokenIds.length} broken resources`);
    }
    */
  } else {
    console.log('\n🎉 All URLs are working correctly!');
  }
}

// Run the cleanup
cleanupBrokenUrls().catch(console.error);