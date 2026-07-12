import s from './ui.module.css';

interface Props {
  colors: string[];
  current?: string;
  onPick: (c: string) => void;
  /** ajoute une pastille « aucun » (transparent) en tête */
  allowNone?: boolean;
  /** masque la pipette (activée par défaut si le navigateur la supporte) */
  noEyedropper?: boolean;
}

/** Sélecteur de couleur en pastilles rondes + pipette (EyeDropper). */
export default function Swatches({ colors, current, onPick, allowNone, noEyedropper }: Props) {
  const eyedropperSupported =
    !noEyedropper && typeof window !== 'undefined' && typeof window.EyeDropper === 'function';

  async function pickWithEyedropper() {
    if (typeof window === 'undefined' || !window.EyeDropper) return;
    try {
      const res = await new window.EyeDropper().open();
      if (res?.sRGBHex) onPick(res.sRGBHex);
    } catch {
      /* sélection annulée (Échap) : rien à faire */
    }
  }

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
      {eyedropperSupported ? (
        <button
          type="button"
          className={`${s.swatch} ${s.swatchEye}`}
          aria-label="Pipette : choisir une couleur à l’écran"
          title="Pipette"
          onClick={pickWithEyedropper}
        >
          <i className="fas fa-eye-dropper" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
