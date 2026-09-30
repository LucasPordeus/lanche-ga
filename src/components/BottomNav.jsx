import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { IconCalendar, IconClock, IconHistory, IconHome, IconShield } from './Icons'

const itens = [
  { to: '/', label: 'Home', Icon: IconHome, exact: true },
  { to: '/escala', label: 'Escala', Icon: IconCalendar },
  { to: '/minhas-datas', label: 'Minhas datas', Icon: IconClock },
  { to: '/historico', label: 'Histórico', Icon: IconHistory },
]

export default function BottomNav() {
  const { admin } = useAuth()
  const lista = admin
    ? [...itens, { to: '/admin/dashboard', label: 'Admin', Icon: IconShield }]
    : itens

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95 md:hidden">
      <ul className="flex justify-between px-1">
        {lista.map(({ to, label, Icon, exact }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={exact}
              className={({ isActive }) =>
                `flex min-h-[56px] flex-col items-center justify-center gap-0.5 py-1 text-[11px] font-medium ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`
              }
            >
              <Icon size={22} />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
