import { useState } from 'react'
import toast from 'react-hot-toast'
import { solicitarTroca } from '../services/trocasService'
import { temTrocaPendente } from '../services/trocasRegras'

/** Estado e envio do pedido de troca, compartilhado entre Home e Minhas datas. */
export function usePedidoTroca(uid, trocas) {
  const [sabadoOferecido, setSabadoOferecido] = useState(null)

  function abrir(sabado) {
    if (temTrocaPendente(trocas, sabado.id)) {
      toast.error('Você já tem um pedido de troca pendente para essa data.')
      return
    }
    setSabadoOferecido(sabado)
  }

  async function enviar(destino) {
    try {
      await solicitarTroca({
        sabado: sabadoOferecido.id,
        sabadoDestino: destino.id,
        solicitanteUid: uid,
        destinatarioUid: destino.responsavelUid,
      })
      toast.success('Pedido de troca enviado.')
    } catch {
      toast.error('Não foi possível enviar o pedido de troca.')
      throw new Error('falha ao solicitar troca')
    }
  }

  return { sabadoOferecido, abrir, fechar: () => setSabadoOferecido(null), enviar }
}
