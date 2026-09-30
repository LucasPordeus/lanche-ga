import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import Marca from './Marca'
import Navbar from './Navbar'
import BottomNav from './BottomNav'
import Loading from './Loading'
import { sair } from '../services/authService'
import { IconLogOut } from './Icons'

export default function Layout() {
  return (
    <div className="flex min-h-screen">
      <Navbar />
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900 md:hidden">
          <Marca />
          <button
            onClick={() => sair()}
            aria-label="Sair"
            className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <IconLogOut size={20} />
          </button>
        </header>
        <main className="flex-1 px-4 pb-24 pt-4 md:px-6 md:pb-8 md:pt-6">
          <Suspense fallback={<Loading />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
