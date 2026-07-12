import s from './ui.module.css';

interface Props {
  variant?: 'primary' | 'white';
  icon?: string;
  onClick?: () => void;
  disabled?: boolean;
  height?: number;
  children: React.ReactNode;
  'aria-label'?: string;
}

export default function Button({
  variant = 'primary',
  icon,
  onClick,
  disabled,
  height = 40,
  children,
  ...rest
}: Props) {
  return (
    <button
      type="button"
      className={`${s.btn} ${variant === 'primary' ? s.primary : s.white}`}
      style={{ height }}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {icon ? <i className={icon} aria-hidden="true" /> : null}
      {children}
    </button>
  );
}
