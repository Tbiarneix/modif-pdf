'use client';

import dynamic from 'next/dynamic';

// L'éditeur touche à window/document (pdf.js, html2canvas, jsPDF) → aucun SSR.
const Editor = dynamic(() => import('@/components/Editor'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--pd-mist)',
      }}
    >
      <div className="pf-spin" aria-label="Chargement de l’éditeur" />
    </div>
  ),
});

export default function Home() {
  return <Editor />;
}
