import { useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useSabados } from '../hooks/useSabados'
import { useMembros } from '../hooks/useMembros'
import { hojeIso } from '../utils/datas'
import ListaEscala from '../components/ListaEscala'
import Loading from '../components/Loading'

export default function Escala() {
  const { user } = useAuth()
  const { sabados, carregando: carregandoSabados, erro } = useSabados()
  const { membros, carregando: carregandoMembros } = useMembros()

  const hoje = hojeIso()
  const futuros = useMemo(
    () => sabados.filter((s) => s.id >= hoje).sort((a, b) => a.id.localeCompare(b.id)),
    [sabados, hoje],
  )

  if (carregandoSabados || carregandoMembros) return <Loading />
  if (erro) return <p className="text-sm text-red-600">Não foi possível carregar a escala.</p>

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1>Escala</h1>
      <ListaEscala
        sabados={futuros}
        membros={membros}
        meuUid={user.uid}
        vazio="Nenhum sábado futuro na escala ainda."
      />
    </div>
  )
}
