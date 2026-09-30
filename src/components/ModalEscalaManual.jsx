import { useMemo, useState } from 'react'
import BottomSheet from './BottomSheet'
import { formatarDataBr } from '../utils/datas'

export default function ModalEscalaManual({
  aberto,
  onClose,
  datas,
  membros,
  indisponibilidades,
  onSalvar,
}) {
  const [escolhas, setEscolhas] = useState({})
  const [enviando, setEnviando] = useState(false)

  const indisponiveis = useMemo(() => {
    const set = new Set()
    for (const i of indisponibilidades) set.add(`${i.data}|${i.uid}`)
    return set
  }, [indisponibilidades])

  const preenchidas = datas.filter((d) => escolhas[d])

  async function salvar() {
    setEnviando(true)
    try {
      await onSalvar(preenchidas.map((d) => ({ id: d, responsavelUid: escolhas[d] })))
      setEscolhas({})
      onClose()
    } finally {
      setEnviando(false)
    }
  }

  return (
    <BottomSheet aberto={aberto} onClose={onClose} titulo="Montar escala manualmente">
      <div className="space-y-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Escolha o responsável de cada sábado. Datas deixadas em branco não serão criadas.
        </p>

        <ul className="max-h-[50vh] space-y-3 overflow-y-auto">
          {datas.map((data) => (
            <li key={data} className="flex items-center justify-between gap-3">
              <span className="font-semibold">{formatarDataBr(data)}</span>
              <select
                value={escolhas[data] || ''}
                onChange={(e) => setEscolhas((atual) => ({ ...atual, [data]: e.target.value }))}
                className="min-h-[44px] w-56 rounded-lg border border-slate-300 bg-white px-3 dark:border-slate-600 dark:bg-slate-900"
              >
                <option value="">—</option>
                {membros.map((m) => (
                  <option key={m.uid} value={m.uid}>
                    {m.nome}
                    {indisponiveis.has(`${data}|${m.uid}`) ? ' (indisponível)' : ''}
                  </option>
                ))}
              </select>
            </li>
          ))}
        </ul>

        <button
          onClick={salvar}
          disabled={enviando || preenchidas.length === 0}
          className="min-h-[44px] w-full rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
        >
          {enviando ? 'Salvando…' : `Salvar ${preenchidas.length} sábado(s)`}
        </button>
      </div>
    </BottomSheet>
  )
}
