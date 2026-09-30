import { hojeIso } from '../utils/datas'

// Compara datas como texto yyyy-MM-dd: `new Date('2026-10-03')` é meia-noite UTC,
// que no Brasil ainda é o dia anterior e jogava sábados no mês errado.
function mesesAtras(hoje, n) {
  const [ano, mes] = hoje.split('-').map(Number)
  const total = ano * 12 + (mes - 1) - n
  const m = String((total % 12) + 1).padStart(2, '0')
  return `${Math.floor(total / 12)}-${m}-${hoje.slice(8, 10)}`
}

function dentroDoPeriodo(dataIso, periodo, hoje) {
  if (periodo === 'mes') return dataIso.slice(0, 7) === hoje.slice(0, 7)
  if (periodo === '3meses') return dataIso >= mesesAtras(hoje, 3) && dataIso <= hoje
  if (periodo === 'ano') return dataIso.slice(0, 4) === hoje.slice(0, 4)
  return true
}

const semConfirmacao = (s, hoje) => s.status === 'agendado' && s.id < hoje && !!s.responsavelUid

export function calcularKpis(membros, sabados, trocas, hoje = hojeIso()) {
  const aprovados = membros.filter((m) => m.status === 'aprovado').length
  const pendentes = membros.filter((m) => m.status === 'pendente').length
  const inativos = membros.filter((m) => m.status === 'inativo').length

  const futuros = sabados
    .filter((s) => s.status !== 'cancelado' && s.id >= hoje)
    .sort((a, b) => a.id.localeCompare(b.id))
  const proximoSabado = futuros[0] || null

  const mesAtual = hoje.slice(0, 7)
  const entreguesNoMes = sabados.filter(
    (s) => s.status === 'entregue' && s.id.slice(0, 7) === mesAtual,
  ).length

  // taxa só com sábados já confirmados pelo admin; os sem confirmação viram alerta
  const entregues = sabados.filter((s) => s.status === 'entregue').length
  const naoEntregues = sabados.filter((s) => s.status === 'nao_entregue').length
  const confirmados = entregues + naoEntregues
  const taxaCumprimento = confirmados > 0 ? entregues / confirmados : null
  const aguardandoConfirmacao = sabados.filter((s) => semConfirmacao(s, hoje)).length

  const trocasPendentes = trocas.filter((t) => t.status === 'pendente').length

  return {
    membrosAprovados: aprovados,
    membrosPendentes: pendentes,
    membrosInativos: inativos,
    proximoSabado,
    entreguesNoMes,
    taxaCumprimento,
    naoEntregues,
    aguardandoConfirmacao,
    trocasPendentes,
  }
}

export function gerarAlertas(membros, sabados, indisponibilidades, hoje = hojeIso()) {
  const alertas = []

  const semResponsavel = sabados.filter(
    (s) => s.status === 'agendado' && s.id >= hoje && !s.responsavelUid,
  )
  if (semResponsavel.length > 0) {
    alertas.push({
      tipo: 'sem_responsavel',
      mensagem: `${semResponsavel.length} sábado(s) futuro(s) sem responsável`,
      acao: 'atribuir_responsavel',
      sabados: semResponsavel.map((s) => s.id),
    })
  }

  const pendentes = membros.filter((m) => m.status === 'pendente')
  if (pendentes.length > 0) {
    alertas.push({
      tipo: 'cadastro_pendente',
      mensagem: `${pendentes.length} cadastro(s) aguardando aprovação`,
      acao: 'aprovar_membro',
      membros: pendentes.map((m) => m.uid),
    })
  }

  const passadosNaoConfirmados = sabados.filter((s) => semConfirmacao(s, hoje))
  if (passadosNaoConfirmados.length > 0) {
    alertas.push({
      tipo: 'entrega_nao_confirmada',
      mensagem: `${passadosNaoConfirmados.length} sábado(s) passado(s) sem confirmação de entrega`,
      acao: 'marcar_entregue',
      sabados: passadosNaoConfirmados.map((s) => s.id),
    })
  }

  const futurosAgendados = sabados.filter((s) => s.status === 'agendado' && s.id >= hoje)
  if (futurosAgendados.length < 4) {
    alertas.push({
      tipo: 'escala_curta',
      mensagem: `Escala com apenas ${futurosAgendados.length} sábado(s) futuro(s)`,
      acao: 'gerar_escala',
    })
  }

  const ativos = new Set(membros.filter((m) => m.status === 'aprovado').map((m) => m.uid))
  const responsavelInativo = sabados.filter(
    (s) => s.status === 'agendado' && s.id >= hoje && s.responsavelUid && !ativos.has(s.responsavelUid),
  )
  if (responsavelInativo.length > 0) {
    alertas.push({
      tipo: 'responsavel_inativo',
      mensagem: `${responsavelInativo.length} sábado(s) futuro(s) com responsável inativo ou removido`,
      acao: 'atribuir_responsavel',
      sabados: responsavelInativo.map((s) => s.id),
    })
  }

  const indisponivelPorUidEData = new Set(
    indisponibilidades.map((i) => `${i.uid}_${i.data}`),
  )
  const conflitos = sabados.filter(
    (s) =>
      s.status === 'agendado' &&
      s.id >= hoje &&
      s.responsavelUid &&
      indisponivelPorUidEData.has(`${s.responsavelUid}_${s.id}`),
  )
  if (conflitos.length > 0) {
    alertas.push({
      tipo: 'conflito_indisponibilidade',
      mensagem: `${conflitos.length} conflito(s) entre escala e indisponibilidade`,
      acao: 'atribuir_responsavel',
      sabados: conflitos.map((s) => s.id),
    })
  }

  return alertas
}

export function rankingPorMembro(membros, sabados, periodo = 'tudo', hoje = hojeIso()) {
  const contagem = new Map(membros.map((m) => [m.uid, 0]))
  for (const s of sabados) {
    if (s.status !== 'entregue' || !s.responsavelUid) continue
    if (!dentroDoPeriodo(s.id, periodo, hoje)) continue
    if (!contagem.has(s.responsavelUid)) continue
    contagem.set(s.responsavelUid, contagem.get(s.responsavelUid) + 1)
  }
  return membros
    .map((m) => ({ uid: m.uid, nome: m.nome, total: contagem.get(m.uid) || 0 }))
    .sort((a, b) => b.total - a.total)
}

export function sabadosPorMes(sabados, periodo = 'tudo', hoje = hojeIso()) {
  const meses = new Map()
  for (const s of sabados) {
    if (!dentroDoPeriodo(s.id, periodo, hoje)) continue
    const mes = s.id.slice(0, 7)
    if (!meses.has(mes)) {
      meses.set(mes, { mes, entregues: 0, naoEntregues: 0, semConfirmacao: 0, cancelados: 0 })
    }
    const bucket = meses.get(mes)
    if (s.status === 'entregue') bucket.entregues += 1
    else if (s.status === 'nao_entregue') bucket.naoEntregues += 1
    else if (s.status === 'cancelado') bucket.cancelados += 1
    else if (semConfirmacao(s, hoje)) bucket.semConfirmacao += 1
  }
  return Array.from(meses.values()).sort((a, b) => a.mes.localeCompare(b.mes))
}

export function metricasPorMembro(membros, sabados, indisponibilidades, trocas, hoje = hojeIso()) {
  return membros.map((m) => {
    const levados = sabados
      .filter((s) => s.status === 'entregue' && s.responsavelUid === m.uid)
      .sort((a, b) => b.id.localeCompare(a.id))

    const proxima = sabados
      .filter((s) => s.status === 'agendado' && s.responsavelUid === m.uid && s.id >= hoje)
      .sort((a, b) => a.id.localeCompare(b.id))[0]

    return {
      uid: m.uid,
      nome: m.nome,
      totalLevado: levados.length,
      naoEntregues: sabados.filter((s) => s.status === 'nao_entregue' && s.responsavelUid === m.uid)
        .length,
      ultimaVez: levados[0]?.id || null,
      proximaData: proxima?.id || null,
      totalIndisponibilidades: indisponibilidades.filter((i) => i.uid === m.uid).length,
      trocasSolicitadas: trocas.filter((t) => t.solicitanteUid === m.uid).length,
      trocasAceitas: trocas.filter((t) => t.destinatarioUid === m.uid && t.status === 'aceita')
        .length,
    }
  })
}
