import s from './ui.module.css';

interface Props {
  icon: string;
  label: string;
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  title?: string;
  size?: number;
  fontSize?: number;
  color?: string;
  style?: React.CSSProperties;
}

/** Bouton icône accessible (aria-label obligatoire). */
export default function IconButton({
  icon,
  label,
  onClick,
  disabled,
  title,
  size = 34,
  fontSize = 14,
  color,
  style,
}: Props) {
  return (
    <button
      type="button"
      className={s.iconBtn}
      aria-label={label}
      title={title ?? label}
      onClick={onClick}
      disabled={disabled}
      style={{ width: size, height: size, fontSize, color, ...style }}
    >
      <i className={icon} aria-hidden="true" />
    </button>
  );
}
