/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['xlsx'],
    instrumentationHook: true
  }
};

export default nextConfig;

