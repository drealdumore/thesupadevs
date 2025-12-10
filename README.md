# DevLibrary

A sleek, minimal web application where developers can discover and share useful resources — curated by category and reviewed by an admin. Built with modern web technologies and buttery smooth animations.

## ✨ Features

### 🎨 **Design & UX**
- **Modern Dark Theme**: Sleek interface optimized for developer workflows
- **Buttery Smooth Animations**: Powered by Framer Motion with staggered entrances
- **Lenis Smooth Scrolling**: Premium scrolling experience throughout the app
- **Responsive Design**: Works beautifully on all devices
- **Consistent Layout**: All cards maintain uniform height for perfect grid alignment

### 🚀 **Core Features**
- **Categorized Resources**: Browse by Frontend, Backend, Fullstack, DevOps, Design, Tools, and Learning
- **Smart Search**: Real-time search with keyboard shortcuts (Press `/` to focus)
- **Subcategory Navigation**: Drill down into specific topics within each category
- **Image Scraping**: Automatic OG image extraction with Microlink API + fallback scraper
- **Modal Interface**: Quick resource submission without page navigation
- **Draft Saving**: Auto-saves form data to localStorage

### 🔧 **Admin Features**
- **Admin Dashboard**: Curate and manage resources with authentication
- **Approval Workflow**: Review pending submissions before they go live
- **Bulk Operations**: Efficiently manage multiple resources

### ⚡ **Performance**
- **Optimized Images**: Lazy loading with skeleton states
- **Fast Navigation**: Client-side routing with smooth transitions
- **Efficient Caching**: Smart data fetching and caching strategies

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui (customized for dark theme)
- **Animations**: Framer Motion + Lenis smooth scrolling
- **Backend**: Supabase (Authentication + Database + RLS)
- **Form Validation**: React Hook Form + Zod
- **Image Processing**: Microlink API + Cheerio fallback scraper
- **Styling**: Tailwind CSS with custom design system

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- A Supabase account

### Setup

1. **Clone the repository**

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up Supabase**

   Create a new project on [Supabase](https://supabase.com) and run this SQL to create the resources table:

   ```sql
   CREATE TABLE resources (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL,
     category TEXT NOT NULL,
     subcategory TEXT,
     description TEXT NOT NULL,
     url TEXT NOT NULL,
     tags TEXT[] DEFAULT '{}',
     status TEXT NOT NULL CHECK (status IN ('pending', 'approved')),
     image_url TEXT,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- Enable Row Level Security
   ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

   -- Allow public read access to approved resources
   CREATE POLICY "Public can view approved resources"
     ON resources FOR SELECT
     USING (status = 'approved');

   -- Allow authenticated users to insert resources
   CREATE POLICY "Authenticated users can insert resources"
     ON resources FOR INSERT
     WITH CHECK (true);

   -- Allow authenticated users (admin) to update and delete
   CREATE POLICY "Authenticated users can update resources"
     ON resources FOR UPDATE
     USING (true);

   CREATE POLICY "Authenticated users can delete resources"
     ON resources FOR DELETE
     USING (true);
   ```

4. **Configure environment variables**

   Copy `.env.local.example` to `.env.local` and add your Supabase credentials:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Create an admin user**

   In your Supabase dashboard, go to Authentication → Users and create a new user with email/password. This will be your admin account.

6. **Run the development server**
   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see the app.

7. **Backfill existing images** (optional)
   ```bash
   pnpm backfill-images
   ```
   This will scrape images for existing resources that don't have them.

## 📚 Usage

### For Users

1. **Browse Resources**: View all approved resources with beautiful image previews
2. **Search**: Use the search bar or press `/` to quickly find resources
3. **Filter by Category**: Click category buttons to filter resources
4. **Explore Subcategories**: Click on subcategory cards to drill down
5. **Add Resource**: Click "Submit" to open the modal and add new resources
6. **Auto-fill Forms**: Paste a URL and watch the form auto-populate with scraped data

### For Admins

1. Navigate to `/admin`
2. Sign in with your admin credentials
3. **Review Pending Resources**: See all submitted resources with previews
4. **Approve/Reject**: Approve resources to make them visible on the main page
5. **Manage Categories**: Update resource categories and subcategories
6. **Bulk Operations**: Efficiently manage multiple resources

## 📁 Project Structure

```
devlibrary/
├── src/
│   ├── app/
│   │   ├── admin/                    # Admin dashboard
│   │   ├── api/scrape-metadata/      # Image scraping API
│   │   ├── category/[slug]/          # Dynamic category pages
│   │   ├── not-found.tsx            # Custom 404 page
│   │   ├── ClientBody.tsx           # Client-side body wrapper
│   │   └── page.tsx                 # Home page
│   ├── components/
│   │   ├── ui/                      # shadcn components (customized)
│   │   ├── header.tsx               # Animated app header
│   │   ├── add-resource-modal.tsx   # Resource submission modal
│   │   ├── resource-card.tsx        # Optimized resource cards
│   │   ├── smooth-scroll.tsx        # Lenis smooth scrolling
│   │   └── theme-provider.tsx       # Dark theme provider
│   ├── lib/
│   │   ├── supabase/               # Supabase clients
│   │   └── types/                  # TypeScript types
│   └── scripts/
│       └── backfill-images.js      # Image backfill script
└── ...
```

## ⚙️ Key Features Explained

### 🎨 Smooth Animations
- **Staggered Entrances**: Elements animate in sequence for polished feel
- **Hover Effects**: Cards lift and scale on interaction
- **Page Transitions**: Smooth navigation between routes
- **Loading States**: Skeleton screens while content loads

### 🖼️ Image Scraping System
- **Microlink API**: Primary scraper for fast, reliable results
- **Cheerio Fallback**: Custom scraper when Microlink fails
- **Auto-fill Forms**: Scrapes title, description, and images
- **Error Handling**: Graceful fallbacks for broken images

### 🚀 Performance Optimizations
- **Lazy Loading**: Images load only when visible
- **Smooth Scrolling**: Lenis for buttery scroll experience
- **Optimized Animations**: GPU-accelerated transforms
- **Efficient Caching**: Smart data fetching strategies

## 🎨 Customization

### Colors & Theme
Edit `src/app/globals.css` to customize the color scheme. The app uses CSS variables for consistent theming.

### Categories & Subcategories
Update categories in multiple files:
- `src/app/page.tsx` - Main category definitions
- `src/app/category/[slug]/page.tsx` - Category page logic
- `src/components/add-resource-modal.tsx` - Form options

### Animation Settings
Adjust animation timing in components:
- `duration`: Animation length (0.2-0.5s recommended)
- `delay`: Stagger timing (0.05-0.1s increments)
- `easing`: Animation curves for natural feel

## 🚀 Deployment

This app can be deployed to Netlify, Vercel, or any platform supporting Next.js.

### Environment Variables
Make sure to set these in your deployment platform:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Build Commands
```bash
# Install dependencies
pnpm install

# Build for production
pnpm build

# Start production server
pnpm start
```

## 📝 Available Scripts

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm backfill-images` - Scrape images for existing resources

## 📚 API Routes

- `GET /api/scrape-metadata?url=<url>` - Scrape metadata from any URL
  - Returns: `{ metadata: { title, description, image }, success: boolean }`
  - Supports: Microlink API + Cheerio fallback

## 🔧 Development Tips

1. **Adding New Categories**: Update the `categories` array in multiple files
2. **Customizing Animations**: Adjust Framer Motion props in components
3. **Image Optimization**: The scraper handles most cases automatically
4. **Performance**: Use React DevTools Profiler to monitor render performance

## 📜 License

MIT - Feel free to use this project as a starting point for your own resource library!
