# TheSupaDevs - Curated Developer Resources

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Open Source](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://opensource.org/)
[![Made with Next.js](https://img.shields.io/badge/Made%20with-Next.js%2015-000000?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)

A sleek, modern **open-source** web application where developers can discover and share 1000+ curated resources. Built with enterprise-level SEO optimization, AI-powered categorization, real-time performance monitoring, and buttery smooth animations.

🌐 **Live Demo**: [thesupadevs.vercel.app](https://thesupadevs.vercel.app)  
🤝 **Contributing**: [See CONTRIBUTING.md](./CONTRIBUTING.md)  
📊 **Performance**: Core Web Vitals optimized with real-time monitoring

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
- **Intelligent Metadata Scraping**:
  - Custom Cheerio + Axios scraper with comprehensive error handling
  - Multi-source fallback: OG image → Twitter image → First page image → Favicon → Placeholder
  - Automatic retry logic and timeout handling (10s timeout)
  - In-memory caching to prevent duplicate requests
  - User-friendly error messages for different failure scenarios
- **Modal Interface**: Quick resource submission without page navigation
- **Draft Auto-Save**: Form data automatically saved to localStorage
- **Image Previews**: Live preview of scraped images before submission
- **Tag System**: Multi-tag support with visual badges and search integration

### 🔧 **Admin Dashboard**

- **Secure Authentication**: Supabase auth with session management and protected routes
- **Resource Management**:
  - Approve/reject pending submissions with one-click actions
  - Edit resource details inline (name, description, URL, category, subcategory, tags, image)
  - Re-scrape images for existing resources with live preview
  - Bulk operations (approve, reject, delete) with multi-select checkboxes
  - Resource selection with "Select All" and "Clear Selection" options
- **Advanced Filtering & Search**:
  - Filter by status (all, pending, approved, broken URLs)
  - Real-time search across name, description, URL, and tags
  - Category-based filtering with resource counts
  - Sort by name, date, category, or status (ascending/descending)
  - Pagination with configurable page sizes
- **Broken URL Detection**: Batch check URLs to identify broken links with detailed error reporting
- **Category Management**:
  - Add/delete categories with validation
  - Add/delete subcategories with category relationships
  - Organize resources hierarchically
  - View category statistics and resource distribution
- **AI-Powered Categorization**:
  - Batch processing (50 resources at a time) using Groq AI
  - Llama 3.1 8B Instant model for intelligent suggestions
  - Review and apply suggestions selectively or in bulk
  - Progress tracking across batches with detailed logging
  - Confidence scoring for AI suggestions (high/medium/error)
  - Category-subcategory mapping with intelligent recommendations
- **Analytics Dashboard**:
  - Total resource counts with real-time updates
  - Status breakdown (approved/pending/broken) with percentages
  - Category distribution with visual progress bars
  - Performance metrics and insights
- **Resource Details Modal**: View complete resource information with edit capabilities
- **Loading States**: Progressive loading with stage indicators and skeleton screens

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

- **Real-time Performance Monitoring**:
  - Core Web Vitals tracking (CLS, INP, FCP, LCP, TTFB)
  - Navigation timing analysis
  - Performance observer for resource loading
  - Console logging for development insights
- **Advanced Caching Strategy**:
  - ISR (Incremental Static Regeneration) with 5-minute revalidation
  - unstable_cache for database queries with tagged invalidation
  - In-memory caching for metadata scraping
  - Browser caching with optimized headers (1 year for static assets)
- **Image Optimization**:
  - Next.js Image component with WebP and AVIF format support
  - Responsive image sizes (16px to 3840px)
  - Lazy loading with blur placeholders
  - Remote pattern support for any hostname
  - Minimum cache TTL of 1 year
- **Font Optimization**:
  - Local Work Sans font with variable weights (100-900)
  - Font preloading with crossorigin attribute
  - Font display swap for better performance
  - Fallback fonts (system-ui, arial) for instant rendering
- **Build Optimization**:
  - Turbopack for 10x faster development builds
  - Package import optimization for key libraries (Lenis, Lucide, Framer Motion, Radix UI)
  - Webpack build workers for parallel processing
  - Bundle analysis with @next/bundle-analyzer
  - Console removal in production builds
  - Compression enabled for all responses
- **Code Splitting & Loading**:
  - Automatic route-based code splitting
  - Dynamic imports for heavy components
  - Skeleton loading states with context-aware sizing
  - Progressive loading with stage indicators

### 🔐 **Security & Best Practices**

- **Comprehensive Security Headers**:
  - Content Security Policy (CSP) with strict directives
  - X-Frame-Options: DENY to prevent clickjacking
  - X-XSS-Protection with mode=block
  - X-Content-Type-Options: nosniff
  - Referrer-Policy: strict-origin-when-cross-origin
  - Permissions-Policy for camera, microphone, geolocation
- **Database Security**:
  - Row Level Security (RLS) policies for all tables
  - Authenticated user policies for resource management
  - Public read access only for approved resources
  - Secure Supabase client configuration
- **Input Validation & Sanitization**:
  - Zod schema validation for all forms
  - URL validation and normalization
  - XSS protection through proper escaping
  - Type safety with TypeScript strict mode
- **Environment Security**:
  - Secure credential management with environment variables
  - No sensitive data in client-side code
  - API key protection for Groq AI integration
- **Build Security**:
  - TypeScript strict mode with no build errors allowed
  - ESLint enforcement during builds
  - Dependency vulnerability scanning

## 🛠 Tech Stack

### **Frontend**

- **Framework**: Next.js 15 (App Router) with Turbopack for fast development
- **Language**: TypeScript with strict type checking
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: shadcn/ui (New York style) with Radix UI primitives
- **Animations**: Framer Motion with optimized performance + Lenis smooth scrolling
- **Icons**: Lucide React with tree-shaking optimization

### **Backend & Database**

- **Database**: Supabase (PostgreSQL) with Row Level Security (RLS)
- **Authentication**: Supabase Auth with session management
- **Real-time**: Supabase real-time subscriptions
- **Caching**: Next.js ISR with unstable_cache for 5-minute revalidation

### **AI & Automation**

- **AI Categorization**: Groq SDK with Llama 3.1 8B Instant model
- **Metadata Scraping**:
  - **Primary**: Custom Cheerio + Axios scraper with intelligent fallbacks
  - **Multi-source**: OG image → Twitter image → First img → Favicon → Placeholder
  - **Caching**: In-memory cache to prevent duplicate requests
  - **Error Handling**: Comprehensive error messages and retry logic

### **Performance & SEO**

- **Performance Monitoring**: Web Vitals (CLS, INP, FCP, LCP, TTFB) with real-time tracking
- **Bundle Analysis**: @next/bundle-analyzer for optimization insights
- **Image Optimization**: Next.js Image with WebP/AVIF support and responsive sizing
- **Font Optimization**: Local Work Sans font with variable weights (100-900)
- **SEO**: Dynamic metadata, sitemap, robots.txt, Open Graph, Twitter Cards
- **PWA**: Progressive Web App ready with manifest.json

### **Form & Validation**

- **Forms**: React Hook Form with optimized re-renders
- **Validation**: Zod schemas with TypeScript integration
- **Notifications**: Sonner for toast notifications
- **Modals**: Vaul drawer for mobile-optimized modals

### **Development & Build**

- **Package Manager**: pnpm for fast, efficient installs
- **Linting**: ESLint with Next.js config
- **Build Optimization**:
  - Package import optimization for key libraries
  - Webpack build workers for faster builds
  - Console removal in production
  - Compression and security headers

### **Security**

- **Content Security Policy**: Comprehensive CSP headers
- **Security Headers**: X-Frame-Options, X-XSS-Protection, etc.
- **Row Level Security**: Supabase RLS policies for data protection
- **Input Sanitization**: Zod validation and type safety

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
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # AI Categorization (Optional - for admin features)
   GROQ_API_KEY=your_groq_api_key
   ```

   **Note**: The Groq API key is optional and only needed for AI-powered categorization in the admin dashboard.

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
│   │   ├── admin/                    # Admin dashboard with authentication
│   │   │   └── page.tsx              # Main admin interface
│   │   ├── api/
│   │   │   ├── categorize/           # AI categorization endpoint
│   │   │   │   └── route.ts          # Groq AI integration
│   │   │   └── scrape-metadata/      # Metadata scraping API
│   │   │       └── route.ts          # Cheerio + Axios scraper
│   │   ├── category/[slug]/          # Dynamic category pages
│   │   ├── ClientBody.tsx            # Client-side body wrapper
│   │   ├── HomePageClient.tsx        # Main homepage component
│   │   ├── layout.tsx                # Root layout with SEO & fonts
│   │   ├── loading.tsx               # Custom loading animation
│   │   ├── page.tsx                  # Homepage with ISR
│   │   ├── sitemap.ts                # Dynamic sitemap generation
│   │   ├── globals.css               # Global styles & animations
│   │   ├── opengraph-image.png       # Social media image
│   │   └── favicon.ico               # Site favicon
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   │   ├── button.tsx            # Customized button component
│   │   │   ├── dialog.tsx            # Modal dialogs
│   │   │   ├── input.tsx             # Form inputs
│   │   │   └── ...                   # Other UI primitives
│   │   ├── admin/                    # Admin-specific components
│   │   │   ├── AdminHeader.tsx       # Admin navigation
│   │   │   ├── BulkCategorizationModal.tsx  # AI categorization UI
│   │   │   ├── FilterControls.tsx    # Advanced filtering
│   │   │   ├── LoadingScreen.tsx     # Admin loading states
│   │   │   ├── LoginForm.tsx         # Authentication form
│   │   │   └── ResourceCard.tsx      # Admin resource cards
│   │   ├── home/                     # Homepage components
│   │   │   ├── HeroSection.tsx       # Hero with CTA
│   │   │   ├── SearchBar.tsx         # Search functionality
│   │   │   ├── CategoryFilters.tsx   # Category navigation
│   │   │   ├── RecentlyAdded.tsx     # Recent resources
│   │   │   └── FooterCTA.tsx         # Footer call-to-action
│   │   ├── add-resource-modal.tsx    # Resource submission modal
│   │   ├── category-filter.tsx       # Category filtering
│   │   ├── header.tsx                # Site header
│   │   ├── performance-monitor.tsx   # Web Vitals tracking
│   │   ├── resource-card.tsx         # Resource display card
│   │   ├── smooth-scroll.tsx         # Lenis scroll integration
│   │   └── theme-provider.tsx        # Dark theme provider
│   └── lib/
│       ├── supabase/                 # Database clients
│       │   ├── client.ts             # Client-side Supabase
│       │   └── server.ts             # Server-side Supabase
│       ├── types/                    # TypeScript definitions
│       │   └── database.ts           # Database type definitions
│       ├── cache.ts                  # ISR caching utilities
│       └── utils.ts                  # Utility functions
├── public/
│   ├── fonts/                        # Local font files
│   │   └── Work Sans.woff2           # Variable font
│   ├── robots.txt                    # SEO robots file
│   ├── manifest.json                 # PWA manifest
│   └── opengraph-image.png           # Social media image
├── .github/                          # GitHub templates & workflows
├── .env.local                        # Environment variables (local)
├── components.json                   # shadcn/ui configuration
├── next.config.js                    # Next.js configuration
├── tailwind.config.ts                # Tailwind CSS config
├── tsconfig.json                     # TypeScript configuration
├── package.json                      # Dependencies & scripts
├── CONTRIBUTING.md                   # Contribution guidelines
└── README.md                         # Project documentation
```

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Environment Variables

```env
# Required - Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional - AI Categorization (Admin features)
GROQ_API_KEY=your_groq_api_key
```

**Getting API Keys:**

- **Supabase**: Create a project at [supabase.com](https://supabase.com) and get your URL and anon key from Settings > API
- **Groq** (Optional): Get a free API key at [console.groq.com](https://console.groq.com) for AI categorization features

## 📝 Available Scripts

### Development

- `pnpm dev` - Development server with Turbopack (10x faster builds)
- `pnpm dev:no-turbo` - Development server without Turbopack
- `pnpm build` - Production build with optimizations
- `pnpm start` - Production server
- `pnpm lint` - ESLint check with Next.js config

### Performance & Analysis

- `pnpm analyze` - Bundle size analysis with @next/bundle-analyzer
- `pnpm lighthouse:simple` - Basic Lighthouse audit
- `pnpm lighthouse:desktop` - Desktop-optimized Lighthouse audit
- `pnpm perf` - Build and start for performance testing
- `pnpm optimize` - Run performance optimization scripts
- `pnpm perf:test` - Performance testing suite

### Deployment

- Automatic deployment on Vercel via GitHub integration
- Environment variables configured in Vercel dashboard
- Preview deployments for pull requests

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
