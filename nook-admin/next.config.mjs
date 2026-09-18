/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prices and the menu builder now live on the Menu page
  async redirects() {
    return [
      { source: '/prices', destination: '/menu', permanent: true },
      { source: '/menu-builder', destination: '/menu', permanent: true },
    ];
  },
};

export default nextConfig;
