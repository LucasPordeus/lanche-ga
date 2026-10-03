import { useAuth } from '../contexts/AuthContext'
import { useSabados } from '../hooks/useSabados'
import { useMembros } from '../hooks/useMembros'
import CalendarioEscala from '../components/CalendarioEscala'
import Loading from '../components/Loading'

export default function Escala() {
  const { user } = useAuth()
  const { sabados, carregando: carregandoSabados, erro } = useSabados()
  const { membros, carregando: carregandoMembros } = useMembros()

  if (carregandoSabados || carregandoMembros) return <Loading />
  if (erro) return <p className="text-sm text-red-600">Não foi possível carregar a escala.</p>

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1>Escala</h1>
      <CalendarioEscala sabados={sabados} membros={membros} meuUid={user.uid} />
    </div>
  )
}
