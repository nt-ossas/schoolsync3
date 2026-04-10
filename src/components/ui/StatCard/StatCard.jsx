import "./StatCard.css"
import { Link } from "react-router-dom"

export function StatCard({ label, value, icon, tone = "primary", meta }) {
  return (
    <Link className={`ui-stat-card ui-stat-card--${tone}`} to={"/materie"}>
      <div>
        <div className="ui-stat-card__icon">{icon}</div>
        <p className="ui-stat-card__label">{label}</p>
      </div>
      <div>
        <p className="ui-stat-card__value">{value}</p>
        {meta ? <p className="ui-stat-card__meta">{meta}</p> : null}
      </div>
    </Link>
  )
}
