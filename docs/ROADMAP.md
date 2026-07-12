# Évolutions prévues

La V1 est 100 % côté client et aplatit le document en image à l'export (fidèle au
prototype). Les pistes ci-dessous sont documentées mais **non implémentées** — le store
et `lib/export.ts` sont structurés pour les accueillir sans refonte.

## 1. Export vectoriel & champs natifs (pdf-lib)
- Remplir les vrais champs **AcroForm** quand le PDF importé en contient (au lieu de peindre du texte par-dessus le raster).
- Réécrire le texte modifié (`text`, `ptext`) en **texte vectoriel** plutôt qu'en image : meilleure qualité, texte sélectionnable/recherchable, poids de fichier réduit.
- Point d'entrée : une variante de `buildPdf()` qui reçoit `pages` + `elements` et écrit chaque élément avec `pdf-lib` (dessin de rectangles pour les caches, `drawText`, `drawImage`, etc.), en repartant du PDF d'origine plutôt que des captures html2canvas.

## 2. OCR des PDF scannés (tesseract.js)
- Les PDF sans couche texte ne produisent aucun `ptext`. Lancer tesseract.js sur le raster de page pour reconstruire des blocs éditables.
- À brancher dans `lib/pdf.ts` après l'extraction `getTextContent()` quand celle-ci renvoie 0 item.

## 3. Signature électronique conforme eIDAS
- La signature actuelle est une image (dessin ou nom stylisé) aplatie dans le PDF — **pas** une signature qualifiée.
- Une vraie signature eIDAS nécessite un **backend** + un **prestataire de service de confiance** (horodatage, certificat, scellement). Prévoir un point d'API d'archivage/signature côté serveur.

## 4. Reflow du texte modifié
- Aujourd'hui un `ptext` réécrit garde sa boîte d'origine (pas de retour à la ligne automatique).
- Améliorer : mesure de texte + retour à la ligne dans la boîte, et meilleure correspondance de police (mapping police PDF → webfont).

## 5. Persistance & intégration
- Brouillon local via **IndexedDB** (sérialiser `{ pages, elements, fieldValues, docName }`).
- Intégration au dashboard Publidata (ouvrir/enregistrer un document, archivage).

## Dette connue V1
- Le worker pdf.js est servi en statique depuis `/public` (copié au postinstall) plutôt que via le bundler — volontaire (fiable + offline).
- Assets placeholder à remplacer en prod : **Proxima Nova** (fallback Helvetica/Arial), **logo Publidata**, **kit Font Awesome Pro** (actuellement FA6 Free en CDN).
