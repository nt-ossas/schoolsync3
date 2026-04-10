import "./stats.css"
import { StatCard } from "../components/ui"

export function StatsGrid({ statsData }) {
  const mediaNumber = statsData.mediaGenerale === "N/D" || statsData.mediaGenerale == null ? null : Number(statsData.mediaGenerale)

  const stats = [
    {
      label: "Media Generale",
      value: statsData.mediaGenerale || "N/D",
      icon: <i className="fa-solid fa-chart-line" />,
      tone: mediaNumber === null ? "primary" : mediaNumber >= 6 ? "accent" : mediaNumber >= 5 ? "warning" : "danger",
      meta: mediaNumber === null ? "Nessuna media disponibile" : mediaNumber >= 6 ? "Andamento positivo" : "Da monitorare",
    },
    {
      label: "Voti Totali",
      value: statsData.votiTotali,
      icon: <i className="fa-solid fa-list-check" />,
      tone: "accent",
      meta: "Valutazioni registrate",
    },
    {
      label: "Materie Totali",
      value: statsData.materieTotali,
      icon: <i className="fa-solid fa-book-open" />,
      tone: "primary",
      meta: "Materie attive",
    },
    {
      label: "Materie Insufficienti",
      value: statsData.materieInsuff,
      icon: statsData.materieInsuff > 0 ? <i className="fa-solid fa-triangle-exclamation" /> : <i className="fa-solid fa-circle-check" />,
      tone: statsData.materieInsuff > 0 ? "danger" : "accent",
      meta: statsData.materieInsuff > 0 ? "Bisogna studiare" : "Nessuna materia insufficiente",
    },
  ]

  return (
    <div className="stats-grid">
      {stats.map((item, index) => (
        <StatCard key={index} label={item.label} value={item.value} icon={item.icon} tone={item.tone} meta={item.meta} />
      ))}
    </div>
  )
}
