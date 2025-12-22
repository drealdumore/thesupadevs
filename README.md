# TheSupaDevs - Curated Developer Resources

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Open Source](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://opensource.org/)
[![Made with Next.js](https://img.shields.io/badge/Made%20with-Next.js-000000?logo=next.js)](https://nextjs.org/)

A sleek, modern **open-source** web application where developers can discover and share 1000+ curated resources. Built with enterprise-level SEO optimization, AI-powered categorization, and buttery smooth animations.

🌐 **Live Demo**: [thesupadevs.vercel.app](https://thesupadevs.vercel.app)  
🤝 **Contributing**: [See CONTRIBUTING.md](./CONTRIBUTING.md)

## ✨ Features

### 🎨 **Design & UX**

- **Modern Dark Theme**: Sleek interface optimized for developer workflows with custom Work Sans font
- **Buttery Smooth Animations**: Powered by Framer Motion with staggered entrances and micro-interactions
- **Lenis Smooth Scrolling**: Premium scrolling experience throughout the app
- **Responsive Design**: Fully responsive across all devices with mobile-first approach
- **Smart Loading States**: Skeleton loaders with context-aware sizing (different for subcategories vs resources)
- **Custom Loading Animation**: Animated lightning bolt icon with center alignment
- **Open Source Badge**: Prominent GitHub link in hero section

### 🚀 **Core Features**

- **1000+ Curated Resources**: Browse by Frontend, Backend, DevOps, Design, Tools, Learning, and more
- **Smart Search**: Real-time search with keyboard shortcuts (Press `/` to focus)
- **Dynamic Categories & Subcategories**: Database-driven organization with drill-down navigation
- **Intelligent Image Scraping**:
  - Hybrid approach: Microlink API (fast, ~500ms) + Cheerio fallback (reliable, ~2-5s)
  - Multi-source fallback: OG image → Twitter image → First page image → Favicon → Placeholder
  - Automatic retry and error handling
  - In-memory caching to prevent duplicate requests
- **Modal Interface**: Quick resource submission without page navigation
- **Draft Auto-Save**: Form data automatically saved to localStorage
- **Image Previews**: Live preview of scraped images before submission
- **Tag System**: Multi-tag support with visual badges

### 🔧 **Admin Dashboard**

- **Authentication**: Secure Supabase auth with session management
- **Resource Management**:
  - Approve/reject pending submissions
  - Edit resource details inline
  - Re-scrape images for existing resources
  - Bulk operations (approve, reject, delete)
  - Resource selection with checkboxes
- **Advanced Filtering**:
  - Filter by status (all, pending, approved, broken)
  - Search across name, description, URL, and tags
  - Category-based filtering
  - Sort by name, date, category, or status (asc/desc)
- **Broken URL Detection**: Batch check URLs to identify broken links
- **Category Management**:
  - Add/delete categories
  - Add/delete subcategories
  - Organize resources hierarchically
- **AI-Powered Categorization**:
  - Batch processing (50 resources at a time)
  - Groq AI suggestions for better categorization
  - Review and apply suggestions selectively
  - Progress tracking across batches
  - Confidence scoring for suggestions
- **Analytics Dashboard**:
  - Total resource counts
  - Status breakdown (approved/pending)
  - Category distribution with visual progress bars
  - Percentage calculations
- **Resource Details Modal**: View complete resource information
- **Bulk Operations**: Multi-select and batch actions
- **Loading Stages**: Progressive loading with stage indicators

### 🎯 **Enterprise SEO**

- **Dynamic Metadata**: Resource counts in titles/descriptions pulled from database
- **Open Graph Images**: Social media optimization with custom OG images
- **Structured Data**: Rich snippets ready for search engines
- **Dynamic Sitemap**: Auto-updates with new categories and subcategories
- **PWA Ready**: Progressive Web App with manifest.json
- **Performance Optimized**:
  - Core Web Vitals monitoring (CLS, INP, FCP, LCP, TTFB)
  - ISR (Incremental Static Regeneration) with 5-minute revalidation
  - Image optimization with Next.js Image component
  - Font preloading with local fonts
- **Robots.txt**: Proper crawling directives
- **Canonical URLs**: Prevent duplicate content issues

### ⚡ **Performance Features**

- **ISR Caching**: Homepage data cached and revalidated every 5 minutes
- **Image Optimization**:
  - Lazy loading with skeleton states
  - WebP and AVIF format support
  - Responsive image sizes
  - Blur placeholder on load
- **Font Optimization**:
  - Local font loading with `next/font/local`
  - Work Sans with variable font weights (100-900)
  - Font display swap for better performance
- **Code Splitting**: Automatic route-based code splitting
- **Turbopack**: Fast development with Next.js Turbopack
- **Bundle Analysis**: Built-in bundle analyzer script
- **Performance Monitoring**: Real-time Core Web Vitals tracking

### 🔐 **Security & Best Practices**

- **Row Level Security (RLS)**: Supabase policies for data protection
- **Content Security Policy**: Configured CSP headers including Supabase domains
- **Environment Variables**: Secure credential management
- **Input Validation**: Zod schema validation for forms
- **XSS Protection**: Security headers configured
- **HTTPS Only**: Enforced secure connections

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui (customized for dark theme)
- **Animations**: Framer Motion + Lenis smooth scrolling
- **Backend**: Supabase (Authentication + Database + RLS)
- **Form Validation**: React Hook Form + Zod
- **Image Processing**:
  - **Primary**: Microlink API (fast, reliable, 50 requests/day free)
  - **Fallback**: Cheerio + Axios (custom scraper)
  - **Multi-source**: OG image → Twitter image → First img → Favicon → Placeholder
- **AI Integration**: Groq SDK for intelligent resource categorization
- **SEO**: Dynamic metadata, sitemap, robots.txt, Core Web Vitals monitoring
- **Fonts**: Work Sans (local font) with variable weights
- **Performance**: ISR caching, image optimization, bundle analysis
- **Security**: CSP headers, RLS policies, input validation

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

- **Browse Resources**: View 1000+ curated resources with automatic image previews
- **Smart Search**: Press `/` to focus search, find resources instantly across name, description, and tags
- **Category Navigation**: Filter by Frontend, Backend, DevOps, Design, Tools, Learning, etc.
- **Subcategory Drill-down**: Explore specific topics within categories (e.g., Frontend → React, Vue, Angular)
- **Add Resources**: Submit new resources via modal interface with:
  - Automatic metadata scraping (title, description, image)
  - Live image preview before submission
  - Tag system with visual badges
  - Draft auto-save to localStorage
  - URL validation and normalization

### For Admins

- Navigate to `/admin` and sign in with Supabase credentials
- **Resource Management**:
  - Review and approve/reject pending submissions
  - Edit resource details (name, description, URL, category, tags, image)
  - Re-scrape images for existing resources
  - Delete resources individually or in bulk
- **Advanced Filtering**:
  - Filter by status (all, pending, approved, broken URLs)
  - Search across name, description, URL, and tags
  - Category-based filtering with resource counts
  - Sort by name, date, category, or status (ascending/descending)
- **Broken URL Detection**: Batch check all URLs to identify broken links
- **Category Management**:
  - Add/remove categories and subcategories
  - Organize resources hierarchically
  - View category statistics and distribution
- **AI-Powered Categorization**:
  - Process resources in batches of 50 using Groq AI
  - Review AI suggestions for better categorization
  - Apply suggestions selectively or in bulk
  - Progress tracking across batches with confidence scoring
- **Analytics Dashboard**:
  - View total resource counts and status breakdown
  - Category distribution with visual progress bars
  - Percentage calculations and insights
- **Bulk Operations**:
  - Multi-select resources with checkboxes
  - Batch approve, reject, or delete operations
  - Select all visible or clear selection

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
├── .github/                          # GitHub templates
└── CONTRIBUTING.md                   # Contribution guidelines
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

### Development

- `pnpm dev` - Development server with Turbopack (fast)
- `pnpm dev:no-turbo` - Development server without Turbopack
- `pnpm build` - Production build
- `pnpm start` - Production server
- `pnpm lint` - ESLint check

### Performance & Analysis

- `pnpm analyze` - Bundle size analysis with @next/bundle-analyzer
- `pnpm lighthouse` - Lighthouse performance audit
- `pnpm perf` - Build and start for performance testing

### Deployment

- Automatic deployment on Vercel via GitHub integration
- Environment variables configured in Vercel dashboard

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

**We welcome contributions!** TheSupaDevs is open source and we'd love your help making it better.

### Quick Start

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/YOUR_USERNAME/thesupadevs.git`
3. **Install** dependencies: `pnpm install`
4. **Create** a feature branch: `git checkout -b feature/amazing-feature`
5. **Make** your changes
6. **Test** locally: `pnpm dev`
7. **Commit** your changes: `git commit -m 'Add amazing feature'`
8. **Push** to branch: `git push origin feature/amazing-feature`
9. **Open** a Pull Request

### Areas We Need Help With

- 🚀 **Performance optimizations**
- ♿ **Accessibility improvements**
- 📱 **Mobile responsiveness**
- 🧪 **Test coverage**
- 📚 **Documentation**
- 🎨 **UI/UX enhancements**
- 🔍 **Advanced search features**

**Read our [Contributing Guide](./CONTRIBUTING.md)** for detailed information.

### Contributors

Thanks to all our contributors! 🎉

<a href="https://github.com/drealdumore/thesupadevs/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=drealdumore/thesupadevs" />
</a>

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**TL;DR**: You can use, modify, and distribute this project freely. Just include the original license!

## 👨‍💻 Author

**Samuel Isah** ([@drealdumore](https://x.com/drealdumore))

## 🌟 Show Your Support

If this project helped you, please consider:

- ⭐ **Starring the repository**
- 🐛 **Reporting bugs** or suggesting features
- 🤝 **Contributing** to the codebase
- 📢 **Sharing** with other developers
- 💬 **Joining our community** discussions

---

**Built with ❤️ by the open source community**
