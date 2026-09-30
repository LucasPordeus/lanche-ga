import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { useSabados } from '../hooks/useSabados'
import { useMembros } from '../hooks/useMembros'
import { desfazerConfirmacao, marcarEntregue, marcarNaoEntregue } from '../services/sabadosService'
import { rankingPorMembro } from '../services/metricasService'
import { hojeIso } from '../utils/datas'
import { podeConfirmarEntrega } from '../utils/sabados'
import ListaEscala from '../components/ListaEscala'
import ModalEntrega from '../components/ModalEntrega'
import Loading from '../components/Loading'

const botao = 'min-h-[40px] rounded-lg px-3 text-xs font-semibold disabled:opacity-50'

export default function Historico() {
  const { user, admin } = useAuth()
  const { sabados, carregando: carregandoSabados } = useSabados()
  const { membros, carregando: carregandoMembros } = useMembros()
  const [sabadoParaEntrega, setSabadoParaEntrega] = useState(null)
  const [salvando, setSalvando] = useState(null)

  const hoje = hojeIso()
  // inclui o sábado de hoje: é quando o admin confirma se o lanche chegou
  const ateHoje = useMemo(
    () => sabados.filter((s) => s.id <= hoje).sort((a, b) => b.id.localeCompare(a.id)),
    [sabados, hoje],
  )
  const ranking = useMemo(
    () => rankingPorMembro(membros, sabados, 'tudo', hoje).filter((r) => r.total > 0),
    [membros, sabados, hoje],
  )

  if (carregandoSabados || carregandoMembros) return <Loading />

  async function executar(sabado, fn, sucesso) {
    setSalvando(sabado.id)
    try {
      await fn()
      toast.success(sucesso)
    } catch {
      toast.error('Não foi possível salvar.')
    } finally {
      setSalvando(null)
    }
  }

  function acoesAdmin(s) {
    if (!admin || !podeConfirmarEntrega(s, hoje)) return null
    const ocupado = salvando === s.id
    if (s.status === 'agendado') {
      return (
        <>
          <button
            onClick={() => setSabadoParaEntrega(s)}
            disabled={ocupado}
            className={`${botao} bg-emerald-600 text-white`}
          >
            Entregue
          </button>
          <button
            onClick={() =>
              executar(s, () => marcarNaoEntregue(s, { executorUid: user.uid }), 'Marcado como não entregue.')
            }
            disabled={ocupado}
            className={`${botao} border border-red-500 text-red-600 dark:text-red-400`}
          >
            Não entregue
          </button>
        </>
      )
    }
    return (
      <button
        onClick={() => executar(s, () => desfazerConfirmacao(s), 'Confirmação desfeita.')}
        disabled={ocupado}
        className={`${botao} border border-slate-300 dark:border-slate-600`}
      >
        Desfazer
      </button>
    )
  }

  async function confirmarEntrega(descricaoLanche) {
    try {
      await marcarEntregue(sabadoParaEntrega, { descricaoLanche, executorUid: user.uid })
      toast.success('Lanche marcado como entregue.')
    } catch {
      toast.error('Não foi possível confirmar a entrega.')
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <h1>Histórico</h1>

      <section>
        <h2 className="mb-3">Quem mais levou</h2>
        {ranking.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Ainda não há lanches entregues.</p>
        ) : (
          <ol className="space-y-1.5">
            {ranking.map((r, i) => (
              <li
                key={r.uid}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
              >
                <span>
                  <span className="num mr-2 text-slate-500 dark:text-slate-400">{i + 1}.</span>
                  {r.nome}
                </span>
                <span className="num font-semibold">{r.total}×</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section>
        <h2 className="mb-1">Sábados até hoje</h2>
        {admin && (
          <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
            Confirme se o lanche foi entregue. Datas futuras só podem ser confirmadas quando chegarem.
          </p>
        )}
        <ListaEscala
          sabados={ateHoje}
          membros={membros}
          meuUid={user.uid}
          acoes={acoesAdmin}
          vazio="Nenhum sábado passado ainda."
        />
      </section>

      <ModalEntrega
        key={sabadoParaEntrega?.id || 'fechado'}
        aberto={!!sabadoParaEntrega}
        onClose={() => setSabadoParaEntrega(null)}
        sabado={sabadoParaEntrega}
        onConfirmar={confirmarEntrega}
      />
    </div>
  )
}
