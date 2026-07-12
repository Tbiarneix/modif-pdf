import s from './ui.module.css';

interface Props {
  label: string;
  icon: string;
  onClick: () => void;
  danger?: boolean;
}

/** Bouton d'action du panneau (Dupliquer, Supprimer, Avant/Arrière…). */
export default function ActionButton({ label, icon, onClick, danger }: Props) {
  return (
    <button
      type="button"
      className={`${s.action} ${danger ? s.actionDanger : ''}`}
      onClick={onClick}
    >
      <i className={icon} aria-hidden="true" />
      {label}
    </button>
  );
}
