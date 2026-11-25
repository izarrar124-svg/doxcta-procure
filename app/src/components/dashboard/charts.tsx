'use client'

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const ACCENT = '#b8ff3d'
const MUTED = 'rgba(232, 240, 230, 0.45)'
const GRID = 'rgba(255, 255, 255, 0.06)'
const TIP_BG = '#0f1a14'
const TIP_BORDER = 'rgba(184, 255, 61, 0.25)'

const tipStyle = {
  background: TIP_BG,
  border: `1px solid ${TIP_BORDER}`,
  borderRadius: 10,
  color: '#e8f0e6',
  fontSize: 12,
}

function Empty({ message }: { message: string }) {
  return <div className="chart-empty">{message}</div>
}

export function MonthlyTrendChart({
  data,
}: {
  data: { month: string; total: number }[]
}) {
  if (!data.length) return <Empty message="No monthly data yet." />
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ACCENT} stopOpacity={0.35} />
            <stop offset="100%" stopColor={ACCENT} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="month" stroke={MUTED} tick={{ fill: MUTED, fontSize: 11 }} />
        <YAxis stroke={MUTED} tick={{ fill: MUTED, fontSize: 11 }} width={56} />
        <Tooltip contentStyle={tipStyle} />
        <Area
          type="monotone"
          dataKey="total"
          name="Spend"
          stroke={ACCENT}
          fill="url(#spendFill)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function DeptSpendChart({
  data,
}: {
  data: { name: string; total: number }[]
}) {
  if (!data.length) return <Empty message="No spend in range." />
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid stroke={GRID} horizontal={false} />
        <XAxis type="number" stroke={MUTED} tick={{ fill: MUTED, fontSize: 11 }} />
        <YAxis
          type="category"
          dataKey="name"
          width={90}
          stroke={MUTED}
          tick={{ fill: MUTED, fontSize: 11 }}
        />
        <Tooltip contentStyle={tipStyle} />
        <Bar dataKey="total" name="Spend" fill={ACCENT} radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function TopVendorsChart({
  data,
}: {
  data: { name: string; total: number }[]
}) {
  if (!data.length) return <Empty message="No vendor invoices yet." />
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="name" stroke={MUTED} tick={{ fill: MUTED, fontSize: 11 }} />
        <YAxis stroke={MUTED} tick={{ fill: MUTED, fontSize: 11 }} width={56} />
        <Tooltip contentStyle={tipStyle} />
        <Bar dataKey="total" name="Invoiced" fill={ACCENT} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function AgingBarsChart({
  data,
}: {
  data: { label: string; total: number }[]
}) {
  if (!data.some((d) => d.total > 0)) return <Empty message="No outstanding aging buckets." />
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="label" stroke={MUTED} tick={{ fill: MUTED, fontSize: 11 }} />
        <YAxis stroke={MUTED} tick={{ fill: MUTED, fontSize: 11 }} width={56} />
        <Tooltip contentStyle={tipStyle} />
        <Bar dataKey="total" name="Outstanding" fill={ACCENT} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
