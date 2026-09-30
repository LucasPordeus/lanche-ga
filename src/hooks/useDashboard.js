import { useMemo, useState } from 'react'
import { useMembros } from './useMembros'
import { useSabados } from './useSabados'
import { useIndisponibilidades } from './useIndisponibilidades'
import { useTrocas } from './useTrocas'
import { useAtividadesRecentes } from './useAtividadesRecentes'
import {
  calcularKpis,
  gerarAlertas,
  metricasPorMembro,
  rankingPorMembro,
  sabadosPorMes,
} from '../services/metricasService'
import { hojeIso } from '../utils/datas'

export function useDashboard() {
  const [periodo, setPeriodo] = useState('3meses')
  const { membros, carregando: carregandoMembros, erro: erroMembros } = useMembros()
  const { sabados, carregando: carregandoSabados, erro: erroSabados } = useSabados()
  const {
    indisponibilidades,
    carregando: carregandoIndisponibilidades,
    erro: erroIndisponibilidades,
  } = useIndisponibilidades()
  const { trocas, carregando: carregandoTrocas, erro: erroTrocas } = useTrocas()
  const { atividades, carregando: carregandoAtividades, erro: erroAtividades } =
    useAtividadesRecentes(10)

  const carregando =
    carregandoMembros || carregandoSabados || carregandoIndisponibilidades || carregandoTrocas
  const erro = erroMembros || erroSabados || erroIndisponibilidades || erroTrocas || erroAtividades

  const hoje = hojeIso()

  const kpis = useMemo(
    () => calcularKpis(membros, sabados, trocas, hoje),
    [membros, sabados, trocas, hoje],
  )
  const alertas = useMemo(
    () => gerarAlertas(membros, sabados, indisponibilidades, hoje),
    [membros, sabados, indisponibilidades, hoje],
  )
  const ranking = useMemo(
    () => rankingPorMembro(membros, sabados, periodo, hoje),
    [membros, sabados, periodo, hoje],
  )
  const porMes = useMemo(
    () => sabadosPorMes(sabados, periodo, hoje),
    [sabados, periodo, hoje],
  )
  const tabelaMembros = useMemo(
    () => metricasPorMembro(membros, sabados, indisponibilidades, trocas, hoje),
    [membros, sabados, indisponibilidades, trocas, hoje],
  )

  return {
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
    carregandoAtividades,
    membros,
    sabados,
    indisponibilidades,
  }
}
