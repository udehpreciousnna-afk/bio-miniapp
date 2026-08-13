/** @type {import('next').NextConfig} */
module.exports = {
  env: {
    // Your Render backend's  URL, e.g. https://bio-mining-api.onrender.com
    NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE || '',
  },
}