/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow GitHub API images if needed
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
};

export default nextConfig;
