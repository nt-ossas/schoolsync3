import "./ultimi-voti.css"
import { Card } from "../components/ui"

export function UltimiVoti({ user, voti = [] }) {
  const width = typeof window !== "undefined" ? window.innerWidth : 1200
  const votiMostrati = width >= 768 ? 6 : 2
  const votiDaMostrare = voti.slice(0, votiMostrati)

  const formatta = (valore) => {
    const numero = parseFloat(String(valore).replace(",", "."))
    if (Number.isNaN(numero)) return String(valore)

    const intero = Math.floor(numero)
    const decimale = numero - intero

    if (decimale === 0) return intero.toString()
    if (decimale === 0.25) return `${intero}+`
    if (decimale === 0.5) return `${intero}½`
    if (decimale === 0.75) return `${intero + 1}-`
    return numero.toString()
  }

  return (
    <Card className={"ultimi-voti-container"}>
      <div className="ultimi-voti-head">
        <div className="flex">
          <div className="square-icon">
            <i className={`fa-solid fa-clock-rotate-left`}></i>
          </div>
          <div className="className=ultimi-voti-title">
            <h3>Ultimi Voti</h3>
          </div>
        </div>
        {voti.length > 0 && <p className="voti-count">{Math.min(voti.length, votiMostrati)} vot{voti.length === 1 ? "o" : "i"}</p>}
      </div>

      {voti.length > 0 ? (
        <ul className="ultimi-voti-lista">
          {votiDaMostrare.map((voto, index) => {
            const votoNum = parseFloat(String(voto.voto).replace(",", "."))
            const votoClass = `voto-badge ultimi-voti${votoNum < 5 ? " insufficiente" : votoNum < 6 ? " mid" : votoNum >= 6 ? " sufficiente" : " nullo"}`
            const votoFormattato = formatta(voto.voto)

            return (
              <li key={`${voto.materia || "materia"}-${votoFormattato}-${index}`} className="voto-item ultimi-voti-item">
                <span className={votoClass}>{votoFormattato}</span>
                <span className="materia">{voto.materia}</span>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="ultimi-voti-state">
          <p>Nessun voto disponibile per l'anno selezionato.</p>
        </div>
      )}
    </Card>
  )
}
