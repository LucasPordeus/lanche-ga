import { useState } from 'react'
import Marca from '../components/Marca'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { entrarComEmail, recuperarSenha } from '../services/authService'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function aoSubmeter(e) {
    e.preventDefault()
    setEnviando(true)
    try {
      await entrarComEmail({ email, senha })
      navigate('/')
    } catch {
      toast.error('E-mail ou senha inválidos.')
    } finally {
      setEnviando(false)
    }
  }

  async function esqueciSenha() {
    if (!email) {
      toast.error('Informe seu e-mail para recuperar a senha.')
      return
    }
    try {
      await recuperarSenha(email)
      toast.success('E-mail de recuperação enviado.')
    } catch {
      toast.error('Não foi possível enviar o e-mail.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-900">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 border border-slate-200 dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-6 text-center">
          <Marca className="justify-center" />
          <h1 className="mt-4">Entrar</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Entre para ver a escala do grupo</p>
        </div>

        <form onSubmit={aoSubmeter} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3 dark:border-slate-600 dark:bg-slate-900"
            />
          </div>
          <div>
            <label htmlFor="senha" className="mb-1 block text-sm font-medium">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              autoComplete="current-password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3 dark:border-slate-600 dark:bg-slate-900"
            />
          </div>

          <button
            type="button"
            onClick={esqueciSenha}
            className="text-sm text-indigo-600 dark:text-indigo-400"
          >
            Esqueci minha senha
          </button>

          <button
            type="submit"
            disabled={enviando}
            className="min-h-[44px] w-full rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
          >
            {enviando ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
