/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    styledComponents: true,
  },
  images: {
    domains: ['localhost'],
  },
  experimental: {
    appDir: true,
  },
  // This is important for path aliases to work in both JS and TS
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/*': './src/*',
    };
    return config;
  },
};

module.exports = nextConfig;
