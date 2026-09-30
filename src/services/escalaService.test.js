import { describe, expect, it } from 'vitest'
import { calcularNovaEscala, sabadosLivres } from './escalaService'

const membros = [
  { uid: 'a', nome: 'Ana' },
  { uid: 'b', nome: 'Bruno' },
  { uid: 'c', nome: 'Carla' },
]

function contar(novos) {
  const contagem = {}
  for (const n of novos) contagem[n.responsavelUid] = (contagem[n.responsavelUid] || 0) + 1
  return contagem
}

describe('calcularNovaEscala', () => {
  it('em cada ciclo todos os membros levam exatamente uma vez', () => {
    const novos = calcularNovaEscala(membros, [], [], 6)
    expect(Object.values(contar(novos))).toEqual([2, 2, 2])
    expect(new Set(novos.slice(0, 3).map((n) => n.responsavelUid)).size).toBe(3)
    expect(new Set(novos.slice(3, 6).map((n) => n.responsavelUid)).size).toBe(3)
  })

  it('sorteia de novo a cada ciclo completo', () => {
    let i = 0
    const sequencia = [0, 0, 0, 0.99, 0, 0]
    const novos = calcularNovaEscala(membros, [], [], 6, () => sequencia[i++ % sequencia.length])
    const ciclo1 = novos.slice(0, 3).map((n) => n.responsavelUid)
    const ciclo2 = novos.slice(3, 6).map((n) => n.responsavelUid)
    expect(ciclo1).not.toEqual(ciclo2)
  })

  it('continua o ciclo em andamento a partir da escala já salva', () => {
    const existentes = [
      { id: '2000-01-01', responsavelUid: 'a', status: 'entregue' },
      { id: '2000-01-08', responsavelUid: 'b', status: 'entregue' },
    ]
    const novos = calcularNovaEscala(membros, existentes, [], 1)
    expect(novos[0].responsavelUid).toBe('c')
  })

  it('membro novo entra automaticamente no ciclo em andamento', () => {
    const existentes = [
      { id: '2000-01-01', responsavelUid: 'a', status: 'entregue' },
      { id: '2000-01-08', responsavelUid: 'b', status: 'entregue' },
      { id: '2000-01-15', responsavelUid: 'c', status: 'entregue' },
    ]
    // a, b e c já levaram; com o novo membro o ciclo de 4 ainda está aberto, então ele leva primeiro
    const comNovo = [...membros, { uid: 'd', nome: 'Davi' }]
    const novos = calcularNovaEscala(comNovo, existentes, [], 4)
    expect(novos[0].responsavelUid).toBe('d')

    // ciclo incompleto: o novo membro ainda precisa levar neste mesmo ciclo
    const parcial = existentes.slice(0, 2)
    const restantes = calcularNovaEscala(comNovo, parcial, [], 2)
    expect(new Set(restantes.map((n) => n.responsavelUid))).toEqual(new Set(['c', 'd']))
  })

  it('ignora sábados cancelados ao contar o ciclo', () => {
    const existentes = [
      { id: '2000-01-01', responsavelUid: 'a', status: 'cancelado' },
      { id: '2000-01-08', responsavelUid: 'b', status: 'entregue' },
    ]
    const novos = calcularNovaEscala(membros, existentes, [], 2)
    expect(new Set(novos.map((n) => n.responsavelUid))).toEqual(new Set(['a', 'c']))
  })

  it('nunca escala alguém com indisponibilidade na mesma data', () => {
    const [primeira] = sabadosLivres([], 1)
    const indisponibilidades = [
      { uid: 'a', data: primeira },
      { uid: 'b', data: primeira },
    ]
    const novos = calcularNovaEscala(membros, [], indisponibilidades, 1)
    expect(novos[0].responsavelUid).toBe('c')
  })

  it('deixa responsavelUid nulo quando ninguém está disponível', () => {
    const [primeira] = sabadosLivres([], 1)
    const indisponibilidades = membros.map((m) => ({ uid: m.uid, data: primeira }))
    const resultado = calcularNovaEscala(membros, [], indisponibilidades, 1)
    expect(resultado[0].responsavelUid).toBeNull()
  })

  it('nunca repete alguém antes de todos levarem, mesmo com indisponibilidades', () => {
    const datas = sabadosLivres([], 6)
    // Ana e Bruno indisponíveis na 3ª data: só Carla poderia, mas ela já levou
    const indisponibilidades = [
      { uid: 'a', data: datas[2] },
      { uid: 'b', data: datas[2] },
    ]
    for (let i = 0; i < 50; i++) {
      const novos = calcularNovaEscala(membros, [], indisponibilidades, 6)
      let ciclo = new Set()
      for (const { responsavelUid: uid } of novos) {
        if (!uid) continue
        expect(ciclo.has(uid)).toBe(false)
        ciclo.add(uid)
        if (ciclo.size === membros.length) ciclo = new Set()
      }
    }
  })

  it('ignora sábados que já existem na escala', () => {
    const [primeira] = sabadosLivres([], 1)
    const existentes = [{ id: primeira, responsavelUid: 'a', status: 'agendado' }]
    const resultado = calcularNovaEscala(membros, existentes, [], 3)
    expect(resultado.some((n) => n.id === primeira)).toBe(false)
    expect(resultado).toHaveLength(3)
  })
})
