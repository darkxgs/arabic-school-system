/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure runtime is set to edge for Vercel
  runtime: 'edge',
  
  // Add experimental features if needed
  experimental: {
    serverComponentsExternalPackages: [],
  },
  
  // Disable image optimization on Vercel for faster builds if not needed
  images: {
    unoptimized: process.env.NODE_ENV === 'production',
  },
  
  // Add any necessary environment variables that should be accessible to the browser
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  
  // Adjust webpack config if needed
  webpack: (config, { isServer }) => {
    // Add custom webpack config here if needed
    return config
  },

  // Set to true for improved ISR
  staticPageGenerationTimeout: 120,
}

module.exports = nextConfig 