import { describe, expect, it } from 'vitest'
import {
  calcularKpis,
  gerarAlertas,
  metricasPorMembro,
  rankingPorMembro,
  sabadosPorMes,
} from './metricasService'

const hoje = '2026-06-13'

const membros = [
  { uid: 'a', nome: 'Ana', status: 'aprovado' },
  { uid: 'b', nome: 'Bruno', status: 'aprovado' },
  { uid: 'c', nome: 'Carla', status: 'pendente' },
]

describe('calcularKpis', () => {
  it('retorna zeros e null para conjunto vazio', () => {
    const kpis = calcularKpis([], [], [], hoje)
    expect(kpis.membrosAprovados).toBe(0)
    expect(kpis.proximoSabado).toBeNull()
    expect(kpis.taxaCumprimento).toBeNull()
  })

  it('calcula contagens de membros, próximo sábado e taxa de cumprimento', () => {
    const sabados = [
      { id: '2026-06-06', status: 'entregue', responsavelUid: 'a' },
      { id: '2026-06-13', status: 'agendado', responsavelUid: 'b' },
      { id: '2026-05-30', status: 'nao_entregue', responsavelUid: 'a' },
      { id: '2026-05-23', status: 'cancelado', responsavelUid: null },
      { id: '2026-05-16', status: 'agendado', responsavelUid: 'b' },
    ]
    const kpis = calcularKpis(membros, sabados, [], hoje)
    expect(kpis.membrosAprovados).toBe(2)
    expect(kpis.membrosPendentes).toBe(1)
    expect(kpis.proximoSabado.id).toBe('2026-06-13')
    // 1 entregue / (1 entregue + 1 não entregue); o sem confirmação não entra na taxa
    expect(kpis.taxaCumprimento).toBe(0.5)
    expect(kpis.naoEntregues).toBe(1)
    expect(kpis.aguardandoConfirmacao).toBe(1)
  })

  it('ignora sábados cancelados no cálculo da taxa', () => {
    const sabados = [
      { id: '2026-05-30', status: 'cancelado', responsavelUid: 'a' },
      { id: '2026-05-23', status: 'entregue', responsavelUid: 'a' },
    ]
    const kpis = calcularKpis(membros, sabados, [], hoje)
    expect(kpis.taxaCumprimento).toBe(1)
  })
})

describe('gerarAlertas', () => {
  it('avisa sábado futuro com responsável inativo', () => {
    const sabados = [{ id: '2026-06-20', status: 'agendado', responsavelUid: 'c' }]
    const alertas = gerarAlertas(membros, sabados, [], hoje)
    expect(alertas.find((a) => a.tipo === 'responsavel_inativo')?.sabados).toEqual(['2026-06-20'])
  })

  it('não gera alertas quando tudo está em ordem', () => {
    const sabados = Array.from({ length: 4 }, (_, i) => ({
      id: `2026-06-${13 + i * 7}`,
      status: 'agendado',
      responsavelUid: 'a',
    }))
    const alertas = gerarAlertas(membros.filter((m) => m.status !== 'pendente'), sabados, [], hoje)
    expect(alertas.find((a) => a.tipo === 'escala_curta')).toBeUndefined()
    expect(alertas.find((a) => a.tipo === 'sem_responsavel')).toBeUndefined()
  })

  it('detecta sábado sem responsável, cadastro pendente e escala curta', () => {
    const sabados = [{ id: '2026-06-20', status: 'agendado', responsavelUid: null }]
    const alertas = gerarAlertas(membros, sabados, [], hoje)
    expect(alertas.map((a) => a.tipo)).toEqual(
      expect.arrayContaining(['sem_responsavel', 'cadastro_pendente', 'escala_curta']),
    )
  })

  it('detecta entrega não confirmada para sábado passado', () => {
    const sabados = [{ id: '2026-06-06', status: 'agendado', responsavelUid: 'a' }]
    const alertas = gerarAlertas(membros, sabados, [], hoje)
    expect(alertas.find((a) => a.tipo === 'entrega_nao_confirmada')).toBeDefined()
  })

  it('detecta conflito entre escala e indisponibilidade', () => {
    const sabados = [{ id: '2026-06-20', status: 'agendado', responsavelUid: 'a' }]
    const indisponibilidades = [{ uid: 'a', data: '2026-06-20' }]
    const alertas = gerarAlertas(membros, sabados, indisponibilidades, hoje)
    expect(alertas.find((a) => a.tipo === 'conflito_indisponibilidade')).toBeDefined()
  })
})

describe('rankingPorMembro', () => {
  it('retorna zero para todos quando não há entregas', () => {
    const ranking = rankingPorMembro(membros, [], 'tudo', hoje)
    expect(ranking.every((r) => r.total === 0)).toBe(true)
  })

  it('ordena por total de entregas desc', () => {
    const sabados = [
      { id: '2026-06-06', status: 'entregue', responsavelUid: 'a' },
      { id: '2026-05-30', status: 'entregue', responsavelUid: 'b' },
      { id: '2026-05-23', status: 'entregue', responsavelUid: 'b' },
    ]
    const ranking = rankingPorMembro(membros, sabados, 'tudo', hoje)
    expect(ranking[0]).toEqual({ uid: 'b', nome: 'Bruno', total: 2 })
  })
})

describe('sabadosPorMes', () => {
  it('retorna lista vazia para sábados vazios', () => {
    expect(sabadosPorMes([], 'tudo', hoje)).toEqual([])
  })

  it('agrupa entregues, não entregues, sem confirmação e cancelados por mês', () => {
    const sabados = [
      { id: '2026-06-06', status: 'entregue', responsavelUid: 'a' },
      { id: '2026-06-13', status: 'cancelado', responsavelUid: null },
      { id: '2026-05-30', status: 'agendado', responsavelUid: 'a' },
      { id: '2026-05-23', status: 'nao_entregue', responsavelUid: 'b' },
    ]
    const porMes = sabadosPorMes(sabados, 'tudo', hoje)
    expect(porMes).toEqual([
      { mes: '2026-05', entregues: 0, naoEntregues: 1, semConfirmacao: 1, cancelados: 0 },
      { mes: '2026-06', entregues: 1, naoEntregues: 0, semConfirmacao: 0, cancelados: 1 },
    ])
  })

  it('coloca o sábado do dia 1º no mês certo, independente do fuso', () => {
    const sabados = [{ id: '2026-08-01', status: 'entregue', responsavelUid: 'a' }]
    expect(sabadosPorMes(sabados, 'mes', '2026-08-15')).toHaveLength(1)
    expect(sabadosPorMes(sabados, 'mes', '2026-07-31')).toHaveLength(0)
  })

  it('filtra os últimos 3 meses pela data, virando o ano corretamente', () => {
    const sabados = [
      { id: '2025-10-30', status: 'entregue', responsavelUid: 'a' },
      { id: '2025-11-01', status: 'entregue', responsavelUid: 'a' },
    ]
    const porMes = sabadosPorMes(sabados, '3meses', '2026-01-31')
    expect(porMes.map((m) => m.mes)).toEqual(['2025-11'])
  })
})

describe('metricasPorMembro', () => {
  it('calcula total levado, última vez e próxima data por membro', () => {
    const sabados = [
      { id: '2026-05-30', status: 'entregue', responsavelUid: 'a' },
      { id: '2026-06-06', status: 'entregue', responsavelUid: 'a' },
      { id: '2026-06-20', status: 'agendado', responsavelUid: 'a' },
    ]
    const indisponibilidades = [{ uid: 'a', data: '2026-07-01' }]
    const trocas = [
      { solicitanteUid: 'a', destinatarioUid: 'b', status: 'aceita' },
      { solicitanteUid: 'b', destinatarioUid: 'a', status: 'aceita' },
    ]
    const linhas = metricasPorMembro(membros, sabados, indisponibilidades, trocas, hoje)
    const linhaA = linhas.find((l) => l.uid === 'a')
    expect(linhaA.totalLevado).toBe(2)
    expect(linhaA.ultimaVez).toBe('2026-06-06')
    expect(linhaA.proximaData).toBe('2026-06-20')
    expect(linhaA.totalIndisponibilidades).toBe(1)
    expect(linhaA.trocasSolicitadas).toBe(1)
    expect(linhaA.trocasAceitas).toBe(1)
  })
})
