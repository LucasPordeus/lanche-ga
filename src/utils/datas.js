import { addDays, format, isBefore, isSameDay, nextSaturday, parseISO, startOfDay } from 'date-fns'

export const FORMATO_ID = 'yyyy-MM-dd'

export function proximosSabados(qtd = 8, base = new Date()) {
  const lista = []
  const hoje = startOfDay(base)
  let atual = hoje.getDay() === 6 ? hoje : nextSaturday(hoje)
  for (let i = 0; i < qtd; i++) {
    lista.push(format(atual, FORMATO_ID))
    atual = addDays(atual, 7)
  }
  return lista
}

export function formatarDataBr(dataIso) {
  if (!dataIso) return ''
  return format(parseISO(dataIso), 'dd/MM/yyyy')
}

export function ehDataPassada(dataIso, referencia = new Date()) {
  return isBefore(parseISO(dataIso), startOfDay(referencia))
}

export function ehHoje(dataIso, referencia = new Date()) {
  return isSameDay(parseISO(dataIso), referencia)
}

export function hojeIso(base = new Date()) {
  return format(startOfDay(base), FORMATO_ID)
}
