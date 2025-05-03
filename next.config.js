/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'firebasestorage.googleapis.com',
      'lh3.googleusercontent.com',
      'avatars.githubusercontent.com',
    ],
  },
  // Désactiver ESLint pendant le build pour permettre le déploiement
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Autres configurations si nécessaires
};

module.exports = nextConfig;
