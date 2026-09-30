import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { useDashboard } from '../../hooks/useDashboard'
import { gerarEscala } from '../../services/escalaService'
import { formatarDataBr } from '../../utils/datas'
import { nomeDoMembro } from '../../utils/membros'
import CardKpi from '../../components/dashboard/CardKpi'
import PainelAlertas from '../../components/dashboard/PainelAlertas'
import GraficoRanking from '../../components/dashboard/GraficoRanking'
import GraficoMensal from '../../components/dashboard/GraficoMensal'
import TabelaMembros from '../../components/dashboard/TabelaMembros'
import FeedAtividades from '../../components/dashboard/FeedAtividades'
import FiltroPeriodo from '../../components/dashboard/FiltroPeriodo'
import { Skeleton } from '../../components/Loading'

export default function Dashboard() {
  const navigate = useNavigate()
  const {
    carregando,
    erro,
    periodo,
    setPeriodo,
    kpis,
    alertas,
    ranking,
    porMes,
    tabelaMembros,
    atividades,
    membros,
    sabados,
    indisponibilidades,
  } = useDashboard()

  async function tratarAcaoAlerta(alerta) {
    switch (alerta.tipo) {
      case 'cadastro_pendente':
        navigate('/admin/membros')
        break
      case 'sem_responsavel':
      case 'conflito_indisponibilidade':
      case 'responsavel_inativo':
        navigate('/admin/escala')
        break
      case 'entrega_nao_confirmada':
        navigate('/historico')
        break
      case 'escala_curta':
        try {
          const aprovados = membros.filter((m) => m.status === 'aprovado')
          const novos = await gerarEscala({
            membros: aprovados,
            sabadosExistentes: sabados,
            indisponibilidades,
            qtd: 8,
          })
          toast.success(`${novos.length} sábado(s) gerado(s).`)
        } catch {
          toast.error('Não foi possível gerar a escala.')
        }
        break
      default:
        break
    }
  }

  if (erro) {
    return <p className="text-sm text-red-600">Não foi possível carregar o dashboard.</p>
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1>Painel</h1>
        <FiltroPeriodo valor={periodo} onChange={setPeriodo} />
      </div>

      {carregando ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <CardKpi label="Membros ativos" value={kpis.membrosAprovados} sublabel={`${kpis.membrosPendentes} pendentes · ${kpis.membrosInativos} inativos`} />
            <CardKpi
              label="Próximo sábado"
              value={kpis.proximoSabado ? formatarDataBr(kpis.proximoSabado.id) : '—'}
              sublabel={
                kpis.proximoSabado
                  ? nomeDoMembro(membros, kpis.proximoSabado.responsavelUid)
                  : 'Sem sábados agendados'
              }
              tom={kpis.proximoSabado?.responsavelUid ? 'neutro' : 'atencao'}
            />
            <CardKpi
              label="Taxa de cumprimento"
              value={kpis.taxaCumprimento === null ? '—' : `${Math.round(kpis.taxaCumprimento * 100)}%`}
              sublabel={`${kpis.entreguesNoMes} entregue(s) no mês · ${kpis.naoEntregues} falta(s) no total`}
              tom={kpis.taxaCumprimento !== null && kpis.taxaCumprimento < 0.7 ? 'atencao' : 'bom'}
            />
            <CardKpi
              label="Sem confirmação"
              value={kpis.aguardandoConfirmacao}
              sublabel="Sábados passados a confirmar"
              tom={kpis.aguardandoConfirmacao > 0 ? 'atencao' : 'neutro'}
            />
            <CardKpi label="Trocas pendentes" value={kpis.trocasPendentes} tom={kpis.trocasPendentes > 0 ? 'atencao' : 'neutro'} />
          </div>

          <PainelAlertas alertas={alertas} onAcao={tratarAcaoAlerta} />

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
              <h2 className="mb-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                Ranking: lanches por membro
              </h2>
              <GraficoRanking dados={ranking} />
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
              <h2 className="mb-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                Sábados por mês
              </h2>
              <GraficoMensal dados={porMes} />
            </div>
          </div>

          <div>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Membros
            </h2>
            <TabelaMembros linhas={tabelaMembros} />
          </div>

          <div>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Atividade recente
            </h2>
            <FeedAtividades atividades={atividades} />
          </div>
        </>
      )}
    </div>
  )
}
