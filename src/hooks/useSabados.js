import { useEffect, useState } from 'react'
import { ouvirSabados } from '../services/sabadosService'

export function useSabados() {
  const [sabados, setSabados] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    const unsub = ouvirSabados(
      (dados) => {
        setSabados(dados)
        setCarregando(false)
      },
      (e) => {
        setErro(e)
        setCarregando(false)
      },
    )
    return unsub
  }, [])

  return { sabados, carregando, erro }
}
