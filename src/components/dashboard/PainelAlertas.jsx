import { IconAlert } from '../Icons'

const rotulosAcao = {
  sem_responsavel: 'Atribuir',
  cadastro_pendente: 'Aprovar',
  entrega_nao_confirmada: 'Confirmar',
  responsavel_inativo: 'Reatribuir',
  escala_curta: 'Gerar escala',
  conflito_indisponibilidade: 'Resolver',
}

export default function PainelAlertas({ alertas, onAcao }) {
  if (alertas.length === 0) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
        Tudo em ordem — nenhuma ação pendente.
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
      <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-800 dark:text-amber-400">
        <IconAlert size={18} /> Alertas (ações necessárias)
      </p>
      <ul className="space-y-2">
        {alertas.map((a) => (
          <li
            key={a.tipo}
            className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 text-sm dark:bg-slate-800"
          >
            <span>{a.mensagem}</span>
            <button
              onClick={() => onAcao(a)}
              className="min-h-[40px] shrink-0 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
            >
              {rotulosAcao[a.tipo] || 'Ver'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
