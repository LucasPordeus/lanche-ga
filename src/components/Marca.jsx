export function Logo({ size = 28 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
      <circle cx="32" cy="32" r="29" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="32" cy="32" r="25" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="M15 29a17 11 0 0 1 34 0z" className="fill-indigo-600 dark:fill-indigo-400" />
      <rect x="13" y="31" width="38" height="3.5" fill="currentColor" />
      <rect x="15" y="36.5" width="34" height="3.5" className="fill-amber-500" />
      <path
        d="M15 42h34v1.5a4.5 4.5 0 0 1-4.5 4.5h-25A4.5 4.5 0 0 1 15 43.5z"
        className="fill-indigo-600 dark:fill-indigo-400"
      />
      <g className="fill-white dark:fill-slate-900">
        <circle cx="26" cy="23" r="1.2" />
        <circle cx="32" cy="20.5" r="1.2" />
        <circle cx="38" cy="23" r="1.2" />
      </g>
    </svg>
  )
}

export default function Marca({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Logo />
      <span className="font-serif text-xl leading-none">Escala do Lanche</span>
    </span>
  )
}
