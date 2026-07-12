# Polices clones (réécriture du texte des PDF non embarqués)

Les 28 `.woff2` de ce dossier (7 familles × 4 styles) servent à réécrire le texte
des PDF dont la police n'est **pas embarquée** (cf. `lib/pdf.ts` › `mapStandardFont`
et `app/fonts.css`). Ce sont des **clones métriquement compatibles** libres.

Une police n'est téléchargée par le navigateur que si un document l'utilise ; si
un fichier venait à manquer, le rendu retombe proprement sur le générique serif/sans.

## Correspondances & sources

| Famille | Remplace | Source (téléchargée) | Licence |
|---|---|---|---|
| **Marianne** | police de l'État | DSFR — `@gouvfr/dsfr/dist/fonts` (jsDelivr) | libre (État FR) |
| **Arimo** | Arial / Helvetica | `@fontsource/arimo` (jsDelivr, sous-ensemble latin) | Apache 2.0 |
| **Tinos** | Times New Roman | `@fontsource/tinos` | Apache 2.0 |
| **Cousine** | Courier New | `@fontsource/cousine` | Apache 2.0 |
| **Carlito** | Calibri | `@fontsource/carlito` | libre |
| **Caladea** | Cambria | `@fontsource/caladea` | libre |
| **Gelasio** | Georgia | `@fontsource/gelasio` | OFL |

Le sous-ensemble « latin » de Fontsource couvre le français (é è à ç ù œ €…).

## Re-télécharger / mettre à jour

Clones (exemple pour une famille) :

```bash
F=arimo
for s in 400-normal 700-normal 400-italic 700-italic; do
  curl -sL -o "$F-$s.woff2" "https://cdn.jsdelivr.net/npm/@fontsource/$F/files/$F-latin-$s.woff2"
done
# puis renommer 400-normal→Regular, 700-normal→Bold, 400-italic→Italic, 700-italic→BoldItalic
```

Marianne (DSFR) : `Marianne-Regular`, `Marianne-Bold`, `Marianne-Regular_Italic`,
`Marianne-Bold_Italic` depuis `https://cdn.jsdelivr.net/npm/@gouvfr/dsfr/dist/fonts/`.
