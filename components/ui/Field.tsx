import s from './ui.module.css';

/** Ligne libellée du panneau propriétés (label uppercase + contenu). */
export function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={s.row}>
      <div className={s.label}>{label}</div>
      {children}
    </div>
  );
}

/** Petit libellé de section (sans contenu associé). */
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className={s.label}>{children}</div>;
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

/** Input texte stylé DS (`.form-control`). */
export function Input({ label, style, ...rest }: InputProps) {
  return (
    <input
      className={s.input}
      aria-label={label}
      style={style}
      {...rest}
    />
  );
}
