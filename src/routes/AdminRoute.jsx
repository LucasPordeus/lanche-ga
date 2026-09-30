import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AdminTabs from '../components/AdminTabs'
import Loading from '../components/Loading'

export default function AdminRoute() {
  const { carregando, admin } = useAuth()

  if (carregando) return <Loading texto="Verificando permissões…" />
  if (!admin) return <Navigate to="/" replace />

  return (
    <>
      <AdminTabs />
      <Outlet />
    </>
  )
}
