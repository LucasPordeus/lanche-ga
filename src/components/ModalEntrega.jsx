import { useState } from 'react'
import BottomSheet from './BottomSheet'
import { formatarDataBr } from '../utils/datas'

export default function ModalEntrega({ aberto, onClose, sabado, onConfirmar }) {
  const [descricaoLanche, setDescricaoLanche] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function confirmar() {
    setEnviando(true)
    try {
      await onConfirmar(descricaoLanche)
      setDescricaoLanche('')
      onClose()
    } finally {
      setEnviando(false)
    }
  }

  return (
    <BottomSheet aberto={aberto} onClose={onClose} titulo="Marcar como entregue">
      {sabado && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Sábado <span className="font-semibold">{formatarDataBr(sabado.id)}</span>
          </p>
          <div>
            <label htmlFor="descricaoLanche" className="mb-1 block text-sm font-medium">
              O que foi levado? (opcional)
            </label>
            <input
              id="descricaoLanche"
              value={descricaoLanche}
              onChange={(e) => setDescricaoLanche(e.target.value)}
              placeholder="Ex.: brigadeiro e suco"
              className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3 dark:border-slate-600 dark:bg-slate-900"
            />
          </div>
          <button
            onClick={confirmar}
            disabled={enviando}
            className="min-h-[44px] w-full rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
          >
            {enviando ? 'Salvando…' : 'Confirmar entrega'}
          </button>
        </div>
      )}
    </BottomSheet>
  )
}
