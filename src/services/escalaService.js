import { doc, serverTimestamp, writeBatch } from 'firebase/firestore'
import { db } from '../firebase'
import { proximosSabados } from '../utils/datas'

/**
 * Próximos sábados livres (que ainda não existem na escala), em ordem cronológica.
 */
export function sabadosLivres(sabadosExistentes, qtd = 8) {
  const idsExistentes = new Set(sabadosExistentes.map((s) => s.id))
  return proximosSabados(qtd + sabadosExistentes.length)
    .filter((d) => !idsExistentes.has(d))
    .slice(0, qtd)
}

/**
 * Descobre, a partir da escala já salva, quem já levou no ciclo em andamento.
 * Um ciclo termina quando todos os membros aprovados já levaram uma vez; aí o
 * conjunto zera e um novo ciclo começa. Quem entra no grupo no meio do ciclo
 * não está no conjunto, então passa a fazer parte do sorteio automaticamente.
 */
function estadoDoCiclo(uidsAprovados, sabadosExistentes) {
  const noCiclo = new Set()
  let ultimoResponsavel = null
  const ordenados = sabadosExistentes
    .filter((s) => s.status !== 'cancelado' && s.responsavelUid)
    .sort((a, b) => a.id.localeCompare(b.id))

  for (const s of ordenados) {
    ultimoResponsavel = s.responsavelUid
    if (!uidsAprovados.has(s.responsavelUid)) continue
    noCiclo.add(s.responsavelUid)
    if (noCiclo.size >= uidsAprovados.size) noCiclo.clear()
  }
  return { noCiclo, ultimoResponsavel }
}

function sortear(lista, aleatorio) {
  return lista[Math.floor(aleatorio() * lista.length)]
}

/**
 * Gera a escala para os próximos N sábados em ciclos de sorteio: em cada ciclo
 * todo membro aprovado leva uma vez, em ordem sorteada, e ninguém repete antes
 * de todos terem levado (ABC, ACB… nunca ABAC); ao completar o ciclo, um novo
 * sorteio começa com todos. Respeita indisponibilidades e, na virada do ciclo,
 * evita que o último do ciclo anterior seja o primeiro do próximo.
 *
 * @param {Array} membros - membros aprovados [{ uid, nome }]
 * @param {Array} sabadosExistentes - sábados já salvos [{ id, responsavelUid, status }]
 * @param {Array} indisponibilidades - [{ uid, data }]
 * @param {number} qtd - quantidade de sábados a gerar
 * @param {() => number} aleatorio - fonte de aleatoriedade (injetável em testes)
 * @returns {Array} novos sábados a criar [{ id, responsavelUid }]
 */
export function calcularNovaEscala(
  membros,
  sabadosExistentes,
  indisponibilidades,
  qtd = 8,
  aleatorio = Math.random,
) {
  const uids = membros.map((m) => m.uid)
  const aprovados = new Set(uids)

  const indisponivelPorData = new Map()
  for (const ind of indisponibilidades) {
    if (!indisponivelPorData.has(ind.data)) indisponivelPorData.set(ind.data, new Set())
    indisponivelPorData.get(ind.data).add(ind.uid)
  }

  const { noCiclo, ultimoResponsavel: ultimoSalvo } = estadoDoCiclo(aprovados, sabadosExistentes)
  let ultimoResponsavel = ultimoSalvo

  const novos = []
  for (const data of sabadosLivres(sabadosExistentes, qtd)) {
    const indisponiveisHoje = indisponivelPorData.get(data) || new Set()
    const disponiveis = uids.filter((uid) => !indisponiveisHoje.has(uid))

    // só entra no sorteio quem ainda não levou neste ciclo: ninguém repete antes de todos levarem.
    // Se todos os que faltam estão indisponíveis nesta data, ela fica sem responsável
    // (o admin resolve) em vez de repetir alguém.
    let candidatos = disponiveis.filter((uid) => !noCiclo.has(uid))

    const semRepeticao = candidatos.filter((uid) => uid !== ultimoResponsavel)
    if (semRepeticao.length > 0) candidatos = semRepeticao

    const escolhido = candidatos.length > 0 ? sortear(candidatos, aleatorio) : null
    novos.push({ id: data, responsavelUid: escolhido })
    ultimoResponsavel = escolhido

    if (escolhido) {
      noCiclo.add(escolhido)
      if (noCiclo.size >= aprovados.size) noCiclo.clear()
    }
  }

  return novos
}

export async function salvarNovaEscala(novosSabados) {
  const batch = writeBatch(db)
  for (const s of novosSabados) {
    const ref = doc(db, 'sabados', s.id)
    batch.set(ref, {
      data: s.id,
      responsavelUid: s.responsavelUid,
      status: 'agendado',
      descricaoLanche: '',
      entregueEm: null,
      atualizadoEm: serverTimestamp(),
    })
  }
  await batch.commit()
}

export async function gerarEscala({ membros, sabadosExistentes, indisponibilidades, qtd = 8 }) {
  const novos = calcularNovaEscala(membros, sabadosExistentes, indisponibilidades, qtd)
  await salvarNovaEscala(novos)
  return novos
}

/**
 * Apaga sábados da escala. Com `apartirDe` (yyyy-MM-dd) apaga só a partir dessa data,
 * preservando o histórico; sem ele, apaga todos.
 */
export async function apagarEscala(sabados, { apartirDe } = {}) {
  const alvo = sabados.filter((s) => !apartirDe || s.id >= apartirDe)
  for (let i = 0; i < alvo.length; i += 400) {
    const batch = writeBatch(db)
    for (const s of alvo.slice(i, i + 400)) batch.delete(doc(db, 'sabados', s.id))
    await batch.commit()
  }
  return alvo.length
}
