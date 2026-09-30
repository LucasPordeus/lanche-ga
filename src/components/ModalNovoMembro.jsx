import { useState } from 'react'
import toast from 'react-hot-toast'
import BottomSheet from './BottomSheet'

const vazio = { nome: '', email: '', senha: '' }

const mensagensErro = {
  'auth/email-already-in-use': 'Já existe uma conta com esse e-mail.',
  'auth/invalid-email': 'E-mail inválido.',
  'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
}

export default function ModalNovoMembro({ aberto, onClose, onCriar }) {
  const [dados, setDados] = useState(vazio)
  const [enviando, setEnviando] = useState(false)

  function alterar(campo) {
    return (e) => setDados((atual) => ({ ...atual, [campo]: e.target.value }))
  }

  async function enviar(e) {
    e.preventDefault()
    setEnviando(true)
    try {
      await onCriar({ nome: dados.nome.trim(), email: dados.email.trim(), senha: dados.senha })
      toast.success('Membro criado e aprovado.')
      setDados(vazio)
      onClose()
    } catch (erro) {
      toast.error(mensagensErro[erro.code] || 'Não foi possível criar o membro.')
    } finally {
      setEnviando(false)
    }
  }

  const classeCampo =
    'w-full min-h-[44px] rounded-lg border border-slate-300 bg-white px-3 dark:border-slate-600 dark:bg-slate-900'

  return (
    <BottomSheet aberto={aberto} onClose={onClose} titulo="Novo membro">
      <form onSubmit={enviar} className="space-y-4">
        <div>
          <label htmlFor="novo-nome" className="mb-1 block text-sm font-medium">Nome</label>
          <input id="novo-nome" required value={dados.nome} onChange={alterar('nome')} className={classeCampo} />
        </div>
        <div>
          <label htmlFor="novo-email" className="mb-1 block text-sm font-medium">E-mail</label>
          <input id="novo-email" type="email" required value={dados.email} onChange={alterar('email')} className={classeCampo} />
        </div>
        <div>
          <label htmlFor="novo-senha" className="mb-1 block text-sm font-medium">Senha inicial</label>
          <input id="novo-senha" type="text" required minLength={6} value={dados.senha} onChange={alterar('senha')} className={classeCampo} />
        </div>
        <button
          type="submit"
          disabled={enviando}
          className="min-h-[44px] w-full rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
        >
          {enviando ? 'Criando…' : 'Criar e aprovar'}
        </button>
      </form>
    </BottomSheet>
  )
}
