/** @type {import('next').NextConfig} */
const nextConfig = {
  // Old addresses from before the admin was split into Sandwiches and Buffets sections
  async redirects() {
    return [
      { source: '/prices', destination: '/buffet-menu', permanent: true },
      { source: '/menu-builder', destination: '/buffet-menu', permanent: true },
      { source: '/menu', destination: '/buffet-menu', permanent: true },
      { source: '/summary', destination: '/buffet-prep', permanent: true },
      { source: '/sandwiches', destination: '/sandwich-menu', permanent: true },
    ];
  },
};

export default nextConfig;
