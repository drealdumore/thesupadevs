const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function cleanUrls() {
  try {
    // Fetch all resources
    const { data: resources, error: fetchError } = await supabase
      .from('resources')
      .select('id, url');

    if (fetchError) {
      console.error('Error fetching resources:', fetchError);
      return;
    }

    console.log(`Found ${resources.length} resources to check`);

    let updatedCount = 0;

    for (const resource of resources) {
      const originalUrl = resource.url;
      
      // Remove ?ref=onur.dev parameter
      const cleanedUrl = originalUrl.replace(/[?&]ref=onur\.dev/g, '');
      
      if (cleanedUrl !== originalUrl) {
        const { error: updateError } = await supabase
          .from('resources')
          .update({ url: cleanedUrl })
          .eq('id', resource.id);

        if (updateError) {
          console.error(`Error updating resource ${resource.id}:`, updateError);
        } else {
          console.log(`Updated: ${originalUrl} → ${cleanedUrl}`);
          updatedCount++;
        }
      }
    }

    console.log(`\nCompleted! Updated ${updatedCount} URLs`);
  } catch (error) {
    console.error('Script error:', error);
  }
}

cleanUrls();