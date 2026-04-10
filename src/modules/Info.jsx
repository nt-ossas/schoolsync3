import "./info.css"
import { Button, Card } from "../components/ui"
import { Link } from "react-router-dom"

const highlights = [
  { title: "Andamento classi", description: "Monitora progressi settimanali e gap formativi sulle classi attive." },
  { title: "Priorità docenti", description: "Identifica materie con valutazioni mancanti o carichi da riequilibrare." },
  { title: "Follow-up studenti", description: "Crea interventi mirati per casi a rischio e revisioni periodiche." },
]

export function Info() {
  return (
    <Card className="secondary-content">
      <div className="flex">
        <div className="square-icon">
          <i className={`fa-solid fa-circle-info`}></i>
        </div>
        <div className="className=ultimi-voti-title">
          <h3>Focus Strategico</h3>
          <p>Blocco secondario per decisioni operative e pianificazione.</p>
        </div>
      </div>

      <div className="secondary-content__grid">
        {highlights.map((item) => (
          <article key={item.title} className="secondary-content__item">
            <h4>{item.title}</h4>
            <p>{item.description}</p>
          </article>
        ))}
      </div>

      <div className="secondary-content__actions">
        <Link to="/materie">
          <Button variant="primary">Apri Materie</Button>
        </Link>
      </div>
    </Card>
  )
}
