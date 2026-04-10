import "./footer.css"
import { useEffect, useState }from "react"

export function Footer() {
  const [currentVersion, setCurrentVersion] = useState(null)
  const currentYear = new Date().getFullYear()

  useEffect(() => {
    fetchPackageVersion()
  }, [])

  const fetchPackageVersion = async () => {
    try {
      const response = await fetch(
        `https://api.github.com/repos/nt-ossas/schoolsync3/contents/package.json`,
        { headers: { "User-Agent": "SchoolSync" } }
      );
      const data = await response.json();
      const decoded = JSON.parse(atob(data.content));
      setCurrentVersion(decoded.version ?? null);
    } catch {
      setCurrentVersion(null);
    }
  }

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="footer-logo">
              <i className="fa-solid fa-graduation-cap" />
            </span>
            <h3 className="footer-title">SchoolSync {currentVersion && `v${currentVersion}`}</h3>
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

