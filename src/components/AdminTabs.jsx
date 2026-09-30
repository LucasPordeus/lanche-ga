import { NavLink } from 'react-router-dom'

const abas = [
  { to: '/admin/dashboard', label: 'Painel' },
  { to: '/admin/membros', label: 'Membros' },
  { to: '/admin/escala', label: 'Escala' },
]

export default function AdminTabs() {
  return (
    <nav className="mx-auto mb-4 flex max-w-3xl gap-2" aria-label="Administração">
      {abas.map((a) => (
        <NavLink
          key={a.to}
          to={a.to}
          className={({ isActive }) =>
            `flex min-h-[44px] flex-1 items-center justify-center rounded-lg border px-3 text-sm font-semibold ${
              isActive
                ? 'border-indigo-600 bg-indigo-600 text-white'
                : 'border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-300'
            }`
          }
        >
          {a.label}
        </NavLink>
      ))}
    </nav>
  )
}
