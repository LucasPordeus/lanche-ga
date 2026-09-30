import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useSabados } from '../../hooks/useSabados'
import { useMembros } from '../../hooks/useMembros'
import { useIndisponibilidades } from '../../hooks/useIndisponibilidades'
import { apagarEscala, gerarEscala, sabadosLivres, salvarNovaEscala } from '../../services/escalaService'
import { atribuirResponsavel, cancelarSabado, reabrirSabado } from '../../services/sabadosService'
import { useAuth } from '../../contexts/AuthContext'
import { formatarDataBr, hojeIso } from '../../utils/datas'
import { nomeDoMembro } from '../../utils/membros'
import StatusBadge from '../../components/StatusBadge'
import ModalAtribuir from '../../components/ModalAtribuir'
import BottomSheet from '../../components/BottomSheet'
import ModalEscalaManual from '../../components/ModalEscalaManual'
import Loading from '../../components/Loading'

export default function GerenciarEscala() {
  const { user } = useAuth()
  const { sabados, carregando: carregandoSabados } = useSabados()
  const { membros, carregando: carregandoMembros } = useMembros()
  const { indisponibilidades, carregando: carregandoIndisponibilidades } = useIndisponibilidades()
  const [qtd, setQtd] = useState(8)
  const [gerando, setGerando] = useState(false)
  const [sabadoEditando, setSabadoEditando] = useState(null)
  const [montandoManual, setMontandoManual] = useState(false)
  const [apagando, setApagando] = useState(false)
  const [confirmandoApagar, setConfirmandoApagar] = useState(false)

  const hoje = hojeIso()
  const futuros = useMemo(
    () => sabados.filter((s) => s.id >= hoje).sort((a, b) => a.id.localeCompare(b.id)),
    [sabados, hoje],
  )

  const carregando = carregandoSabados || carregandoMembros || carregandoIndisponibilidades
  if (carregando) return <Loading />

  const aprovados = membros.filter((m) => m.status === 'aprovado')

  async function aoGerar() {
    setGerando(true)
    try {
      const novos = await gerarEscala({
        membros: aprovados,
        sabadosExistentes: sabados,
        indisponibilidades,
        qtd: Number(qtd) || 8,
      })
      toast.success(`${novos.length} sábado(s) gerado(s).`)
    } catch {
      toast.error('Não foi possível gerar a escala.')
    } finally {
      setGerando(false)
    }
  }

  async function aoSalvarManual(novos) {
    try {
      await salvarNovaEscala(novos)
      toast.success(`${novos.length} sábado(s) criado(s).`)
    } catch {
      toast.error('Não foi possível salvar a escala.')
      throw new Error('falha ao salvar')
    }
  }

  async function aoApagar(somenteFuturos) {
    setApagando(true)
    try {
      const total = await apagarEscala(sabados, somenteFuturos ? { apartirDe: hoje } : {})
      toast.success(`${total} sábado(s) apagado(s).`)
      setConfirmandoApagar(false)
    } catch {
      toast.error('Não foi possível apagar a escala.')
    } finally {
      setApagando(false)
    }
  }

  async function aoAtribuir(responsavelUid) {
    try {
      await atribuirResponsavel(sabadoEditando.id, responsavelUid || null)
      toast.success('Responsável atualizado.')
    } catch {
      toast.error('Não foi possível atualizar.')
    }
  }

  async function aoAlternarCancelamento(s) {
    try {
      if (s.status === 'cancelado') await reabrirSabado(s.id)
      else await cancelarSabado(s.id, user.uid)
    } catch {
      toast.error('Não foi possível atualizar o sábado.')
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-xl font-bold">Gerenciar escala</h1>

      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div>
          <label htmlFor="qtd" className="mb-1 block text-sm font-medium">
            Quantidade de sábados a gerar
          </label>
          <input
            id="qtd"
            type="number"
            min={1}
            max={26}
            value={qtd}
            onChange={(e) => setQtd(e.target.value)}
            className="w-28 min-h-[44px] rounded-lg border border-slate-300 px-3 dark:border-slate-600 dark:bg-slate-900"
          />
        </div>
        <button
          onClick={aoGerar}
          disabled={gerando}
          className="min-h-[44px] rounded-lg bg-indigo-600 px-4 font-semibold text-white disabled:opacity-50"
        >
          {gerando ? 'Gerando…' : 'Sortear próximos sábados'}
        </button>
        <button
          onClick={() => setMontandoManual(true)}
          className="min-h-[44px] rounded-lg border border-indigo-600 px-4 font-semibold text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
        >
          Montar manualmente
        </button>
        <button
          onClick={() => setConfirmandoApagar(true)}
          disabled={sabados.length === 0}
          className="min-h-[44px] rounded-lg border border-red-500 px-4 font-semibold text-red-600 disabled:opacity-40 dark:text-red-400"
        >
          Apagar escala
        </button>
      </div>

      <div className="flex justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Sábados futuros
        </h2>
      </div>

      {futuros.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-600">
          Nenhum sábado futuro. Gere a escala acima.
        </p>
      ) : (
        <ul className="space-y-2">
          {futuros.map((s) => (
            <li
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="min-w-0">
                <p className="font-semibold">{formatarDataBr(s.id)}</p>
                <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                  {nomeDoMembro(membros, s.responsavelUid)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={s.status} />
                <button
                  onClick={() => setSabadoEditando(s)}
                  className="min-h-[40px] rounded-lg border border-slate-300 px-3 text-xs font-semibold dark:border-slate-600"
                >
                  Editar responsável
                </button>
                <button
                  onClick={() => aoAlternarCancelamento(s)}
                  className="min-h-[40px] rounded-lg border border-slate-300 px-3 text-xs font-semibold dark:border-slate-600"
                >
                  {s.status === 'cancelado' ? 'Reabrir' : 'Cancelar sábado'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <BottomSheet
        aberto={confirmandoApagar}
        onClose={() => setConfirmandoApagar(false)}
        titulo="Apagar escala"
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Esta ação não pode ser desfeita. Há {sabados.length} sábado(s) na escala,
            {' '}{futuros.length} deles futuro(s).
          </p>
          <button
            onClick={() => aoApagar(true)}
            disabled={apagando || futuros.length === 0}
            className="min-h-[44px] w-full rounded-lg bg-red-600 px-4 font-semibold text-white disabled:opacity-50"
          >
            Apagar só os sábados futuros ({futuros.length})
          </button>
          <button
            onClick={() => aoApagar(false)}
            disabled={apagando}
            className="min-h-[44px] w-full rounded-lg border border-red-500 px-4 font-semibold text-red-600 disabled:opacity-50 dark:text-red-400"
          >
            Apagar tudo, inclusive o histórico ({sabados.length})
          </button>
        </div>
      </BottomSheet>

      <ModalEscalaManual
        aberto={montandoManual}
        onClose={() => setMontandoManual(false)}
        datas={sabadosLivres(sabados, Number(qtd) || 8)}
        membros={aprovados}
        indisponibilidades={indisponibilidades}
        onSalvar={aoSalvarManual}
      />

      <ModalAtribuir
        key={sabadoEditando?.id || 'fechado'}
        aberto={!!sabadoEditando}
        onClose={() => setSabadoEditando(null)}
        sabado={sabadoEditando}
        membros={aprovados}
        onConfirmar={aoAtribuir}
      />
    </div>
  )
}
