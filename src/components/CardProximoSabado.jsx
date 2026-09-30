import { formatarDataBr } from '../utils/datas'
import { nomeDoMembro } from '../utils/membros'
import StatusBadge from './StatusBadge'

export default function CardProximoSabado({ sabado, membros, souResponsavel, onTrocar }) {
  if (!sabado) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-slate-500 dark:border-slate-600 dark:text-slate-400">
        Nenhum sábado agendado. Peça ao admin para gerar a escala.
      </div>
    )
  }

  const destaque = souResponsavel
  const suave = destaque ? 'text-white/85' : 'text-slate-500 dark:text-slate-400'

  return (
    <div
      className={`rounded-2xl border p-6 ${
        destaque
          ? 'border-indigo-600 bg-indigo-600 text-white'
          : 'border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-sm ${suave}`}>Próximo sábado</p>
          <p className="num mt-1 text-3xl">{formatarDataBr(sabado.id)}</p>
        </div>
        <StatusBadge status={sabado.status} />
      </div>

      <p className={`mt-4 ${destaque ? 'text-white' : ''}`}>
        Responsável: <span className="font-semibold">{nomeDoMembro(membros, sabado.responsavelUid)}</span>
      </p>

      {souResponsavel && <p className="mt-2 text-sm font-medium">Neste sábado o lanche é seu.</p>}

      {onTrocar && (
        <button
          onClick={onTrocar}
          className={`mt-4 min-h-[44px] rounded-lg border px-4 py-2 text-sm font-semibold ${
            destaque
              ? 'border-white/60 hover:bg-white/10'
              : 'border-slate-300 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700'
          }`}
        >
          Solicitar troca
        </button>
      )}
    </div>
  )
}
