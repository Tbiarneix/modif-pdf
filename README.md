# Handoff : Éditeur de documents PDF (Publidata)

## Overview
Application web d'édition de PDF « type Adobe » pour agents de collectivité (produit **Publidata**, interface **en français**). Elle permet d'importer un document, de le **remplir**, d'**ajouter** du contenu (texte, image, signature, coche, formes, annotations), de **surligner**, **caviarder**, **modifier le texte existant**, gérer les pages, puis **exporter un PDF** — le tout **100 % côté client** (aucun fichier envoyé).

## À propos des fichiers de design
Le fichier `Editeur PDF.dc.html` de ce dossier est une **référence de design créée en HTML** : un prototype fonctionnel montrant l'apparence et le comportement voulus, **pas du code de production à copier**. La tâche est de **recréer ce design dans une vraie app Next.js** (voir `PROMPT_CLAUDE_CODE.md`) avec des patterns propres (composants, store, types), en réutilisant les mêmes librairies (pdf.js, html2canvas, jsPDF) et en respectant le design system Publidata.

## Fidélité
**Haute fidélité (hifi).** Couleurs, typographie, espacements, glows et interactions sont définitifs. Recréer l'UI au pixel près avec les tokens ci-dessous.

---

## Écrans / Vues

### 1. Import
- **But** : charger un document. Glisser-déposer un **PDF** ou une **image**, bouton « Parcourir », bouton « Ouvrir un exemple » (charge un document de démo : attestation de domicile municipale).
- **Layout** : centré verticalement sur fond dégradé `#F3F5F7 → #E6EBEF`. En-tête = pastille bleue 44px (icône `fa-file-pen`) + titre « Éditeur de documents » + sous-titre « Remplir · modifier · signer · exporter ». Zone de dépôt = carte blanche 560px, bordure `2px dashed #BBC7D2`, radius 12px, glow `0 0 30px rgba(44,62,80,.1)`, padding 44px 40px, centrée : icône `fa-cloud-arrow-up` 38px bleue, titre, sous-titre gris, 2 boutons. Sous la carte : 3 mentions avec check vert.
- **Copie exacte** : « Glissez un PDF ou une image ici » · « Le fichier reste sur votre appareil — rien n'est envoyé. » · boutons « Parcourir » (variant white) et « Ouvrir un exemple » (variant primary). Mentions : « Remplissage de formulaires », « Signature & tampon », « Caviardage & annotations ».

### 2. Éditeur (écran principal — disposition type Adobe)
- **Topbar** (hauteur **60px**, fond blanc, glow bas) : pastille logo 30px → nom du fichier (tronqué, 260px max) + tag « Brouillon » (bleu, fond bleu 10%, radius 2px) → boutons undo/redo → *spacer* → sélecteur de page (`‹ 1 / N ›` dans un groupe gris radius 6px) → zoom (`− 82% +`) → bouton « Aperçu » (white) → bouton « Exporter » (primary).
- **Barre d'outils gauche** (largeur **64px**, fond blanc, bordure droite) : boutons carrés 44px, radius 8px. Actif = fond bleu + icône blanche + glow bleu (le caviardage actif est fond `#1C2527`). Groupes séparés par un filet `#E6EBEF` : `[Sélection]` · `[Texte, Champ, Coche, Signature, Image]` · `[Dessin, Surligner, Forme, Caviarder]`. Sous « Forme » sélectionnée, sous-menu 3 boutons (rectangle/ellipse/ligne). **Tooltip** sombre (`#2C3E50`) à droite au survol, avec petite flèche.
- **Canvas central** (flex:1, fond `#DCE3E9`, scroll, padding 34px 24px) : la page A4 (**794 px** de large) est centrée, mise à l'échelle via `transform: scale(zoom)`, glow `0 0 30px rgba(44,62,80,.22)`. Deux couches : fond (raster PDF / image / doc démo) + overlay des éléments (absolus).
- **Panneau droit** (largeur **296px**, fond blanc, bordure gauche, glow) : en-tête 48px (icône + « Propriétés » si sélection, sinon « Document »). Contenu = `PropertiesPanel` ou `DocumentPanel`.

### 3. Panneau propriétés (selon le type sélectionné)
Badge type en haut (fond bleu, blanc, uppercase). Contrôles réutilisables : lignes libellées (label uppercase 10.5px gris), inputs (h34, bordure `#D4DDE4`, radius 8, glow input), pastilles couleur 24px rondes (sélection = anneau bleu), boutons segmentés, sliders (accent bleu), boutons d'action. Par type :
- **Texte / Texte du PDF / Champ** : contenu (textarea) ; (champ) libellé si vide ; taille (slider 9–64) ; gras/italique ; alignement L/C/R ; couleur (palette) ; (ptext) « Cache (fond) » = couleur du masque + bouton « Rétablir le texte d'origine ».
- **Coche** : couleur.
- **Signature** : mode « Saisir » (nom en police manuscrite Dancing Script) / « Dessiner » (pad canvas + Effacer/Valider).
- **Image** : « Choisir une image » + opacité.
- **Surlignage** : couleur (jaune/vert/bleu/rose translucides).
- **Caviardage** : note explicative.
- **Forme** : forme rect/ellipse/ligne ; remplissage (avec « aucun ») ; contour ; épaisseur.
- **Dessin** : couleur ; épaisseur.
- Communs : Position & taille (X/Y/L/H), Avant/Arrière (ordre), Dupliquer, **Supprimer** (danger).

### 4. Panneau Document (aucune sélection)
Nom du fichier (input) · liste **Pages** (poignée `fa-grip-vertical`, vignette, « Page n », compteur d'éléments hors ptext, suppression) **réorganisables en glisser-déposer** (cible surlignée en bleu) · bouton « Ajouter une page » · si texte PDF détecté : encart bleu « Texte du PDF modifiable » (double-clic pour corriger, n blocs détectés / modifiés) · si doc démo : « Champs détectés » (liste avec statut rempli n/11) · astuce.

### 5. Aperçu (modale)
Scrim `rgba(44,62,80,.55)`, barre 58px (icône + « Aperçu — <nom> » + « Exporter » + fermer), pages rendues en lecture seule empilées à l'échelle ~0.62.

### 6. Export
Barre 60px (« Retour à l'édition » + « Exporter le document »). Corps : à gauche aperçu(s) aplati(s) (spinner « Aplatissement du document… » pendant génération) ; à droite carte « Document prêt » avec stats (Champs remplis, Textes modifiés, Éléments ajoutés, Pages) + **Télécharger le PDF** (primary) + **Télécharger en image (PNG)** + note sur le caviardage aplati.

---

## Interactions & comportement
- **Outils** : `select` (défaut). Clic-pour-placer : `text, field, check, signature, image` (créent un élément par défaut au point cliqué, repassent en select ; texte/champ entrent en édition). Glisser-pour-tracer : `redaction, highlight, shape`. Tracé libre : `draw` (collecte de points → polyline).
- **Sélection/manip** (outil select) : mousedown sur élément = début déplacement ; 8 poignées de redimensionnement ; clic simple sans déplacement sur `text/field/ptext` = édition inline ; double-clic = édition. Clic dans le vide = désélection.
- **Coordonnées** : stockées en espace-page non zoomé. Conversion via `rect = overlay.getBoundingClientRect()`, `x = (clientX - rect.left) / zoom`.
- **Édition inline** : textarea superposée, police/taille/couleur héritées ; ptext = fond opaque (masque) pendant l'édition.
- **Pages** : ajouter (page blanche), supprimer (min 1, réindexe les `page` des éléments), réorganiser en **drag & drop HTML5** (remap des index d'éléments et de la page active).
- **Undo/redo** : snapshots JSON de `{ elements, fieldValues }` (pile passé/futur, max ~60). Snapshot avant chaque mutation.
- **Zoom** 0.3–1.8 (pas 0.1) ; navigation pages ; raccourcis Échap / Suppr / Cmd-Ctrl+Z(+Maj).
- **Motion** : `all .2s/.3s ease`, pas de rebond. Loader = anneau bleu 3px qui tourne.

## Import & extraction texte (lib/pdf.ts)
1. `pdfjs-dist` : configurer `GlobalWorkerOptions.workerSrc`.
2. Pour chaque page : rendre à scale 2 sur un canvas → `toDataURL('image/jpeg', .85)` = fond raster. Hauteur page = `794 * (vpHeight/vpWidth)`.
3. Extraire le texte : `viewport scale 1`, facteur `S = 794 / vp1.width`, `vpS = getViewport({scale:S})`, `getTextContent()`. Pour chaque item non vide : `tx = pdfjsLib.Util.transform(vpS.transform, item.transform)` ; `fontH = hypot(tx[1],tx[3])` (ignorer <4 ou >240) ; `left = tx[4]`, `top = tx[5] - fontH` ; `w = max(item.width*S, len*fontH*0.28)`. Créer un élément `ptext { orig, text, x:left, y:top - fontH*0.12, w:w+2, h:fontH*1.28, fontSize:fontH*0.9, serif:/serif|times|.../.test(styles[fontName].fontFamily), bold:/bold|black|.../.test(fontName), color:'#1C2527', mask:'#ffffff' }`.
4. Image importée : `FileReader` → dataURL, hauteur via ratio naturel.

## Export (lib/export.ts)
- Rendre chaque page hors-écran à l'échelle 1 (fond + overlays lecture seule), `html2canvas(node, {scale:2, backgroundColor:'#fff'})` → JPEG.
- Assembler avec jsPDF (`unit:'px'`, format `[794, hauteurPage]`, `addPage` par page), `save('<nom>-modifie.pdf')`. PNG = dataURL page 1.

## État (lib/store.ts)
`{ screen:'import'|'editor'|'export', docName, pages[], activePage, zoom, tool, shapeKind, elements[], selectedId, editingId, draft, fieldValues, showPreview, exporting, exportPages[], dragPage, dragOverPage }`. Actions : setTool, createClick, startDrag/updateDraft/commitDraft, updateEl, move/resize, select, delete/duplicate, bringFront/sendBack, setField, movePage/addPage/deletePage, zoom, nav, openPreview, goExport, exportGenerate, undo/redo. Op de pointeur en dehors du store (ref) pour la fluidité.

---

## Design tokens (Publidata)
**Couleurs** — bleu primaire `#0075F1` (foncé `#0053B2`, clair `#7DA7D6`) ; gris-bleu `#2C3E50` (titres, tooltips), ramp `#23455F / #BBC7D2 / #E6EBEF / #CCD6DF / #F3F5F7` ; gris `#8E9299` ; bordure `#D4DDE4` ; succès `#22C55E` ; danger `#DC2626` ; warning `#F59E0B` ; info/violet `#8C00F1` ; fonds `#FFFFFF` / `#F3F5F7`, canvas `#DCE3E9` ; texte doc `#1C2527`. Surlignage : `#F7E463 / #8CE9A0 / #9FD0FF / #FFB3C1`.
**Typo** — Proxima Nova (fallback Helvetica/Arial). UI 15–16px, meta 14px, labels 10.5–12px, tags ≤12px. Titres légers (h1 42/100, h3 32/300, h2 22/500). Poids UI « bold » = **500**. Tracking titres −1px. Signature manuscrite = « Dancing Script ».
**Radii** — 4px (boutons/cartes), 8px (champs `.form-control`), 2px (tags), 16px (drawer), rond (boutons icônes, pastilles).
**Ombres (glow, pas directionnelles)** — repos `0 0 30px rgba(44,62,80,.10)` ; hover `.20` ; popover `.30` ; input `0 0 30px rgba(0,0,0,.10)` → focus `0 0 40px rgba(0,0,0,.15)` ; bouton coloré `0 0 20px rgba(hue,.30)` → `.50`. Cartes : lift `translateY(-2px)` au survol.
**Espacement** — base 4px, unité dominante 16px. Hauteurs de contrôle 24/30/**40**/50/60px.
**Motion** — `0.3s ease` (interactif), `0.2s` (liens), `0.4s` (topbar).

## Iconographie
**Font Awesome 6 Free** (CDN) en substitution de FA 7 Pro (le codebase Publidata utilise FA Pro — y brancher le kit licencié en prod). Glyphes utilisés : `fa-arrow-pointer, fa-font, fa-i-cursor, fa-check, fa-signature, fa-image, fa-pen, fa-highlighter, fa-marker, fa-shapes, fa-square/circle/minus, fa-cloud-arrow-up, fa-file-pen, fa-eye, fa-file-arrow-down, fa-rotate-left/right, fa-chevron-left/right, fa-plus/minus, fa-grip-vertical, fa-trash, fa-clone, fa-arrow-up/down, fa-bold, fa-italic, fa-align-*, fa-eraser, fa-upload, fa-file-pdf, fa-wand-magic-sparkles, fa-circle-check`. Cases à cocher du doc = glyphes FA (`far fa-square` / `fas fa-square-check`), pas de contrôles natifs.

## Composants du design system à réutiliser
`Button` (variants primary/white/…, prop `icon`, tailles), `IconButton`, `Input`, `Select`, `Tag`, `Card`, `Toggle`, `Checkbox`, `Alert`, `Loader`, `Tabs`, `Sidebar`. Recréer leur style à partir des tokens ci-dessus (ne pas réinventer d'autres couleurs).

## Assets
- Icônes : Font Awesome 6 Free (CDN).
- Police signature : Google Font « Dancing Script ».
- Aucun asset binaire requis ; le doc de démo est dessiné en HTML/CSS.
- Logo Publidata et police Proxima Nova : à prendre dans le codebase/DS Publidata pour la prod.

## Librairies (versions du prototype)
- pdf.js `3.11.174` (→ `pdfjs-dist` en npm), worker à configurer.
- html2canvas `1.4.1`.
- jsPDF `2.5.1` (`window.jspdf.jsPDF`).

## Fichiers de référence
- `Editeur PDF.dc.html` — le prototype complet (import, éditeur 3 panneaux, propriétés, aperçu, export, extraction/édition du texte PDF). L'ouvrir dans un navigateur pour voir tous les comportements.
- `PROMPT_CLAUDE_CODE.md` — prompt à coller dans Claude Code pour lancer l'implémentation Next.js.
