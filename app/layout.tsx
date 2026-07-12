import type { Metadata } from 'next';
import './globals.css';
import './fonts.css';

export const metadata: Metadata = {
  title: 'Éditeur de documents — Publidata',
  description: 'Remplir · modifier · signer · exporter vos PDF, 100 % dans votre navigateur.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        {/*
          Font Awesome 6 Free (CDN) — substitue le kit FA Pro licencié de Publidata.
          En production, remplacer par le kit Pro du DS Publidata (mêmes classes fa-*).
        */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
        />
        {/* Dancing Script : signatures « Saisir ». Kalam : titre de marque
            brimborion sur l'écran d'accueil. (CDN, comme le kit FA.) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600&family=Kalam:wght@700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
