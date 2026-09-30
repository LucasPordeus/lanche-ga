import { useAuth } from '../contexts/AuthContext'
import { sair } from '../services/authService'

export default function AguardandoAprovacao() {
  const { perfil } = useAuth()

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-center dark:bg-slate-900">
      <div className="max-w-sm">
        <span className="text-4xl">⏳</span>
        <h1 className="mt-3 text-xl font-bold">Aguardando aprovação</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Olá{perfil?.nome ? `, ${perfil.nome}` : ''}! Seu cadastro foi recebido. Peça a um admin do
          grupo para aprovar seu acesso.
        </p>
        <button
          onClick={() => sair()}
          className="mt-6 min-h-[44px] rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold dark:border-slate-600"
        >
          Sair
        </button>
      </div>
    </div>
  )
}
