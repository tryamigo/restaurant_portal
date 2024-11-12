/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: '**', // Allow all hostnames
            port: '', // No specific port
          },
          {
            protocol: 'http',
            hostname: '**', // Allow all hostnames
            port: '', // No specific port
          },
        ],
      },
};

export default nextConfig;
