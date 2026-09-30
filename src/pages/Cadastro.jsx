import { useState } from 'react'
import Marca from '../components/Marca'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { cadastrar } from '../services/authService'

export default function Cadastro() {
  const navigate = useNavigate()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function aoSubmeter(e) {
    e.preventDefault()
    setEnviando(true)
    try {
      await cadastrar({ nome, email, senha })
      navigate('/aguardando')
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        toast.error('Este e-mail já está cadastrado.')
      } else if (err.code === 'auth/weak-password') {
        toast.error('A senha precisa ter ao menos 6 caracteres.')
      } else {
        toast.error('Não foi possível criar sua conta.')
      }
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-900">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 border border-slate-200 dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-6 text-center">
          <Marca className="justify-center" />
          <h1 className="mt-4">Criar conta</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Depois de cadastrado, o admin precisa aprovar seu acesso
          </p>
        </div>

        <form onSubmit={aoSubmeter} className="space-y-4">
          <div>
            <label htmlFor="nome" className="mb-1 block text-sm font-medium">
              Nome
            </label>
            <input
              id="nome"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3 dark:border-slate-600 dark:bg-slate-900"
            />
          </div>
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
              autoComplete="new-password"
              minLength={6}
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3 dark:border-slate-600 dark:bg-slate-900"
            />
          </div>

          <button
            type="submit"
            disabled={enviando}
            className="min-h-[44px] w-full rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
          >
            {enviando ? 'Criando conta…' : 'Criar conta'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Já tem conta?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 dark:text-indigo-400">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
