import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Button } from "../components/ui"
import "./accessi.css"

const RANGES = [
  { label: '7 giorni',  giorni: 7  },
  { label: '14 giorni', giorni: 14 },
  { label: '30 giorni', giorni: 30 },
  { label: 'Di Sempre', giorni: 9999999 },
]

export function Accessi({ onRangeChange, data }) {
  const [selected, setSelected] = useState(9999999)

  function handleRange(giorni) {
    setSelected(giorni)
    onRangeChange(giorni) // dice al parent di fare fetch con il nuovo range
  }

  return (
    <div>
      <div className='flex graph-btn'>
        {RANGES.map(r => (
          <Button
            key={r.giorni}
            variant={selected == r.giorni ? "primary" : 'secondary'}
            onClick={() => handleRange(r.giorni)}
          >
            {r.label}
          </Button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={300} className='graph'>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="data"
            tick={{ fontSize: 12 }}
            interval={selected === 7 ? 0 : selected === 14 ? 1 : selected === 30 ? 4 : 'preserveStartEnd'}
          />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="accessi"
            stroke="var(--primary)"
            strokeWidth={2}
            dot={selected <= 14}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  return (
    <div style={{
      background: 'var(--surface-elevated)',
      border: '1px solid var(--border-soft)',
      borderRadius: '8px',
      padding: '8px 14px',
      fontSize: '13px',
      color: 'var(--text-main)',
    }}>
      <p style={{ margin: '0 0 4px', color: 'var(--text-secondary)' }}>{label}</p>
      <p style={{ margin: 0, fontWeight: 500 }}>
        {payload[0].value} accessi
      </p>
    </div>
  )
}