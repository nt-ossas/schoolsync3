import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import "./accessi.css"

export function Andamento({ data }) {
  const media = data?.length
    ? Math.round((data.reduce((sum, d) => sum + Number(d.voto), 0) / data.length) * 100) / 100
    : null

  return (
    <div>
      <ResponsiveContainer width="100%" height={300} className='graph'>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="id"
            tick={false}
            axisLine={false}
          />
          <YAxis tick={{ fontSize: 12 }} domain={[1, 10]} />
          <Tooltip content={<CustomTooltip />} />

          {media !== null && (
            <ReferenceLine
              y={media}
              stroke="var(--accent)"
              strokeWidth={2}
              label={{
                value: `Media ${media.toFixed(2)}`,
                position: 'insideTopRight',
                fontSize: 12,
                fill: 'var(--text-secondary)',
              }}
            />
          )}

          <Line
            type="monotone"
            dataKey="voto"
            stroke="var(--primary)"
            strokeWidth={2}
            dot={(props) => <CustomDot {...props} />}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function getColor(voto, peso) {
  if (Number(peso) <= 0) return "var(--primary)"
  if (voto < 5) return "var(--danger)"
  if (voto < 6) return "var(--color-warning)"
  return "var(--color-success)"
}

function CustomDot(props) {
  const { cx, cy, payload } = props
  const color = getColor(payload.voto, payload.peso)
  return <circle cx={cx} cy={cy} r={4} fill={color} stroke={color} strokeWidth={1} />
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null

  const voto = payload[0].value
  const peso = payload[0].payload.peso
  const color = getColor(voto, peso)

  return (
    <div style={{
      background: 'var(--surface-elevated)',
      border: `1px solid ${color}`,
      borderRadius: '8px',
      padding: '8px 14px',
      fontSize: '13px',
      color: 'var(--text-main)',
    }}>
      <p style={{ margin: 0, fontWeight: 500, color }}>{voto}</p>
    </div>
  )
}