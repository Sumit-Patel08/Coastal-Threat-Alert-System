/** @type {import('next').NextConfig} */
const config = {
  images: {
    unoptimized: true,
  },
  // Update from experimental.turbo to turbopack
  turbopack: {
    enabled: true
  }
}

export default config
