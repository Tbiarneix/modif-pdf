import s from './ui.module.css';

interface Props {
  colors: string[];
  current?: string;
  onPick: (c: string) => void;
  /** ajoute une pastille « aucun » (transparent) en tête */
  allowNone?: boolean;
}

/** Sélecteur de couleur en pastilles rondes. */
export default function Swatches({ colors, current, onPick, allowNone }: Props) {
  return (
    <div className={s.swatches}>
      {allowNone ? (
        <button
          type="button"
          className={`${s.swatch} ${s.swatchNone} ${current === 'transparent' ? s.swatchOn : ''}`}
          aria-label="Aucune couleur"
          aria-pressed={current === 'transparent'}
          title="Aucun"
          onClick={() => onPick('transparent')}
        >
          ∅
        </button>
      ) : null}
      {colors.map((c) => (
        <button
          key={c}
          type="button"
          className={`${s.swatch} ${current === c ? s.swatchOn : ''}`}
          style={{ background: c }}
          aria-label={`Couleur ${c}`}
          aria-pressed={current === c}
          title={c}
          onClick={() => onPick(c)}
        />
      ))}
    </div>
  );
}
