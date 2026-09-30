import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export default function GraficoMensal({ dados }) {
  if (dados.length === 0) {
    return (
      <p className="flex h-64 items-center justify-center text-sm text-slate-500 dark:text-slate-400">
        Nenhum dado no período
      </p>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={dados} margin={{ left: -20, right: 8 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="mes" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v.slice(5)}/${v.slice(2, 4)}`} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="entregues" name="Entregues" stackId="a" fill="var(--color-emerald-500)" />
        <Bar dataKey="naoEntregues" name="Não entregues" stackId="a" fill="var(--color-red-500)" />
        <Bar dataKey="semConfirmacao" name="Sem confirmação" stackId="a" fill="var(--color-amber-400)" />
        <Bar dataKey="cancelados" name="Cancelados" stackId="a" fill="var(--color-slate-300)" />
      </BarChart>
    </ResponsiveContainer>
  )
}
