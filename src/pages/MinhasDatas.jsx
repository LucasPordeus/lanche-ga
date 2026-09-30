import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { parseISO } from 'date-fns'
import { useAuth } from '../contexts/AuthContext'
import { useMinhasIndisponibilidades } from '../hooks/useIndisponibilidades'
import { useTrocas } from '../hooks/useTrocas'
import { useMembros } from '../hooks/useMembros'
import { useSabados } from '../hooks/useSabados'
import { usePedidoTroca } from '../hooks/usePedidoTroca'
import { marcarIndisponibilidade, removerIndisponibilidade } from '../services/indisponibilidadesService'
import { aceitarTroca, cancelarTroca, recusarTroca } from '../services/trocasService'
import { meusSabadosTrocaveis, situacaoTroca, temTrocaPendente } from '../services/trocasRegras'
import { formatarDataBr, hojeIso } from '../utils/datas'
import { nomeDoMembro } from '../utils/membros'
import { IconX } from '../components/Icons'
import ListaEscala from '../components/ListaEscala'
import ModalTroca from '../components/ModalTroca'
import Loading from '../components/Loading'

const rotuloSituacao = {
  pendente: 'Aguardando resposta',
  valida: 'Aguardando resposta',
  aceita: 'Aceita',
  recusada: 'Recusada',
  cancelada: 'Cancelada',
  expirada: 'Expirada',
  invalida: 'Não vale mais',
}

const botaoSecundario =
  'min-h-[44px] rounded-lg border border-slate-300 px-3 text-sm font-semibold hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700'

export default function MinhasDatas() {
  const { user } = useAuth()
  const { indisponibilidades, carregando: carregandoInd } = useMinhasIndisponibilidades(user.uid)
  const { trocas, carregando: carregandoTrocas } = useTrocas()
  const { membros, carregando: carregandoMembros } = useMembros()
  const { sabados, carregando: carregandoSabados } = useSabados()
  const pedido = usePedidoTroca(user.uid, trocas)

  const [data, setData] = useState('')
  const [motivo, setMotivo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [respondendo, setRespondendo] = useState(null)

  const hoje = hojeIso()
  const sabadosPorId = useMemo(() => new Map(sabados.map((s) => [s.id, s])), [sabados])

  const minhasDatas = useMemo(() => meusSabadosTrocaveis(sabados, user.uid, hoje), [sabados, user.uid, hoje])

  const recebidas = useMemo(
    () =>
      trocas
        .filter((t) => t.destinatarioUid === user.uid && t.status === 'pendente')
        .map((t) => ({ ...t, situacao: situacaoTroca(t, sabadosPorId, hoje) })),
    [trocas, user.uid, sabadosPorId, hoje],
  )
  const enviadas = useMemo(
    () =>
      trocas
        .filter((t) => t.solicitanteUid === user.uid)
        .map((t) => ({ ...t, situacao: situacaoTroca(t, sabadosPorId, hoje) })),
    [trocas, user.uid, sabadosPorId, hoje],
  )

  async function adicionarIndisponibilidade(e) {
    e.preventDefault()
    if (!data) return
    if (parseISO(data).getDay() !== 6) {
      toast.error('Escolha um sábado.')
      return
    }
    if (indisponibilidades.some((i) => i.data === data)) {
      toast.error('Essa data já está marcada.')
      return
    }
    setEnviando(true)
    try {
      await marcarIndisponibilidade({ uid: user.uid, data, motivo: motivo.trim() })
      setData('')
      setMotivo('')
      const escalado = sabadosPorId.get(data)?.responsavelUid === user.uid
      toast.success(
        escalado
          ? 'Indisponibilidade registrada. Você está escalado nessa data: peça uma troca.'
          : 'Indisponibilidade registrada.',
      )
    } catch {
      toast.error('Não foi possível registrar.')
    } finally {
      setEnviando(false)
    }
  }

  async function remover(id) {
    try {
      await removerIndisponibilidade(id)
    } catch {
      toast.error('Não foi possível remover.')
    }
  }

  async function responder(troca, acao) {
    setRespondendo(troca.id)
    try {
      if (acao === 'aceitar') await aceitarTroca(troca)
      else if (acao === 'recusar') await recusarTroca(troca)
      else await cancelarTroca(troca)
      toast.success({ aceitar: 'Troca aceita. As datas foram invertidas.', recusar: 'Troca recusada.', cancelar: 'Pedido cancelado.' }[acao])
    } catch (erro) {
      toast.error(erro?.amigavel ? erro.message : 'Não foi possível concluir.')
    } finally {
      setRespondendo(null)
    }
  }

  if (carregandoInd || carregandoTrocas || carregandoMembros || carregandoSabados) return <Loading />

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <h1>Minhas datas</h1>

      {recebidas.length > 0 && (
        <section>
          <h2 className="mb-3">Pedidos de troca para você</h2>
          <ul className="space-y-2">
            {recebidas.map((t) => (
              <li
                key={t.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
              >
                <div className="min-w-0">
                  <p className="text-sm">
                    <span className="font-semibold">{nomeDoMembro(membros, t.solicitanteUid)}</span> quer trocar
                  </p>
                  <p className="num mt-1 text-sm">
                    você fica com {formatarDataBr(t.sabado)} · ele fica com {formatarDataBr(t.sabadoDestino)}
                  </p>
                  {t.situacao !== 'valida' && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{rotuloSituacao[t.situacao]}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {t.situacao === 'valida' && (
                    <button
                      onClick={() => responder(t, 'aceitar')}
                      disabled={respondendo === t.id}
                      className="min-h-[44px] rounded-lg bg-emerald-600 px-3 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      Aceitar
                    </button>
                  )}
                  <button
                    onClick={() => responder(t, 'recusar')}
                    disabled={respondendo === t.id}
                    className={`${botaoSecundario} disabled:opacity-50`}
                  >
                    {t.situacao === 'valida' ? 'Recusar' : 'Dispensar'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-3">Minhas próximas datas</h2>
        <ListaEscala
          sabados={minhasDatas}
          membros={membros}
          meuUid={user.uid}
          vazio="Você não está escalado em nenhuma data futura."
          acoes={(s) =>
            temTrocaPendente(trocas, s.id) ? (
              <span className="text-xs text-slate-500 dark:text-slate-400">Troca pedida</span>
            ) : (
              <button onClick={() => pedido.abrir(s)} className={botaoSecundario}>
                Pedir troca
              </button>
            )
          }
        />
      </section>

      <section>
        <h2 className="mb-3">Não posso nestes sábados</h2>
        <form onSubmit={adicionarIndisponibilidade} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="data" className="mb-1 block text-sm font-medium">
              Sábado
            </label>
            <input
              id="data"
              type="date"
              min={hoje}
              required
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3 dark:border-slate-600 dark:bg-slate-900"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="motivo" className="mb-1 block text-sm font-medium">
              Motivo (opcional)
            </label>
            <input
              id="motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3 dark:border-slate-600 dark:bg-slate-900"
            />
          </div>
          <button
            type="submit"
            disabled={enviando}
            className="min-h-[44px] rounded-lg bg-indigo-600 px-4 font-semibold text-white disabled:opacity-50"
          >
            Adicionar
          </button>
        </form>

        <ul className="mt-3 space-y-2">
          {indisponibilidades.length === 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400">Nenhuma indisponibilidade marcada.</p>
          )}
          {[...indisponibilidades]
            .sort((a, b) => a.data.localeCompare(b.data))
            .map((i) => (
              <li
                key={i.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800"
              >
                <span>
                  <span className="num">{formatarDataBr(i.data)}</span> {i.motivo && `— ${i.motivo}`}
                  {i.data < hoje && <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">(passou)</span>}
                </span>
                <button
                  onClick={() => remover(i.id)}
                  aria-label={`Remover ${formatarDataBr(i.data)}`}
                  className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                >
                  <IconX size={18} />
                </button>
              </li>
            ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3">Pedidos que enviei</h2>
        {enviadas.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Nenhum pedido enviado.</p>
        ) : (
          <ul className="space-y-2">
            {enviadas.map((t) => (
              <li
                key={t.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800"
              >
                <span className="min-w-0">
                  <span className="num">{formatarDataBr(t.sabado)}</span>
                  {t.sabadoDestino && (
                    <>
                      {' '}⇄ <span className="num">{formatarDataBr(t.sabadoDestino)}</span>
                    </>
                  )}{' '}
                  com {nomeDoMembro(membros, t.destinatarioUid)}
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {rotuloSituacao[t.situacao] || t.situacao}
                  </span>
                  {t.status === 'pendente' && (
                    <button
                      onClick={() => responder(t, 'cancelar')}
                      disabled={respondendo === t.id}
                      className={`${botaoSecundario} disabled:opacity-50`}
                    >
                      Cancelar
                    </button>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ModalTroca
        key={pedido.sabadoOferecido?.id || 'fechado'}
        aberto={!!pedido.sabadoOferecido}
        onClose={pedido.fechar}
        sabado={pedido.sabadoOferecido}
        sabados={sabados}
        membros={membros}
        meuUid={user.uid}
        onConfirmar={pedido.enviar}
      />
    </div>
  )
}
