require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const resources = [
  // Backend - Databases
  { name: 'PostgreSQL', url: 'https://postgresql.org', description: 'Open-source relational database management system', category: 'Backend', subcategory: 'Databases' },
  { name: 'MySQL', url: 'https://mysql.com', description: 'Popular open-source database', category: 'Backend', subcategory: 'Databases' },
  { name: 'MongoDB', url: 'https://mongodb.com', description: 'NoSQL document database', category: 'Backend', subcategory: 'Databases' },
  { name: 'Oracle', url: 'https://oracle.com', description: 'Database technology and cloud solutions', category: 'Backend', subcategory: 'Databases' },
  
  // DevOps - Cloud
  { name: 'AWS', url: 'https://aws.amazon.com', description: 'Cloud computing platform by Amazon', category: 'DevOps', subcategory: 'Cloud' },
  { name: 'Google Cloud', url: 'https://cloud.google.com', description: 'Cloud computing services by Google', category: 'DevOps', subcategory: 'Cloud' },
  { name: 'Microsoft Azure', url: 'https://azure.microsoft.com', description: 'Cloud computing services by Microsoft', category: 'DevOps', subcategory: 'Cloud' },
  { name: 'DigitalOcean', url: 'https://digitalocean.com', description: 'Cloud infrastructure provider', category: 'DevOps', subcategory: 'Cloud' },
  
  // Fullstack - Hosting
  { name: 'Heroku', url: 'https://heroku.com', description: 'Cloud platform as a service', category: 'Fullstack', subcategory: 'Hosting' },
  { name: 'Netlify', url: 'https://netlify.com', description: 'Build, deploy, and manage modern web projects', category: 'Fullstack', subcategory: 'Hosting' },
  { name: 'Vercel', url: 'https://vercel.com', description: 'Deploy web projects with ease', category: 'Fullstack', subcategory: 'Hosting' }
];

async function scrapeImage(url) {
  try {
    const response = await axios.get(`http://localhost:3000/api/scrape-metadata?url=${encodeURIComponent(url)}`);
    return response.data.success ? response.data.metadata.image : null;
  } catch (error) {
    console.log(`   ⚠️  Could not scrape image for ${url}`);
    return null;
  }
}

async function addResources() {
  console.log(`🚀 Adding ${resources.length} database & cloud resources with images...`);
  
  let added = 0;
  let skipped = 0;
  
  for (const resource of resources) {
    try {
      // Check if resource already exists
      const { data: existing } = await supabase
        .from('resources')
        .select('id')
        .eq('url', resource.url)
        .single();
      
      if (existing) {
        console.log(`⏭️  Skipped: ${resource.name} (already exists)`);
        skipped++;
        continue;
      }
      
      console.log(`📥 Adding: ${resource.name}...`);
      
      // Scrape image
      const imageUrl = await scrapeImage(resource.url);
      if (imageUrl) {
        console.log(`   🖼️  Got image: ${imageUrl.substring(0, 50)}...`);
      }
      
      // Add the resource
      const { error } = await supabase
        .from('resources')
        .insert({
          name: resource.name,
          url: resource.url,
          description: resource.description,
          category: resource.category,
          subcategory: resource.subcategory,
          status: 'pending',
          tags: ['database', 'cloud', 'infrastructure'],
          image_url: imageUrl
        });
      
      if (error) {
        console.error(`❌ Error adding ${resource.name}:`, error);
      } else {
        console.log(`✅ Added: ${resource.name} (${resource.category} > ${resource.subcategory})`);
        added++;
      }
      
      // Small delay to avoid overwhelming the scraper
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`❌ Error processing ${resource.name}:`, error);
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`✅ Added: ${added} resources`);
  console.log(`⏭️  Skipped: ${skipped} resources (already exist)`);
  console.log(`📝 All resources added as PENDING status with images`);
}

// Run the script
addResources().catch(console.error);