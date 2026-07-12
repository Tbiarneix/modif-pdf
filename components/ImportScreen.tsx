'use client';

import { useRef, useState } from 'react';
import { useEditor } from '@/lib/store';
import { loadImage, loadPdf } from '@/lib/pdf';
import Button from './ui/Button';
import s from './ImportScreen.module.css';

export default function ImportScreen() {
  const loadResult = useEditor((st) => st.loadResult);
  const useDemo = useEditor((st) => st.useDemo);
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(list: FileList | null) {
    const f = list && list[0];
    if (!f) return;
    setBusy(true);
    try {
      if (f.type === 'application/pdf') {
        loadResult(await loadPdf(f));
      } else if (f.type && f.type.startsWith('image/')) {
        loadResult(await loadImage(f));
      } else {
        alert('Format non pris en charge. Choisissez un PDF ou une image.');
      }
    } catch (err) {
      console.warn(err);
      alert('Impossible de lire ce fichier.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={s.screen}>
      <div className={s.header}>
        <div className={s.logo}>
          <i className="fas fa-file-pen" aria-hidden="true" />
        </div>
        <div>
          <div className={s.title}>Éditeur de documents</div>
          <div className={s.subtitle}>Remplir · modifier · signer · exporter</div>
        </div>
      </div>

      <div
        className={`${s.drop} ${over ? s.dropOver : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          void handleFiles(e.dataTransfer.files);
        }}
      >
        <i className={`fas fa-cloud-arrow-up ${s.dropIcon}`} aria-hidden="true" />
        <div className={s.dropTitle}>Glissez un PDF ou une image ici</div>
        <div className={s.dropHint}>
          Le fichier reste sur votre appareil — rien n’est envoyé.
        </div>
        <div className={s.actions}>
          <Button
            variant="white"
            icon="fas fa-folder-open"
            onClick={() => inputRef.current?.click()}
          >
            Parcourir
          </Button>
          <Button variant="primary" icon="fas fa-file-lines" onClick={useDemo}>
            Ouvrir un exemple
          </Button>
        </div>
        {busy ? (
          <div className={s.loading}>
            <div className="pf-spin" aria-hidden="true" />
            Lecture du document…
          </div>
        ) : null}
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,image/*"
          hidden
          onChange={(e) => void handleFiles(e.target.files)}
        />
      </div>

      <div className={s.mentions}>
        <span>
          <i className="fas fa-check" aria-hidden="true" />
          Remplissage de formulaires
        </span>
        <span>
          <i className="fas fa-check" aria-hidden="true" />
          Signature &amp; tampon
        </span>
        <span>
          <i className="fas fa-check" aria-hidden="true" />
          Caviardage &amp; annotations
        </span>
      </div>
    </div>
  );
}
