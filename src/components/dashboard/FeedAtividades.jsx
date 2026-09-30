const corPorTipo = {
  entrega: 'bg-emerald-600 dark:bg-emerald-400',
  troca_aceita: 'bg-indigo-600 dark:bg-indigo-400',
  troca_recusada: 'bg-red-600 dark:bg-red-400',
  membro_aprovado: 'bg-emerald-600 dark:bg-emerald-400',
  nao_entregue: 'bg-red-600 dark:bg-red-400',
  sabado_cancelado: 'bg-amber-600 dark:bg-amber-400',
}

function formatarQuando(timestamp) {
  if (!timestamp?.toDate) return ''
  return timestamp.toDate().toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function FeedAtividades({ atividades }) {
  if (atividades.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-600">
        Nenhuma atividade recente
      </p>
    )
  }

  return (
    <ul className="space-y-2">
      {atividades.map((a) => (
        <li
          key={a.id}
          className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-800"
        >
          <span
            className={`mt-1.5 h-2 w-2 shrink-0 ${corPorTipo[a.tipo] || 'bg-slate-400'}`}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="truncate">{a.descricao}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{formatarQuando(a.criadoEm)}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
