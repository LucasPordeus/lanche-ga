import { useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'
import { useMembros } from '../../hooks/useMembros'
import {
  aprovarMembro,
  criarMembroPeloAdmin,
  desativarMembro,
  promoverAdmin,
  rebaixarMembro,
  reativarMembro,
} from '../../services/membrosService'
import Loading from '../../components/Loading'
import ModalNovoMembro from '../../components/ModalNovoMembro'

const statusEstilo = {
  pendente: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  aprovado: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  inativo: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
}

export default function Membros() {
  const { user } = useAuth()
  const { membros, carregando } = useMembros()
  const [criando, setCriando] = useState(false)

  if (carregando) return <Loading />

  async function executar(fn, ...args) {
    try {
      await fn(...args)
    } catch {
      toast.error('Não foi possível concluir a ação.')
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold">Membros</h1>
        <button
          onClick={() => setCriando(true)}
          className="min-h-[44px] rounded-lg bg-indigo-600 px-4 font-semibold text-white"
        >
          Novo membro
        </button>
      </div>

      <ul className="space-y-2">
        {membros.map((m) => (
          <li
            key={m.uid}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="min-w-0">
              <p className="font-semibold">
                {m.nome} {m.papel === 'admin' && <span className="text-xs text-indigo-500">(admin)</span>}
              </p>
              <p className="truncate text-sm text-slate-500 dark:text-slate-400">{m.email}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusEstilo[m.status]}`}>
                {m.status}
              </span>

              {m.status === 'pendente' && (
                <button
                  onClick={() => executar(aprovarMembro, m.uid, user.uid)}
                  className="min-h-[40px] rounded-lg bg-emerald-600 px-3 text-sm font-semibold text-white"
                >
                  Aprovar
                </button>
              )}
              {m.status === 'aprovado' && m.uid !== user.uid && (
                <button
                  onClick={() => executar(desativarMembro, m.uid)}
                  className="min-h-[40px] rounded-lg bg-slate-200 px-3 text-sm font-semibold dark:bg-slate-700"
                >
                  Desativar
                </button>
              )}
              {m.status === 'inativo' && (
                <button
                  onClick={() => executar(reativarMembro, m.uid)}
                  className="min-h-[40px] rounded-lg bg-emerald-600 px-3 text-sm font-semibold text-white"
                >
                  Reativar
                </button>
              )}
              {m.papel !== 'admin' ? (
                <button
                  onClick={() => executar(promoverAdmin, m.uid)}
                  className="min-h-[40px] rounded-lg border border-indigo-300 px-3 text-sm font-semibold text-indigo-600 dark:border-indigo-500/40 dark:text-indigo-400"
                >
                  Tornar admin
                </button>
              ) : (
                m.uid !== user.uid && (
                  <button
                    onClick={() => executar(rebaixarMembro, m.uid)}
                    className="min-h-[40px] rounded-lg border border-slate-300 px-3 text-sm font-semibold dark:border-slate-600"
                  >
                    Remover admin
                  </button>
                )
              )}
            </div>
          </li>
        ))}
      </ul>

      <ModalNovoMembro
        aberto={criando}
        onClose={() => setCriando(false)}
        onCriar={(dados) => criarMembroPeloAdmin(dados, user.uid)}
      />
    </div>
  )
}
