import { useMemo, useState } from 'react'
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { FORMATO_ID, formatarDataBr, hojeIso } from '../utils/datas'
import { nomeDoMembro } from '../utils/membros'
import StatusBadge, { statusExibido } from './StatusBadge'
import { IconChevronLeft, IconChevronRight } from './Icons'

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const eventos = {
  agendado: 'bg-amber-300 text-amber-900 dark:bg-amber-500/80 dark:text-slate-900',
  sem_confirmacao: 'bg-slate-500 text-white dark:bg-slate-500',
  entregue: 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-900',
  nao_entregue: 'bg-red-600 text-white dark:bg-red-500',
  cancelado: 'bg-slate-200 text-slate-500 line-through dark:bg-slate-700 dark:text-slate-400',
}

const legenda = [
  ['agendado', 'Agendado'],
  ['entregue', 'Entregue'],
  ['nao_entregue', 'Não entregue'],
  ['sem_confirmacao', 'Sem confirmação'],
]

function primeiroNome(nome) {
  return nome.split(' ')[0]
}

/**
 * Calendário mensal da escala. A coluna de sábado é mais larga e mostra o responsável;
 * tocar num sábado abre os detalhes logo abaixo do calendário.
 */
export default function CalendarioEscala({ sabados, membros, meuUid }) {
  const hoje = hojeIso()
  const porData = useMemo(() => new Map(sabados.map((s) => [s.id, s])), [sabados])

  const proximoId = useMemo(
    () => sabados.map((s) => s.id).filter((id) => id >= hoje).sort()[0] ?? null,
    [sabados, hoje],
  )

  const [mes, setMes] = useState(() => startOfMonth(proximoId ? parseISO(proximoId) : new Date()))
  const [selecionadoId, setSelecionadoId] = useState(proximoId)

  const semanas = useMemo(() => {
    const inicio = startOfWeek(startOfMonth(mes))
    const fim = endOfWeek(endOfMonth(mes))
    const lista = []
    for (let dia = inicio; dia <= fim; dia = addDays(dia, 7)) {
      lista.push(Array.from({ length: 7 }, (_, i) => addDays(dia, i)))
    }
    return lista
  }, [mes])

  const selecionado = selecionadoId ? porData.get(selecionadoId) : null
  const tituloMes = format(mes, "MMMM 'de' yyyy", { locale: ptBR })

  function mudarMes(delta) {
    setMes((m) => addMonths(m, delta))
  }

  function irParaHoje() {
    setMes(startOfMonth(proximoId ? parseISO(proximoId) : new Date()))
    setSelecionadoId(proximoId)
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-2 py-2 dark:border-slate-700">
          <button
            type="button"
            onClick={() => mudarMes(-1)}
            aria-label="Mês anterior"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <IconChevronLeft size={20} />
          </button>
          <div className="flex flex-col items-center">
            <p className="font-serif text-xl capitalize">{tituloMes}</p>
            <button
              type="button"
              onClick={irParaHoje}
              className="text-xs text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
            >
              Próximo sábado
            </button>
          </div>
          <button
            type="button"
            onClick={() => mudarMes(1)}
            aria-label="Próximo mês"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <IconChevronRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-7 border-b border-slate-200 text-center dark:border-slate-700">
          {DIAS_SEMANA.map((d, i) => (
            <div
              key={i}
              className={`py-1.5 text-xs font-medium ${
                i === 6 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {semanas.flat().map((dia, i) => {
            const id = format(dia, FORMATO_ID)
            const doMes = isSameMonth(dia, mes)
            const ehHoje = id === hoje
            const sabado = dia.getDay() === 6 ? porData.get(id) : null
            const status = sabado ? statusExibido(sabado, hoje) : null
            const meu = meuUid && sabado?.responsavelUid === meuUid
            const ativo = sabado && id === selecionadoId
            const nome = sabado?.responsavelUid ? primeiroNome(nomeDoMembro(membros, sabado.responsavelUid)) : 'Sem resp.'

            const bordas = `${i % 7 !== 6 ? 'border-r' : ''} ${i < semanas.length * 7 - 7 ? 'border-b' : ''}`
            const conteudo = (
              <>
                <span
                  className={`num mx-auto flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                    ehHoje
                      ? 'bg-indigo-600 font-semibold text-white dark:bg-indigo-400 dark:text-slate-900'
                      : doMes
                        ? 'text-slate-700 dark:text-slate-200'
                        : 'text-slate-300 dark:text-slate-600'
                  }`}
                >
                  {format(dia, 'd')}
                </span>
                {sabado && (
                  <span
                    className={`mt-1 block truncate rounded px-1 py-0.5 text-left text-[11px] leading-tight font-medium ${
                      eventos[status] || eventos.agendado
                    } ${meu ? 'ring-2 ring-indigo-500 ring-offset-1 ring-offset-white dark:ring-indigo-400 dark:ring-offset-slate-800' : ''} ${
                      doMes ? '' : 'opacity-50'
                    }`}
                  >
                    {meu ? 'Você' : nome}
                  </span>
                )}
              </>
            )

            if (!sabado) {
              return (
                <div key={id} className={`h-20 border-slate-200 p-1 dark:border-slate-700 ${bordas}`}>
                  {conteudo}
                </div>
              )
            }

            return (
              <button
                key={id}
                type="button"
                onClick={() => setSelecionadoId(id)}
                aria-pressed={ativo}
                aria-label={`${formatarDataBr(id)}: ${nomeDoMembro(membros, sabado.responsavelUid)}`}
                className={`block h-20 min-w-0 border-slate-200 p-1 dark:border-slate-700 ${bordas} ${
                  ativo ? 'bg-indigo-50 dark:bg-indigo-500/10' : 'hover:bg-slate-50 dark:hover:bg-slate-700/40'
                }`}
              >
                {conteudo}
              </button>
            )
          })}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-slate-200 px-3 py-2 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
          {legenda.map(([chave, rotulo]) => (
            <span key={chave} className="inline-flex items-center gap-1.5">
              <span className={`h-2.5 w-4 rounded-sm ${eventos[chave]}`} />
              {rotulo}
            </span>
          ))}
        </div>
      </div>

      {selecionado ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <div className="min-w-0">
            <p className="num font-medium">
              {formatarDataBr(selecionado.id)}
              {selecionado.id === hoje && (
                <span className="ml-2 font-sans text-xs text-indigo-600 dark:text-indigo-400">hoje</span>
              )}
            </p>
            <p className="truncate text-sm text-slate-500 dark:text-slate-400">
              {nomeDoMembro(membros, selecionado.responsavelUid)}
              {meuUid && selecionado.responsavelUid === meuUid && (
                <span className="ml-1 font-semibold text-indigo-600 dark:text-indigo-400">(você)</span>
              )}
            </p>
            {selecionado.descricaoLanche && (
              <p className="text-xs text-slate-500 dark:text-slate-400">{selecionado.descricaoLanche}</p>
            )}
          </div>
          <StatusBadge status={statusExibido(selecionado, hoje)} />
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500 dark:border-slate-600 dark:text-slate-400">
          {sabados.length === 0 ? 'Nenhum sábado na escala ainda.' : 'Toque em um sábado para ver os detalhes.'}
        </p>
      )}
    </div>
  )
}
