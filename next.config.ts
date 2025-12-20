import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: process.env.FTP_HOST || '192.168.8.10',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: process.env.FTP_HOST || '192.168.8.10',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Configure Turbopack to handle jspdf as client-only
  turbopack: {
    resolveAlias: {
      // jspdf should only be used in client components
      'jspdf': './node_modules/jspdf/dist/jspdf.es.min.js',
    },
  },
  // Fallback webpack config for non-turbopack builds
  webpack: (config, { isServer }) => {
    // Ensure jspdf is not bundled on the server
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('jspdf');
    }
    return config;
  },
};

export default nextConfig;
