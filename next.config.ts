import type { NextConfig } from "next";
const MiniCssExtractPlugin = require("mini-css-extract-plugin");


const nextConfig: NextConfig = {
  webpack(config, { isServer }) {
    config.plugins.push(new MiniCssExtractPlugin());
    // Add Webpack loader for workers
    config.module.rules.push({
      test: /stockfish\.js$/, // Regex to match the worker file
      use: { loader: 'worker-loader' },
    });

    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
        ],
      },
    ];
  },
};

export default nextConfig;
