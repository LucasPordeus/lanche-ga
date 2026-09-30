import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Loading from '../components/Loading'

export default function ProtectedRoute() {
  const { user, perfil, carregando, pendente } = useAuth()

  if (carregando) return <Loading texto="Verificando sua conta…" />
  if (!user) return <Navigate to="/login" replace />
  if (!perfil || pendente) return <Navigate to="/aguardando" replace />
  if (perfil.status === 'inativo') return <Navigate to="/login" replace />

  return <Outlet />
}
