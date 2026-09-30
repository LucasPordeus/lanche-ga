export function nomeDoMembro(membros, uid) {
  if (!uid) return 'Sem responsável'
  return membros.find((m) => m.uid === uid)?.nome || 'Membro removido'
}
