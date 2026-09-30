import { useEffect, useState } from 'react'
import {
  ouvirIndisponibilidades,
  ouvirIndisponibilidadesDoUsuario,
} from '../services/indisponibilidadesService'

export function useIndisponibilidades() {
  const [indisponibilidades, setIndisponibilidades] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    const unsub = ouvirIndisponibilidades(
      (dados) => {
        setIndisponibilidades(dados)
        setCarregando(false)
      },
      (e) => {
        setErro(e)
        setCarregando(false)
      },
    )
    return unsub
  }, [])

  return { indisponibilidades, carregando, erro }
}

export function useMinhasIndisponibilidades(uid) {
  const [indisponibilidades, setIndisponibilidades] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    if (!uid) return
    setCarregando(true)
    const unsub = ouvirIndisponibilidadesDoUsuario(
      uid,
      (dados) => {
        setIndisponibilidades(dados)
        setCarregando(false)
      },
      (e) => {
        setErro(e)
        setCarregando(false)
      },
    )
    return unsub
  }, [uid])

  return { indisponibilidades, carregando, erro }
}
