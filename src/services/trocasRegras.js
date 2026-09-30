// Regras puras de troca, sem Firebase, para poder testar e reutilizar na interface.
//
// Uma troca é sempre entre duas datas: o solicitante oferece o sábado dele
// (`sabado`) e pede o sábado do colega (`sabadoDestino`). Se o colega aceitar,
// os dois responsáveis são invertidos — ninguém leva a mais nem a menos no ciclo.

function trocavel(s, hoje) {
  return !!s && s.status === 'agendado' && s.id >= hoje && !!s.responsavelUid
}

/** Sábados do próprio usuário que ele pode oferecer numa troca. */
export function meusSabadosTrocaveis(sabados, uid, hoje) {
  return sabados
    .filter((s) => trocavel(s, hoje) && s.responsavelUid === uid)
    .sort((a, b) => a.id.localeCompare(b.id))
}

/** Sábados de colegas aprovados que podem ser pedidos em troca de `meuSabado`. */
export function sabadosParaTrocar(sabados, membros, meuUid, meuSabadoId, hoje) {
  const aprovados = new Set(membros.filter((m) => m.status === 'aprovado').map((m) => m.uid))
  return sabados
    .filter(
      (s) =>
        trocavel(s, hoje) &&
        s.id !== meuSabadoId &&
        s.responsavelUid !== meuUid &&
        aprovados.has(s.responsavelUid),
    )
    .sort((a, b) => a.id.localeCompare(b.id))
}

/**
 * Situação atual de uma troca pendente: 'valida' se ainda pode ser aceita,
 * 'expirada' se alguma das datas já passou, 'invalida' se a escala mudou desde o pedido.
 */
export function situacaoTroca(troca, sabadosPorId, hoje) {
  if (troca.status !== 'pendente') return troca.status
  if (!troca.sabadoDestino) return 'invalida'
  const origem = sabadosPorId.get(troca.sabado)
  const destino = sabadosPorId.get(troca.sabadoDestino)
  if ((origem && origem.id < hoje) || (destino && destino.id < hoje)) return 'expirada'
  if (!trocavel(origem, hoje) || !trocavel(destino, hoje)) return 'invalida'
  if (origem.responsavelUid !== troca.solicitanteUid) return 'invalida'
  if (destino.responsavelUid !== troca.destinatarioUid) return 'invalida'
  return 'valida'
}

/** Já existe troca pendente oferecendo este sábado? Evita pedidos duplicados. */
export function temTrocaPendente(trocas, sabadoId) {
  return trocas.some((t) => t.status === 'pendente' && t.sabado === sabadoId)
}
