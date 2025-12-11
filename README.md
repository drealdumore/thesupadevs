# TheSupaDevs - Curated Developer Resources

A sleek, modern web application where developers can discover and share 1000+ curated resources. Built with enterprise-level SEO optimization and buttery smooth animations.

🌐 **Live Demo**: [thesupadevs.vercel.app](https://thesupadevs.vercel.app)

## ✨ Features

### 🎨 **Design & UX**
- **Modern Dark Theme**: Sleek interface optimized for developer workflows
- **Buttery Smooth Animations**: Powered by Framer Motion with staggered entrances
- **Lenis Smooth Scrolling**: Premium scrolling experience throughout the app
- **Responsive Design**: Works beautifully on all devices
- **Loading States**: Skeleton loaders for smooth UX

### 🚀 **Core Features**
- **1000+ Curated Resources**: Browse by Frontend, Backend, DevOps, Design, Tools, and Learning
- **Smart Search**: Real-time search with keyboard shortcuts (Press `/` to focus)
- **Dynamic Categories**: Database-driven categories and subcategories
- **Image Scraping**: Automatic OG image extraction with Microlink API + fallback scraper
- **Modal Interface**: Quick resource submission without page navigation
- **Draft Saving**: Auto-saves form data to localStorage

### 🔧 **Admin Features**
- **Admin Dashboard**: Curate and manage resources with authentication
- **Approval Workflow**: Review pending submissions before they go live
- **Bulk Operations**: Efficiently manage multiple resources

### 🎯 **Enterprise SEO**
- **Dynamic Metadata**: Resource counts in titles/descriptions
- **Open Graph Images**: Social media optimization
- **Structured Data**: Rich snippets ready
- **Dynamic Sitemap**: Auto-updates with new categories
- **PWA Ready**: App store optimization
- **Performance Optimized**: Core Web Vitals focused

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui (customized for dark theme)
- **Animations**: Framer Motion + Lenis smooth scrolling
- **Backend**: Supabase (Authentication + Database + RLS)
- **Form Validation**: React Hook Form + Zod
- **Image Processing**: Microlink API + Cheerio fallback scraper
- **SEO**: Dynamic metadata, sitemap, robots.txt
- **Fonts**: Inter (body) + Sora (headings) with preloading

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- A Supabase account

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/drealdumore/thesupadevs.git
   cd thesupadevs
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up Supabase**

   Create a new project on [Supabase](https://supabase.com) and run this SQL:

   ```sql
   -- Resources table
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

   -- Categories table
   CREATE TABLE categories (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL UNIQUE,
     description TEXT,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- Subcategories table
   CREATE TABLE subcategories (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL,
     category_id UUID REFERENCES categories(id),
     created_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- Enable RLS
   ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
   ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
   ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;

   -- Policies
   CREATE POLICY "Public can view approved resources" ON resources FOR SELECT USING (status = 'approved');
   CREATE POLICY "Public can view categories" ON categories FOR SELECT USING (true);
   CREATE POLICY "Public can view subcategories" ON subcategories FOR SELECT USING (true);
   CREATE POLICY "Authenticated users can insert resources" ON resources FOR INSERT WITH CHECK (true);
   CREATE POLICY "Authenticated users can manage resources" ON resources FOR ALL USING (true);
   ```

4. **Configure environment variables**

   Create `.env.local`:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Run the development server**
   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📚 Usage

### For Users
- **Browse Resources**: View 1000+ curated resources with image previews
- **Smart Search**: Press `/` to focus search, find resources instantly
- **Category Navigation**: Filter by Frontend, Backend, DevOps, etc.
- **Subcategory Drill-down**: Explore specific topics within categories
- **Add Resources**: Submit new resources via modal interface

### For Admins
- Navigate to `/admin` and sign in
- **Review Submissions**: Approve/reject pending resources
- **Manage Categories**: Add new categories and subcategories
- **Bulk Operations**: Efficiently manage multiple resources

## 🎯 SEO Features

### **Enterprise-Level Optimization**
- **Dynamic Titles**: "Frontend Resources - 150+ Curated Tools | TheSupaDevs"
- **Smart Descriptions**: Include actual resource counts from database
- **Category Keywords**: React, Vue, Docker, AWS, etc.
- **Open Graph Images**: Social media optimization
- **Twitter Cards**: Enhanced social sharing
- **Structured Data**: Rich snippets ready
- **Dynamic Sitemap**: Auto-updates with categories
- **PWA Manifest**: App store ready

### **Performance**
- **Font Preloading**: Eliminates font flash (FOUC)
- **Image Optimization**: Lazy loading with skeleton states
- **Core Web Vitals**: Optimized for Google rankings
- **Smooth Scrolling**: Lenis for premium UX

## 📁 Project Structure

```
thesupadevs/
├── src/
│   ├── app/
│   │   ├── admin/                    # Admin dashboard
│   │   ├── api/scrape-metadata/      # Image scraping API
│   │   ├── category/[slug]/          # Dynamic category pages
│   │   ├── opengraph-image.png       # OG image
│   │   ├── favicon.ico               # Favicon
│   │   ├── sitemap.ts                # Dynamic sitemap
│   │   └── layout.tsx                # Root layout with SEO
│   ├── components/
│   │   ├── ui/                       # shadcn components
│   │   ├── home/                     # Home page components
│   │   └── ...                       # Other components
│   └── lib/
│       ├── supabase/                 # Database clients
│       └── types/                    # TypeScript definitions
├── public/
│   ├── robots.txt                    # SEO robots file
│   ├── manifest.json                 # PWA manifest
│   └── opengraph-image.png           # Social media image
└── scripts/                          # Utility scripts
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📝 Available Scripts

- `pnpm dev` - Development server with Turbopack
- `pnpm build` - Production build
- `pnpm start` - Production server
- `pnpm lint` - ESLint check
- `pnpm backfill-images` - Scrape missing images

## 🔧 Customization

### Adding Categories
1. Insert into `categories` table in Supabase
2. Add subcategories to `subcategories` table
3. Update category icons in `HomePageClient.tsx`

### Styling
- Edit `src/app/globals.css` for theme colors
- Modify Tailwind config for design system changes
- Adjust animations in component files

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - feel free to use this project for your own resource library!

## 👨‍💻 Author

**Samuel Isah** ([@drealdumore](https://x.com/drealdumore))

---

⭐ **Star this repo** if you found it helpful!