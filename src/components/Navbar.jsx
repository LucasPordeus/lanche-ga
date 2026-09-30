import { NavLink } from 'react-router-dom'
import Marca from './Marca'
import { useAuth } from '../contexts/AuthContext'
import { sair } from '../services/authService'
import { IconCalendar, IconClock, IconHistory, IconHome, IconLogOut, IconShield } from './Icons'

const itens = [
  { to: '/', label: 'Home', Icon: IconHome, exact: true },
  { to: '/escala', label: 'Escala', Icon: IconCalendar },
  { to: '/minhas-datas', label: 'Minhas datas', Icon: IconClock },
  { to: '/historico', label: 'Histórico', Icon: IconHistory },
]

export default function Navbar() {
  const { admin, perfil } = useAuth()
  const lista = admin
    ? [...itens, { to: '/admin/dashboard', label: 'Admin', Icon: IconShield }]
    : itens

  return (
    <aside className="hidden shrink-0 border-r border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 md:flex md:w-56 md:flex-col lg:w-64">
      <div className="px-5 py-6">
        <Marca />
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {lista.map(({ to, label, Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-slate-200 px-4 py-4 dark:border-slate-700">
        <p className="truncate text-sm font-medium">{perfil?.nome}</p>
        <button
          onClick={() => sair()}
          className="mt-2 flex items-center gap-2 text-sm text-slate-500 hover:text-red-600 dark:text-slate-400"
        >
          <IconLogOut size={18} /> Sair
        </button>
      </div>
    </aside>
  )
}
