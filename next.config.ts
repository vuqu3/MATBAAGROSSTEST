import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google-analytics.com https://www.googletagmanager.com https://accounts.google.com https://apis.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https: http:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://www.matbaagross.com https://fabrika.matbaagross.com https://accounts.google.com https://www.google-analytics.com",
      "frame-src 'self' https: data:",
      "frame-ancestors 'self'",
      "form-action 'self' https://accounts.google.com",
      "base-uri 'self'",
      "object-src 'none'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  allowedDevOrigins: ['www.matbaagross.com', 'matbaagross.com', 'fabrika.matbaagross.com'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'fabrika.matbaagross.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.matbaagross.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'matbaagross.com',
        port: '',
        pathname: '/**',
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;
