import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSabados } from '../hooks/useSabados'
import { useMembros } from '../hooks/useMembros'
import { useTrocas } from '../hooks/useTrocas'
import { usePedidoTroca } from '../hooks/usePedidoTroca'
import { formatarDataBr, hojeIso } from '../utils/datas'
import { situacaoTroca } from '../services/trocasRegras'
import CardProximoSabado from '../components/CardProximoSabado'
import ListaEscala from '../components/ListaEscala'
import ModalTroca from '../components/ModalTroca'
import Loading from '../components/Loading'

export default function Home() {
  const { user } = useAuth()
  const { sabados, carregando: carregandoSabados } = useSabados()
  const { membros, carregando: carregandoMembros } = useMembros()
  const { trocas, carregando: carregandoTrocas } = useTrocas()
  const pedido = usePedidoTroca(user.uid, trocas)

  const hoje = hojeIso()
  const futuros = useMemo(
    () => sabados.filter((s) => s.status !== 'cancelado' && s.id >= hoje).sort((a, b) => a.id.localeCompare(b.id)),
    [sabados, hoje],
  )
  const proximo = futuros[0] || null
  const seguintes = futuros.slice(1, 5)
  const minhaProxima = futuros.find((s) => s.responsavelUid === user.uid && s.status === 'agendado')

  const trocasParaResponder = useMemo(() => {
    const porId = new Map(sabados.map((s) => [s.id, s]))
    return trocas.filter(
      (t) => t.destinatarioUid === user.uid && situacaoTroca(t, porId, hoje) === 'valida',
    ).length
  }, [trocas, sabados, user.uid, hoje])

  if (carregandoSabados || carregandoMembros || carregandoTrocas) return <Loading />

  const souResponsavel = proximo?.responsavelUid === user.uid

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {trocasParaResponder > 0 && (
        <Link
          to="/minhas-datas"
          className="flex min-h-[44px] items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-400"
        >
          <span>
            {trocasParaResponder === 1
              ? 'Um colega pediu para trocar de data com você.'
              : `${trocasParaResponder} pedidos de troca esperam sua resposta.`}
          </span>
          <span className="font-semibold underline underline-offset-4">Responder</span>
        </Link>
      )}

      <CardProximoSabado
        sabado={proximo}
        membros={membros}
        souResponsavel={souResponsavel}
        onTrocar={souResponsavel && proximo.status === 'agendado' ? () => pedido.abrir(proximo) : null}
      />

      {!souResponsavel && minhaProxima && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Sua próxima vez: <span className="num font-semibold text-slate-900 dark:text-slate-100">{formatarDataBr(minhaProxima.id)}</span>.{' '}
          <Link to="/minhas-datas" className="text-indigo-600 underline underline-offset-4 dark:text-indigo-400">
            Ver minhas datas
          </Link>
        </p>
      )}

      <div>
        <h2 className="mb-3">Próximos sábados</h2>
        <ListaEscala sabados={seguintes} membros={membros} meuUid={user.uid} />
      </div>

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
