import { useEffect, useState } from 'react'
import { ouvirAtividadesRecentes } from '../services/atividadesService'

export function useAtividadesRecentes(qtd = 10) {
  const [atividades, setAtividades] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    const unsub = ouvirAtividadesRecentes(
      (dados) => {
        setAtividades(dados)
        setCarregando(false)
      },
      qtd,
      (e) => {
        setErro(e)
        setCarregando(false)
      },
    )
    return unsub
  }, [qtd])

  return { atividades, carregando, erro }
}
