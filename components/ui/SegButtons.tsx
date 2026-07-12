import s from './ui.module.css';

export interface SegOption<T extends string> {
  v: T;
  /** icône FA (prioritaire sur le texte) */
  i?: string;
  /** libellé texte */
  t?: string;
}

interface Props<T extends string> {
  options: SegOption<T>[];
  /** sélection unique (un seul actif) */
  current?: T | '';
  /** mode multi-bascule : chaque bouton actif indépendamment */
  isActive?: (v: T) => boolean;
  onPick: (v: T) => void;
}

/** Boutons segmentés répartis à parts égales (alignement, style, mode…). */
export default function SegButtons<T extends string>({
  options,
  current,
  isActive,
  onPick,
}: Props<T>) {
  return (
    <div className={s.seg}>
      {options.map((o) => {
        const on = isActive ? isActive(o.v) : current === o.v;
        return (
          <button
            key={o.v}
            type="button"
            className={`${s.segBtn} ${on ? s.segBtnOn : ''}`}
            aria-pressed={on}
            aria-label={o.t ?? o.v}
            title={o.t ?? o.v}
            onClick={() => onPick(o.v)}
          >
            {o.i ? <i className={o.i} aria-hidden="true" /> : o.t}
          </button>
        );
      })}
    </div>
  );
}
