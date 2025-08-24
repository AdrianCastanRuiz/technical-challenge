// Loading.tsx
import styles from './Loading.module.scss';

type Props = {
  size?: number;
  label?: string;
  overlay?: boolean;
};

export default function Loading({ size = 32, label = 'Loading…', overlay = false }: Props) {
  const spinnerStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderWidth: Math.max(2, Math.round(size / 8)),
  };

  const content = (
    <div
      className={styles.wrapper}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}             // ✅ nombre accesible explícito
    >
      <span className={styles.spinner} style={spinnerStyle} />
      <span className={styles.srOnly} aria-hidden="true">{label}</span> {/* ✅ no se lee dos veces */}
    </div>
  );

  return overlay ? <div className={styles.overlay}>{content}</div> : content;
}
