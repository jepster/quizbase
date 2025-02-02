import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/fishingquiz.de',
        has: [
          {
            type: 'host',
            value: 'fishingquiz.de',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
