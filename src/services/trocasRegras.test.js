import { describe, expect, it } from 'vitest'
import {
  meusSabadosTrocaveis,
  sabadosParaTrocar,
  situacaoTroca,
  temTrocaPendente,
} from './trocasRegras'

const hoje = '2026-06-13'
const membros = [
  { uid: 'a', status: 'aprovado' },
  { uid: 'b', status: 'aprovado' },
  { uid: 'c', status: 'inativo' },
]
const sabados = [
  { id: '2026-06-06', status: 'entregue', responsavelUid: 'a' },
  { id: '2026-06-13', status: 'agendado', responsavelUid: 'a' },
  { id: '2026-06-20', status: 'agendado', responsavelUid: 'b' },
  { id: '2026-06-27', status: 'agendado', responsavelUid: 'c' },
  { id: '2026-07-04', status: 'cancelado', responsavelUid: 'b' },
  { id: '2026-07-11', status: 'agendado', responsavelUid: 'a' },
]
const porId = new Map(sabados.map((s) => [s.id, s]))

describe('meusSabadosTrocaveis', () => {
  it('lista só datas futuras (ou de hoje), agendadas e do próprio usuário', () => {
    expect(meusSabadosTrocaveis(sabados, 'a', hoje).map((s) => s.id)).toEqual([
      '2026-06-13',
      '2026-07-11',
    ])
  })
})

describe('sabadosParaTrocar', () => {
  it('oferece só datas de colegas aprovados, nunca canceladas ou passadas', () => {
    const ids = sabadosParaTrocar(sabados, membros, 'a', '2026-06-13', hoje).map((s) => s.id)
    expect(ids).toEqual(['2026-06-20'])
  })
})

describe('situacaoTroca', () => {
  const base = {
    status: 'pendente',
    sabado: '2026-06-13',
    solicitanteUid: 'a',
    sabadoDestino: '2026-06-20',
    destinatarioUid: 'b',
  }

  it('é válida quando as duas datas continuam com os mesmos responsáveis', () => {
    expect(situacaoTroca(base, porId, hoje)).toBe('valida')
  })

  it('fica inválida se a escala mudou desde o pedido', () => {
    const mudou = new Map(porId)
    mudou.set('2026-06-20', { ...porId.get('2026-06-20'), responsavelUid: 'c' })
    expect(situacaoTroca(base, mudou, hoje)).toBe('invalida')
  })

  it('expira quando alguma das datas já passou', () => {
    expect(situacaoTroca(base, porId, '2026-06-14')).toBe('expirada')
  })

  it('pedido antigo sem data de destino não pode ser aceito', () => {
    expect(situacaoTroca({ ...base, sabadoDestino: undefined }, porId, hoje)).toBe('invalida')
  })

  it('mantém o status de trocas já respondidas', () => {
    expect(situacaoTroca({ ...base, status: 'aceita' }, porId, hoje)).toBe('aceita')
  })
})

describe('temTrocaPendente', () => {
  it('detecta pedido pendente para a mesma data', () => {
    const trocas = [{ status: 'pendente', sabado: '2026-06-13' }, { status: 'recusada', sabado: '2026-07-11' }]
    expect(temTrocaPendente(trocas, '2026-06-13')).toBe(true)
    expect(temTrocaPendente(trocas, '2026-07-11')).toBe(false)
  })
})
