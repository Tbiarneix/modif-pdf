import s from './ui.module.css';

interface Props {
  value: number;
  label: string;
  onChange: (v: number) => void;
}

/** Champ numérique compact avec préfixe (X/Y/L/H). */
export default function NumInput({ value, label, onChange }: Props) {
  return (
    <div className={s.num}>
      <span className={s.numLabel} aria-hidden="true">
        {label}
      </span>
      <input
        type="number"
        className={s.numInput}
        aria-label={label}
        value={Math.round(value)}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      />
    </div>
  );
}
