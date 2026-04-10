import "./footer.css"
import { Link } from "react-router-dom"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="footer-logo">
              <i className="fa-solid fa-graduation-cap" />
            </span>
            <h3 className="footer-title">SchoolSync</h3>
          </div>

          <p className="footer-tagline">La piattaforma intelligente per gestire il tuo percorso scolastico</p>
          <p>Da uno studente per gli studenti</p>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            © {currentYear} SchoolSync - Tutti i diritti riservati
            <br />
            Powered by Ossas
          </p>
        </div>
      </div>
    </footer>
  )
}

