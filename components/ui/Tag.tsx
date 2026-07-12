import s from './ui.module.css';

/** Étiquette bleue (ex. « Brouillon »). */
export default function Tag({ children }: { children: React.ReactNode }) {
  return <span className={s.tag}>{children}</span>;
}
