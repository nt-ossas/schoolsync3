import { useNavigate } from "react-router-dom"
import "./page404.css"
import { Button, Card } from "../components/ui"

export function Page404() {
  const navigate = useNavigate()

  return (
    <div className="page-404-wrap">
      <Card className="page-404">
        <div className="page-404-icon" role="img" aria-label="Pagina non trovata">
          <i className="fas fa-compass" />
        </div>

        <h1>404</h1>
        <h3>Sembra che questa pagina non sia stata trovata o sia stata rimossa</h3>
        <p>Controlla che l'indirizzo sia corretto</p>

        <div className="page-404-actions">
          <Button variant="primary" onClick={() => navigate("/")}>Torna alla Home</Button>
          <Button variant="secondary" onClick={() => navigate(-1)}>Pagina Precedente</Button>
        </div>
      </Card>
    </div>
  )
}
