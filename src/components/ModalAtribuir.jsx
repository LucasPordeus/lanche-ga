import { useState } from 'react'
import BottomSheet from './BottomSheet'
import { formatarDataBr } from '../utils/datas'

export default function ModalAtribuir({ aberto, onClose, sabado, membros, onConfirmar }) {
  const [responsavelUid, setResponsavelUid] = useState(sabado?.responsavelUid || '')
  const [enviando, setEnviando] = useState(false)

  async function confirmar() {
    setEnviando(true)
    try {
      await onConfirmar(responsavelUid)
      onClose()
    } finally {
      setEnviando(false)
    }
  }

  return (
    <BottomSheet aberto={aberto} onClose={onClose} titulo="Atribuir responsável">
      {sabado && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Sábado <span className="font-semibold">{formatarDataBr(sabado.id)}</span>
          </p>

          <select
            value={responsavelUid}
            onChange={(e) => setResponsavelUid(e.target.value)}
            className="w-full min-h-[44px] rounded-lg border border-slate-300 bg-white px-3 dark:border-slate-600 dark:bg-slate-900"
          >
            <option value="">Sem responsável</option>
            {membros.map((m) => (
              <option key={m.uid} value={m.uid}>
                {m.nome}
              </option>
            ))}
          </select>

          <button
            onClick={confirmar}
            disabled={enviando}
            className="min-h-[44px] w-full rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
          >
            {enviando ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      )}
    </BottomSheet>
  )
}
