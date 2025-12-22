const nextConfig = {
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,

  experimental: {
    // ppr: true, // Disabled - only available in canary versions
    inlineCss: true,
    // reactCompiler: true, // Disabled - requires babel-plugin-react-compiler
    optimizePackageImports: ["lenis", "lucide-react", "framer-motion"],
  },

  // Build configuration - KEEP THESE FALSE FOR PRODUCTION SAFETY
  typescript: {
    ignoreBuildErrors: false, // Changed to false for safety
  },
  eslint: {
    ignoreDuringBuilds: false, // Changed to false for safety
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  images: {
    // Enhanced image optimization
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year cache
    // Allow images from any hostname (use with caution in production)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },

  // Analytics integration
  async rewrites() {
    return [
      {
        source: "/insights/vitals.js",
        destination:
          "https://cdn.vercel-insights.com/v1/speed-insights/script.js",
      },
      {
        source: "/insights/events.js",
        destination: "https://cdn.vercel-insights.com/v1/script.js",
      },
      {
        source: "/hfi/events/:slug*",
        destination:
          "https://vitals.vercel-insights.com/v1/:slug*?dsn=KD0ni5HQVdxsHAF2tqBECObqH",
      },
      {
        source: "/hfi/vitals",
        destination:
          "https://vitals.vercel-insights.com/v2/vitals?dsn=fsGnK5U2NRPzYx0Gch0g5w5PxT1",
      },
    ];
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },

  // Security and caching headers
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        {
          key: "X-Content-Type-Options",
          value: "nosniff",
        },
        {
          key: "X-Frame-Options",
          value: "DENY",
        },
        {
          key: "X-XSS-Protection",
          value: "1; mode=block",
        },
        {
          key: "Referrer-Policy",
          value: "strict-origin-when-cross-origin",
        },
        {
          key: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=()",
        },
        {
          key: "Content-Security-Policy",
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.vercel-insights.com https://vitals.vercel-insights.com https://checkout.squadco.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: https: blob:",
            "connect-src 'self' https://vitals.vercel-insights.com https://nuladubutkyferivuniu.supabase.co",
            "frame-src 'self' https://checkout.squadco.com",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
          ].join("; "),
        },
      ],
    },
    {
      source: "/(.*)\\.(js|css|woff2?|png|jpe?g|gif|svg|ico|webp|avif)",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
  ],
};

export default nextConfig;
