import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './routes/ProtectedRoute'
import AdminRoute from './routes/AdminRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import AguardandoAprovacao from './pages/AguardandoAprovacao'
import Home from './pages/Home'
import Escala from './pages/Escala'
import MinhasDatas from './pages/MinhasDatas'
import Historico from './pages/Historico'

const Dashboard = lazy(() => import('./pages/admin/Dashboard'))
const Membros = lazy(() => import('./pages/admin/Membros'))
const GerenciarEscala = lazy(() => import('./pages/admin/GerenciarEscala'))

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/aguardando" element={<AguardandoAprovacao />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/escala" element={<Escala />} />
            <Route path="/minhas-datas" element={<MinhasDatas />} />
            <Route path="/historico" element={<Historico />} />

            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin/membros" element={<Membros />} />
              <Route path="/admin/escala" element={<GerenciarEscala />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
