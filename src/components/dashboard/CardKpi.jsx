export default function CardKpi({ label, value, sublabel, tom = 'neutro' }) {
  const tons = {
    neutro: 'text-slate-900 dark:text-slate-100',
    bom: 'text-emerald-600 dark:text-emerald-400',
    atencao: 'text-amber-600 dark:text-amber-400',
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-bold ${tons[tom]}`}>{value}</p>
      {sublabel && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{sublabel}</p>}
    </div>
  )
}
