/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Strict Mode
  reactStrictMode: true,

  // TypeScript configuration
  typescript: {
    // Disable type checking during build if needed (enable for production)
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    // Enable linting during production builds
    ignoreDuringBuilds: false,
  },

  // Image optimization
  images: {
    // Add your Supabase domain for image optimization
    domains: [
      'your-supabase-project.supabase.co',
      'your-supabase-project.supabase.in',
    ],
  },

  // Experimental features
  experimental: {
    // Server actions configuration
    serverActions: {
      bodySizeLimit: '2mb',
      allowedOrigins: [
        'localhost:3000',
        'coastal-threat.vercel.app',
        'coastal-threat-git-main-neel-2606.vercel.app',
      ],
    },
    // Optimize package imports
    optimizePackageImports: ['@radix-ui/react-icons'],
  },
  
  // Turbopack configuration (moved from experimental.turbo)
  turbopack: {
    resolveAlias: {
      // Fix for Windows OneDrive path issues
      '@': './src',
    },
  },

  // Disable file system cache to avoid OneDrive sync issues
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // Webpack configuration
  webpack: (config, { isServer, dev }) => {
    // Fix for Windows path handling
    if (isServer) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: ['**/.next/**', '**/node_modules/**', '**/.git/**'],
      };
    }

    // Add fallbacks for Node.js built-ins if needed
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      dns: false,
      child_process: false,
    };

    return config;
  },
};

// Check if we're running in development mode
const isDev = process.env.NODE_ENV === 'development';

// Enable source maps in development
if (isDev) {
  nextConfig.productionBrowserSourceMaps = false;
}

// Enable bundle analyzer in development
if (process.env.ANALYZE === 'true') {
  const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
  });
  module.exports = withBundleAnalyzer(nextConfig);
} else {
  module.exports = nextConfig;
}
