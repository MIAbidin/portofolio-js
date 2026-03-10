/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['pdfkit', 'pptxgenjs'],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  webpack: (config, { isServer }) => {
    if (isServer) {
      // Prevent webpack from bundling pdfkit — let Node.js require() handle it
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : [config.externals].filter(Boolean)),
        'pdfkit',
        'pptxgenjs',
      ];
    }
    return config;
  },
};

export default nextConfig;
