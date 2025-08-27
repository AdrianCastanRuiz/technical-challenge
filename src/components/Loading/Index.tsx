import './Loading.scss';

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
      className="loading-wrapper"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
    >
      <span className="loading-spinner" style={spinnerStyle} />
      <span className="loading-srOnly" aria-hidden="true">
        {label}
      </span>
    </div>
  );

  return overlay ? <div className="loading-overlay">{content}</div> : content;
}
