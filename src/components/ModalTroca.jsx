import { useMemo, useState } from 'react'
import BottomSheet from './BottomSheet'
import { formatarDataBr, hojeIso } from '../utils/datas'
import { nomeDoMembro } from '../utils/membros'
import { sabadosParaTrocar } from '../services/trocasRegras'

/** Pede para trocar o meu sábado pelo sábado de um colega. */
export default function ModalTroca({ aberto, onClose, sabado, sabados, membros, meuUid, onConfirmar }) {
  const [destinoId, setDestinoId] = useState('')
  const [enviando, setEnviando] = useState(false)

  const opcoes = useMemo(
    () => (sabado ? sabadosParaTrocar(sabados, membros, meuUid, sabado.id, hojeIso()) : []),
    [sabado, sabados, membros, meuUid],
  )

  async function confirmar() {
    const destino = opcoes.find((s) => s.id === destinoId)
    if (!destino) return
    setEnviando(true)
    try {
      await onConfirmar(destino)
      setDestinoId('')
      onClose()
    } finally {
      setEnviando(false)
    }
  }

  return (
    <BottomSheet aberto={aberto} onClose={onClose} titulo="Solicitar troca">
      {sabado && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Você oferece o seu sábado <span className="num font-semibold text-slate-900 dark:text-slate-100">{formatarDataBr(sabado.id)}</span> e
            fica com a data do colega. Ele precisa aceitar para valer.
          </p>

          {opcoes.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-600 dark:text-slate-400">
              Nenhum colega tem data futura na escala para trocar agora.
            </p>
          ) : (
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="destino">
                Trocar pela data de
              </label>
              <select
                id="destino"
                value={destinoId}
                onChange={(e) => setDestinoId(e.target.value)}
                className="w-full min-h-[44px] rounded-lg border border-slate-300 bg-white px-3 dark:border-slate-600 dark:bg-slate-900"
              >
                <option value="">Escolha a data do colega</option>
                {opcoes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {formatarDataBr(s.id)} — {nomeDoMembro(membros, s.responsavelUid)}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={confirmar}
            disabled={!destinoId || enviando}
            className="min-h-[44px] w-full rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
          >
            {enviando ? 'Enviando…' : 'Enviar pedido de troca'}
          </button>
        </div>
      )}
    </BottomSheet>
  )
}
