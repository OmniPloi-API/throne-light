/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.TAURI_BUILD === 'true' ? 'export' : undefined,
  images: {
    unoptimized: process.env.TAURI_BUILD === 'true',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
