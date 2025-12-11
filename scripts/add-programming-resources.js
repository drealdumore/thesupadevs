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

const resources = [
  // Learning - Documentation
  { name: 'W3Schools', url: 'https://w3schools.com', description: 'The world\'s largest web developer site', category: 'Learning', subcategory: 'Documentation' },
  { name: 'DevDocs', url: 'https://devdocs.io', description: 'Fast, offline, and free documentation browser', category: 'Learning', subcategory: 'Documentation' },
  
  // Learning - Tutorials
  { name: 'TutorialsPoint', url: 'https://tutorialspoint.com', description: 'A comprehensive tutorial website', category: 'Learning', subcategory: 'Tutorials' },
  { name: 'CSS-Tricks', url: 'https://css-tricks.com', description: 'Web design and development blog', category: 'Learning', subcategory: 'Tutorials' },
  { name: 'SitePoint', url: 'https://sitepoint.com', description: 'Resources for web developers and designers', category: 'Learning', subcategory: 'Tutorials' },
  { name: 'Scotch.io', url: 'https://scotch.io', description: 'Fun and practical web development tutorials', category: 'Learning', subcategory: 'Tutorials' },
  { name: 'Codrops', url: 'https://tympanus.net/codrops', description: 'Web design and development resources', category: 'Learning', subcategory: 'Tutorials' },
  { name: 'The Odin Project', url: 'https://theodinproject.com', description: 'Learn web development for free', category: 'Learning', subcategory: 'Tutorials' },
  
  // Learning - Courses
  { name: 'Codecademy', url: 'https://codecademy.com', description: 'Learn to code interactively', category: 'Learning', subcategory: 'Courses' },
  { name: 'freeCodeCamp', url: 'https://freecodecamp.org', description: 'Learn to code and help nonprofits', category: 'Learning', subcategory: 'Courses' },
  { name: 'edX', url: 'https://edx.org', description: 'Access 2000 online courses from 140 leading institutions worldwide', category: 'Learning', subcategory: 'Courses' },
  { name: 'Coursera', url: 'https://coursera.org', description: 'Online courses from top universities and companies', category: 'Learning', subcategory: 'Courses' },
  { name: 'Udemy', url: 'https://udemy.com', description: 'Online learning platform', category: 'Learning', subcategory: 'Courses' },
  { name: 'Pluralsight', url: 'https://pluralsight.com', description: 'Learn technology skills with expert-led video courses', category: 'Learning', subcategory: 'Courses' },
  { name: 'Treehouse', url: 'https://teamtreehouse.com', description: 'Learn to code and gain new skills', category: 'Learning', subcategory: 'Courses' },
  { name: 'Frontend Masters', url: 'https://frontendmasters.com', description: 'In-depth courses on front-end engineering', category: 'Learning', subcategory: 'Courses' },
  { name: 'Khan Academy', url: 'https://khanacademy.org', description: 'Free online courses, lessons, and practice', category: 'Learning', subcategory: 'Courses' },
  
  // Learning - Blogs
  { name: 'GeeksforGeeks', url: 'https://geeksforgeeks.org', description: 'Computer science portal for geeks', category: 'Learning', subcategory: 'Blogs' },
  
  // Tools - Version Control
  { name: 'GitHub', url: 'https://github.com', description: 'Platform for version control and collaboration', category: 'Tools', subcategory: 'Version Control' },
  
  // Tools - Testing
  { name: 'HackerRank', url: 'https://hackerrank.com', description: 'Practice coding, prepare for interviews, and get hired', category: 'Tools', subcategory: 'Testing' },
  
  // Learning - Documentation (Community)
  { name: 'Stack Overflow', url: 'https://stackoverflow.com', description: 'Q&A community for developers', category: 'Learning', subcategory: 'Documentation' }
];

async function addResources() {
  console.log(`🚀 Adding ${resources.length} programming resources...`);
  
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
          tags: ['programming', 'development']
        });
      
      if (error) {
        console.error(`❌ Error adding ${resource.name}:`, error);
      } else {
        console.log(`✅ Added: ${resource.name} (${resource.category} > ${resource.subcategory})`);
        added++;
      }
      
    } catch (error) {
      console.error(`❌ Error processing ${resource.name}:`, error);
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`✅ Added: ${added} resources`);
  console.log(`⏭️  Skipped: ${skipped} resources (already exist)`);
  console.log(`📝 All resources added as PENDING status`);
}

// Run the script
addResources().catch(console.error);