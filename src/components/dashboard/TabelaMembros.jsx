import { formatarDataBr } from '../../utils/datas'

export default function TabelaMembros({ linhas }) {
  if (linhas.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-600">
        Nenhum dado no período
      </p>
    )
  }

  return (
    <>
      <ul className="space-y-2 md:hidden">
        {linhas.map((l) => (
          <li key={l.uid} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <p className="font-semibold">{l.nome}</p>
            <dl className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400">
              <div>
                <dt>Total levado</dt>
                <dd className="font-medium text-slate-800 dark:text-slate-200">{l.totalLevado}</dd>
              </div>
              <div>
                <dt>Não entregues</dt>
                <dd className="font-medium text-slate-800 dark:text-slate-200">{l.naoEntregues}</dd>
              </div>
              <div>
                <dt>Última vez</dt>
                <dd className="font-medium text-slate-800 dark:text-slate-200">
                  {l.ultimaVez ? formatarDataBr(l.ultimaVez) : '—'}
                </dd>
              </div>
              <div>
                <dt>Próxima data</dt>
                <dd className="font-medium text-slate-800 dark:text-slate-200">
                  {l.proximaData ? formatarDataBr(l.proximaData) : '—'}
                </dd>
              </div>
              <div>
                <dt>Indisponibilidades</dt>
                <dd className="font-medium text-slate-800 dark:text-slate-200">
                  {l.totalIndisponibilidades}
                </dd>
              </div>
              <div>
                <dt>Trocas solicitadas</dt>
                <dd className="font-medium text-slate-800 dark:text-slate-200">
                  {l.trocasSolicitadas}
                </dd>
              </div>
              <div>
                <dt>Trocas aceitas</dt>
                <dd className="font-medium text-slate-800 dark:text-slate-200">{l.trocasAceitas}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Total levado</th>
              <th className="px-4 py-3">Não entregues</th>
              <th className="px-4 py-3">Última vez</th>
              <th className="px-4 py-3">Próxima data</th>
              <th className="px-4 py-3">Indisp.</th>
              <th className="px-4 py-3">Trocas solic.</th>
              <th className="px-4 py-3">Trocas aceitas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {linhas.map((l) => (
              <tr key={l.uid}>
                <td className="px-4 py-3 font-medium">{l.nome}</td>
                <td className="px-4 py-3">{l.totalLevado}</td>
                <td className="px-4 py-3">{l.naoEntregues}</td>
                <td className="px-4 py-3">{l.ultimaVez ? formatarDataBr(l.ultimaVez) : '—'}</td>
                <td className="px-4 py-3">{l.proximaData ? formatarDataBr(l.proximaData) : '—'}</td>
                <td className="px-4 py-3">{l.totalIndisponibilidades}</td>
                <td className="px-4 py-3">{l.trocasSolicitadas}</td>
                <td className="px-4 py-3">{l.trocasAceitas}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
