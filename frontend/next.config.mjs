const internalBackend = process.env.INTERNAL_BACKEND_URL || 'http://backend:8080';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/v2/:path*',
        destination: `${internalBackend}/api/v2/:path*`,
      },
    ];
  },
};

export default nextConfig;
