import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    // ID upload sends two photos of up to 5 MB each (API setting verification.max_image_bytes).
    // The proxy buffers request bodies too, so both limits must fit the upload.
    serverActions: { bodySizeLimit: '11mb' },
    proxyClientMaxBodySize: '11mb',
  },
};

export default nextConfig;
