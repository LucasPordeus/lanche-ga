import { useEffect, useState } from 'react'
import { ouvirTrocas } from '../services/trocasService'

export function useTrocas() {
  const [trocas, setTrocas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    const unsub = ouvirTrocas(
      (dados) => {
        setTrocas(dados)
        setCarregando(false)
      },
      (e) => {
        setErro(e)
        setCarregando(false)
      },
    )
    return unsub
  }, [])

  return { trocas, carregando, erro }
}
