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
  // Désactiver les vérifications ESLint lors du build
  eslint: {
    // Avertissement au lieu d'erreur (true = erreurs ignorées)
    ignoreDuringBuilds: true,
  },
  // Désactiver les vérifications TypeScript lors du build
  typescript: {
    // Avertissement au lieu d'erreur (true = erreurs ignorées)
    ignoreBuildErrors: true,
  },
  // Autres configurations si nécessaires
};

module.exports = nextConfig;
