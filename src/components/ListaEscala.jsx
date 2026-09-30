import { formatarDataBr, ehHoje, hojeIso } from '../utils/datas'
import { nomeDoMembro } from '../utils/membros'
import StatusBadge, { statusExibido } from './StatusBadge'

/**
 * Lista de sábados. `acoes(sabado)` pode devolver botões extras para cada linha;
 * `meuUid` destaca as datas do usuário logado.
 */
export default function ListaEscala({ sabados, membros, acoes, meuUid, vazio = 'Nenhum sábado nesta lista.' }) {
  const hoje = hojeIso()

  if (sabados.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-600 dark:text-slate-400">
        {vazio}
      </p>
    )
  }

  return (
    <ul className="space-y-2">
      {sabados.map((s) => {
        const meu = meuUid && s.responsavelUid === meuUid
        const botoes = acoes?.(s)
        return (
          <li
            key={s.id}
            className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 ${
              ehHoje(s.id)
                ? 'border-indigo-300 bg-indigo-50 dark:border-indigo-500/40 dark:bg-indigo-500/10'
                : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800'
            }`}
          >
            <div className="min-w-0">
              <p className="num font-medium">
                {formatarDataBr(s.id)}
                {ehHoje(s.id) && <span className="ml-2 font-sans text-xs text-indigo-600 dark:text-indigo-400">hoje</span>}
              </p>
              <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                {nomeDoMembro(membros, s.responsavelUid)}
                {meu && <span className="ml-1 font-semibold text-indigo-600 dark:text-indigo-400">(você)</span>}
              </p>
              {s.descricaoLanche && (
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{s.descricaoLanche}</p>
              )}
            </div>
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
              <StatusBadge status={statusExibido(s, hoje)} />
              {botoes}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
