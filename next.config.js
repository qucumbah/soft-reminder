/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
};

const withPWA = require("next-pwa")({
  dest: "public",
  reloadOnOnline: false,
  // disable: process.env.NODE_ENV === "development",
});

module.exports = withPWA(nextConfig);
