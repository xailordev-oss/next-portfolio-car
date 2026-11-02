import type { NextConfig } from "next";

// Set by the GitHub Pages workflow, e.g. "/next-portfolio-car". Empty locally.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  // Static HTML export so the site can be hosted on GitHub Pages.
  output: "export",
  basePath,
  images: { unoptimized: true },
  trailingSlash: true,
  experimental: {
    agentFeedback: true,
  },
  // cacheComponents / partialPrefetching (PPR) are not allowed with output: "export".
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
