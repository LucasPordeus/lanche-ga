const estilos = {
  agendado: 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400',
  sem_confirmacao: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  entregue: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  nao_entregue: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  cancelado: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
}

const rotulos = {
  agendado: 'Agendado',
  sem_confirmacao: 'Sem confirmação',
  entregue: 'Entregue',
  nao_entregue: 'Não entregue',
  cancelado: 'Cancelado',
}

/** Sábado já passado que continua "agendado" ainda espera o admin confirmar. */
export function statusExibido(sabado, hoje) {
  if (sabado.status === 'agendado' && sabado.id < hoje && sabado.responsavelUid) {
    return 'sem_confirmacao'
  }
  return sabado.status
}

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${estilos[status] || estilos.agendado}`}
    >
      {rotulos[status] || status}
    </span>
  )
}
