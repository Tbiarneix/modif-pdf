# Éditeur de documents PDF

Éditeur de PDF « type Adobe » pour agents de collectivité, **100 % côté client** :
aucun fichier n'est envoyé sur un serveur, tout se passe dans le navigateur.

Importer un PDF (ou une image), le **remplir**, y **ajouter** du contenu (texte,
image, signature, coche, formes, annotations), **surligner**, **caviarder**,
**modifier le texte existant**, gérer les pages, puis **exporter un PDF**.

## Fonctionnalités

- **Import local** — glisser-déposer d'un PDF ou d'une image, ou document d'exemple. Le fichier ne quitte jamais l'appareil.
- **Édition** — texte libre, champs à remplir, coches, signatures (saisie stylisée ou tracé manuscrit), images/logos, dessin libre, formes (rectangle / ellipse / ligne), surlignage, caviardage.
- **Modification du texte du PDF** — la couche texte est extraite via pdf.js ; chaque bloc reste transparent tant qu'il n'est pas modifié, puis un cache est peint et le nouveau texte réécrit par-dessus (« Rétablir le texte d'origine » disponible).
- **Gestion des pages** — ajout, suppression, réorganisation par glisser-déposer.
- **Aperçu & export** — aperçu en lecture seule, puis export d'un vrai PDF téléchargeable (aplatissement) ou d'un PNG de la première page.
- **Undo/redo, zoom, raccourcis clavier** (Échap, Suppr, Cmd/Ctrl+Z / +Maj+Z).

## Stack

- [Next.js 16](https://nextjs.org/) (App Router, Turbopack) + React 19 + TypeScript
- [pdfjs-dist](https://github.com/mozilla/pdf.js) — rendu et extraction de la couche texte
- [html2canvas](https://html2canvas.hertzen.com/) + [jsPDF](https://github.com/parallax/jsPDF) — aplatissement et génération du PDF de sortie
- [Zustand](https://github.com/pmndrs/zustand) — store unique de l'éditeur
- CSS Modules + variables CSS pour les tokens du design system Publidata
- Font Awesome 6 (icônes) et Dancing Script (signatures)

L'éditeur est un composant client monté via `dynamic(..., { ssr: false })` car il
dépend de `window`/`document` (pdf.js, html2canvas, jsPDF).

## Démarrage

Prérequis : Node.js 18.18+ (recommandé : 20+).

```bash
npm install      # installe les deps + copie le worker pdf.js dans public/ (postinstall)
npm run dev      # http://localhost:3000
```

Autres scripts :

```bash
npm run build    # build de production (Turbopack)
npm run start    # sert le build de production
npm run lint     # ESLint (flat config)
```

Le worker pdf.js est copié depuis `node_modules` vers `public/pdf.worker.min.js`
au `postinstall` (voir `scripts/copy-pdf-worker.mjs`) et servi en statique — fiable
et hors-ligne. Le fichier est régénéré à chaque install ; il n'est pas versionné.

## Structure

```
app/
  layout.tsx            # fonts (Font Awesome, Dancing Script), globals
  page.tsx              # charge <Editor/> en dynamic ssr:false
  globals.css           # reset + tokens Publidata (variables CSS)
components/
  Editor.tsx            # orchestrateur : routing d'écran + raccourcis clavier
  ImportScreen.tsx      # écran d'import (drag & drop, exemple)
  Topbar.tsx            # barre du haut (undo/redo, pages, zoom, aperçu, export)
  ToolRail.tsx          # barre d'outils verticale + tooltips
  Canvas.tsx            # page mise à l'échelle + couche d'édition (placer/tracer/déplacer/redimensionner)
  ElementView.tsx       # rendu d'un élément selon son type (+ poignées, édition inline)
  DemoDocument.tsx      # document d'exemple (attestation) dessiné en HTML/CSS
  PageBackground.tsx    # fond de page (raster / image / démo) + rendu du brouillon
  RightPanel.tsx        # panneau droit : Propriétés ou Document
  PropertiesPanel.tsx   # contrôles selon l'élément sélectionné
  DocumentPanel.tsx     # pages (drag & drop), champs détectés, texte PDF
  SignaturePad.tsx      # pad de signature manuscrite
  PreviewModal.tsx      # aperçu lecture seule
  ExportScreen.tsx      # aplatissement + stats + téléchargement PDF/PNG
  ReadOnlyPage.tsx      # rendu d'une page en lecture seule (aperçu/export)
  ui/                   # primitives du design system (Button, Input, Slider, …)
lib/
  types.ts              # modèle de données (union discriminée Element, Page, …)
  store.ts              # store Zustand : état + actions + historique undo/redo
  pdf.ts                # import PDF/image + extraction de la couche texte
  export.ts             # aplatissement html2canvas + assemblage jsPDF
  geometry.ts           # conversions de coordonnées, redimensionnement
  tokens.ts             # constantes de design (palettes, PAGE_W, helper rgba)
scripts/
  copy-pdf-worker.mjs   # copie le worker pdf.js dans public/ (postinstall)
docs/
  ROADMAP.md            # évolutions prévues (pdf-lib, OCR, eIDAS, …)
```

Les coordonnées des éléments sont stockées en **espace-page non zoomé** (px) ; la
largeur canonique d'une page est **794 px** (A4 @96dpi), la hauteur dérivant du ratio.

## Modèle de données

Un document est une liste de `Page` (fond `demo` / `image` / `blank`) et une liste
d'`Element` (union discriminée sur `type` : `text`, `ptext`, `field`, `check`,
`signature`, `image`, `redaction`, `highlight`, `shape`, `draw`). L'état complet
(`{ pages, elements, fieldValues, … }`) vit dans le store Zustand, avec un historique
undo/redo par snapshots.

## Export

Chaque page est rendue hors-écran à l'échelle 1 (fond + éléments en lecture seule),
capturée en image via html2canvas, puis assemblée en PDF au format de chaque page
avec jsPDF. Le PDF est téléchargé sous le nom `<fichier>-modifie.pdf`. Les zones
caviardées sont aplaties et non récupérables.

## Roadmap

Voir [docs/ROADMAP.md](docs/ROADMAP.md) : export vectoriel et champs AcroForm
natifs (pdf-lib), OCR des PDF scannés (tesseract.js), signature électronique eIDAS,
reflow du texte modifié, persistance locale (IndexedDB) et intégration au dashboard
Publidata.

## Notes de production

Certains assets sont des placeholders à remplacer par ceux du design system Publidata :

- **Proxima Nova** (police UI) — fallback actuel : Helvetica/Arial.
- **Font Awesome Pro** — actuellement FA 6 Free via CDN.
- **Logo Publidata**.
