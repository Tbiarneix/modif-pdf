# Prompt à coller dans Claude Code

> Copie tout le bloc ci-dessous dans Claude Code, à la racine d'un dossier vide (ou de ton monorepo). Le fichier `README.md` de ce dossier de passation contient la spec détaillée : garde-le à côté et référence-le.

---

Construis une application web **Next.js (App Router, TypeScript)** d'édition de documents PDF, à exécuter entièrement **côté client** (aucun upload serveur). C'est la version production d'un prototype HTML que je te fournis dans `design_handoff_editeur_pdf/` — le fichier `Editeur PDF.dc.html` est la **référence visuelle et comportementale**, à recréer proprement en React/Next, pas à copier tel quel.

## Objectif produit
Un éditeur type Adobe pour agents de collectivité (produit Publidata, interface **en français**) qui permet de :
1. Importer un PDF (ou une image) par glisser-déposer, 100 % local.
2. **Remplir** des champs, **ajouter** du texte / images / signatures / coches / formes / annotations, **surligner**, **caviarder**.
3. **Modifier le texte existant** d'un PDF qui possède une couche texte (extraction via pdf.js, masque + réécriture par-dessus).
4. Gérer les pages (ajouter, supprimer, réorganiser par glisser-déposer).
5. Prévisualiser puis **exporter un vrai PDF** téléchargeable.

## Stack imposée
- **Next.js** (App Router) + **TypeScript** + **React 18**.
- Rendu & extraction PDF : **pdfjs-dist** (worker configuré). L'éditeur doit être un composant `"use client"` chargé en `dynamic(..., { ssr: false })`.
- Génération PDF de sortie : commence par **html2canvas + jsPDF** (aplatissement, identique au proto). Prévois une V2 avec **pdf-lib** pour écrire de vrais champs de formulaire natifs et du texte vectoriel (voir « Évolutions »).
- État : **Zustand** (ou useReducer + Context) — un store `editor` unique.
- Styling : reproduis le **design system Publidata** (tokens fournis dans le README). Utilise CSS Modules ou Tailwind avec les tokens en variables CSS. **Font Awesome 6** pour les icônes, police **Proxima Nova** (fallback Helvetica/Arial).
- Pas de backend requis pour la V1. Structure le code pour qu'un backend d'archivage/signature puisse s'ajouter ensuite.

## Architecture demandée
```
app/
  layout.tsx            // fonts, FA, providers
  page.tsx              // charge <Editor/> en dynamic ssr:false
components/
  Editor.tsx            // orchestrateur : import → éditeur → export
  ImportScreen.tsx
  Topbar.tsx
  ToolRail.tsx          // barre d'outils verticale gauche + tooltips
  Canvas.tsx            // pages scalées + couche overlay
  PageView.tsx          // 1 page : fond (raster/demo) + éléments
  ElementView.tsx       // rendu d'un élément selon son type + poignées
  PropertiesPanel.tsx   // panneau droit (propriétés selon sélection)
  DocumentPanel.tsx     // panneau droit quand rien n'est sélectionné (pages, champs détectés)
  PreviewModal.tsx
  ExportScreen.tsx
  SignaturePad.tsx
lib/
  store.ts              // Zustand : state + actions (voir README > État)
  pdf.ts                // loadPdf(): rasterisation + extraction texte -> éléments 'ptext'
  export.ts             // flatten (html2canvas) + assemblage jsPDF
  geometry.ts           // conversions coordonnées / zoom, resize, hit-testing
  tokens.ts             // design tokens Publidata
  types.ts              // types Element (union discriminée), Page, EditorState
```

## Modèle de données (à respecter)
- Page = `{ id, kind: 'demo' | 'image' | 'blank', src?, height }` ; largeur canonique **794 px** (A4 @96dpi), hauteur dérivée du ratio.
- Element = union discriminée sur `type` : `text | ptext | field | check | signature | image | redaction | highlight | shape | draw`. Champs communs `{ id, page, x, y, w, h, opacity? }`, coordonnées en **espace-page non zoomé**. Détails de chaque type dans le README.
- Les `ptext` (texte extrait du PDF) portent `orig` + `text` : tant que `text === orig` le texte est **transparent** (le raster d'origine reste visible) ; dès qu'il diffère on peint un **cache** (`mask`, blanc par défaut) sur la zone puis on affiche le nouveau texte. Bouton « Rétablir le texte d'origine ».

## Interactions clés (voir README pour le détail)
- Outils : sélection, texte, champ, coche, signature, image, dessin libre, surligner, forme (rect/ellipse/ligne), caviarder.
- Clic-pour-placer (texte, champ, coche, signature, image) ; glisser-pour-tracer (caviardage, surlignage, forme) ; tracé libre (dessin).
- Sélection : déplacer, redimensionner (8 poignées), clic simple sur texte/champ/ptext = édition inline, double-clic = édition.
- Undo/redo (snapshots), zoom, navigation pages, réorganisation des pages en **drag & drop**.
- Raccourcis : Échap (désélection), Suppr (supprimer), Cmd/Ctrl+Z / +Maj+Z.

## Export
- Aplatir chaque page (fond + overlays) en image, assembler en PDF au format de page d'origine, télécharger `NomFichier-modifie.pdf`. Aussi export PNG page 1.
- Écran d'export : aperçu aplati + statistiques (champs remplis, textes modifiés, éléments ajoutés, pages).

## Évolutions à prévoir (documente-les, n'implémente que si demandé)
1. **pdf-lib** : remplir les vrais champs AcroForm quand ils existent ; réécrire le texte en vectoriel plutôt qu'en image (meilleure qualité, texte sélectionnable).
2. **OCR** (tesseract.js) pour les PDF scannés sans couche texte.
3. **Signature électronique** conforme eIDAS (nécessite backend + prestataire).
4. Reflow du texte modifié (retour à la ligne), correspondance de police améliorée.
5. Persistance (brouillon local via IndexedDB) et intégration au dashboard Publidata.

## Qualité
- Accessibilité : cibles ≥ 40px, focus visibles, `aria-label` sur les boutons icônes.
- Performances : un PDF peut générer des centaines d'éléments `ptext` — virtualise ou limite le re-render (mémo par élément).
- Respecte scrupuleusement les **tokens et le ton FR** du design system Publidata (README).

Commence par : scaffolding Next.js + types + store + `ImportScreen` + `Canvas` avec le document d'exemple, puis les outils un par un. Montre-moi l'arborescence et le store avant d'implémenter les interactions.
