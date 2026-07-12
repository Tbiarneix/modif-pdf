import s from './ui.module.css';

interface Props {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  /** valeur affichée à droite (ex. « 16px », « 80% ») */
  display?: string;
  label?: string;
}

/** Slider + valeur affichée. */
export default function Slider({ value, min, max, step, onChange, display, label }: Props) {
  return (
    <div className={s.sliderRow}>
      <input
        type="range"
        className={s.slider}
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
      {display != null ? <span className={s.sliderVal}>{display}</span> : null}
    </div>
  );
}
