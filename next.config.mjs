/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Turbopack (défaut en Next 16) : pdfjs-dist importe `canvas` (Node only) de
  // façon optionnelle ; on l'alias vers un module vide pour le build navigateur.
  // Le chemin est relatif à la racine du projet.
  turbopack: {
    resolveAlias: {
      canvas: './lib/empty-module.js',
    },
  },

  // Fallback pour les builds `next build --webpack`.
  webpack: (config) => {
    config.resolve.alias = { ...config.resolve.alias, canvas: false };
    return config;
  },
};

export default nextConfig;
