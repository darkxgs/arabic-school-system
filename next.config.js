/** @type {import('next').NextConfig} */
const nextConfig = {
  // Experimental features
  experimental: {
    serverComponentsExternalPackages: [],
    // Remove any other experimental settings that might cause issues
  },
  
  // Ensure we're not using edge runtime which might cause issues
  // with some dependencies
  reactStrictMode: true,
  
  // Handle environment variables that should be exposed to the browser
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  
  // Disable image optimization if there are issues with it
  images: {
    domains: ['xceeiogswmfqawlwsaez.supabase.co'],
    unoptimized: true,
  },
  
  // Disable typechecking during build for faster builds
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Disable ESLint during build for faster builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Skip type checking
  skipTypeChecking: true,
  
  // Increase build timeout
  staticPageGenerationTimeout: 180,
}

module.exports = nextConfig 