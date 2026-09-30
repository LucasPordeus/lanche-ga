const opcoes = [
  { valor: 'mes', label: 'Mês atual' },
  { valor: '3meses', label: 'Últimos 3 meses' },
  { valor: 'ano', label: 'Este ano' },
  { valor: 'tudo', label: 'Tudo' },
]

export default function FiltroPeriodo({ valor, onChange }) {
  return (
    <select
      value={valor}
      onChange={(e) => onChange(e.target.value)}
      className="min-h-[44px] rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-slate-600 dark:bg-slate-800"
      aria-label="Filtro de período"
    >
      {opcoes.map((o) => (
        <option key={o.valor} value={o.valor}>
          {o.label}
        </option>
      ))}
    </select>
  )
}
