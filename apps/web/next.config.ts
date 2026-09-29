import type { NextConfig } from 'next';

// Spec 16: basic hardening. Pages cannot be framed (clickjacking) and do not leak full URLs to other sites.
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(self), geolocation=(self), microphone=()' },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Lets phones on the local network use the dev server (IP changes between networks).
  allowedDevOrigins: ['192.168.*.*', '10.*.*.*', '172.*.*.*'],
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  experimental: {
    // ID upload sends two photos of up to 5 MB each (API setting verification.max_image_bytes).
    // The proxy buffers request bodies too, so both limits must fit the upload.
    serverActions: { bodySizeLimit: '11mb' },
    proxyClientMaxBodySize: '11mb',
  },
};

export default nextConfig;
