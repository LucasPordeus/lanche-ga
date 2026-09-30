import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export default function GraficoRanking({ dados }) {
  if (dados.every((d) => d.total === 0)) {
    return (
      <p className="flex h-64 items-center justify-center text-sm text-slate-500 dark:text-slate-400">
        Nenhum dado no período
      </p>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={dados} layout="vertical" margin={{ left: 8, right: 16 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
        <YAxis
          type="category"
          dataKey="nome"
          width={90}
          tick={{ fontSize: 12 }}
          tickFormatter={(v) => (v.length > 10 ? `${v.slice(0, 10)}…` : v)}
        />
        <Tooltip />
        <Bar dataKey="total" fill="var(--color-indigo-600)" radius={[0, 2, 2, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
