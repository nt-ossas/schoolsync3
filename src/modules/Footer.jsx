import "./footer.css";

export function Footer({onPageChange}) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="footer-logo">
              <i className="fa-solid fa-graduation-cap"></i>
            </span>
            <h3 className="footer-title">SchoolSync Beta</h3>
          </div>

          <p className="footer-tagline">
            La piattaforma intelligente per gestire il tuo percorso scolastico
          </p>

          <p className="footer-links">
            <a href="#" onClick={() => onPageChange("versions")}>Visualizza le varie versioni</a><br />
          </p>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            © {currentYear} SchoolSync Beta<span id="version"></span> - Tutti i diritti riservati <br />{" "}
            Powered by Ossas
          </p>
        </div>
      </div>
    </footer>
  );
}
