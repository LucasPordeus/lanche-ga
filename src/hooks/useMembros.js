import { useEffect, useState } from 'react'
import { ouvirMembros } from '../services/membrosService'

export function useMembros() {
  const [membros, setMembros] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    const unsub = ouvirMembros(
      (dados) => {
        setMembros(dados)
        setCarregando(false)
      },
      (e) => {
        setErro(e)
        setCarregando(false)
      },
    )
    return unsub
  }, [])

  return { membros, carregando, erro }
}
