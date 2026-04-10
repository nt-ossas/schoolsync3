import { useState, useEffect } from "react"
import { Button, Modal, Input, Card, Alert } from "../components/ui"
import { MediaGoalModal } from "./MediaGoalModal.jsx"
import "./materia.css"

export function Materia({
  materia,
  user_id,
  apiUrl,
  periodo,
  onVotiAggiornati,
  onEliminaMateria,
  handleRinominaMateria,
  onVotoModificato,
  onAddVoto,
  short = false,
}) {
  const [expanded, setExpanded] = useState(false)
  const [voti, setVoti] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showRinomina, setShowRinomina] = useState(false)
  const [showMediaGoal, setShowMediaGoal] = useState(false)

  useEffect(() => {
    if (materia.id && user_id) caricaVoti()
  }, [materia.id, user_id, short])

  useEffect(() => {
    if (onVotiAggiornati && voti.length >= 0) onVotiAggiornati(materia.id, voti)
  }, [voti, materia.id, onVotiAggiornati, short])

  const handleEliminaVoto = async (votoId) => {
    if (!window.confirm("Sei sicuro di voler eliminare questo voto?")) return

    try {
      const response = await fetch(`${apiUrl}/elimina_voto.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voto_id: votoId }),
        credentials: "include",
      })

      const data = await response.json()

      if (data.success) {
        caricaVoti()
        onVotoModificato?.()
      } else {
        alert(`Errore: ${data.error || "Errore sconosciuto"}`)
      }
    } catch {
      alert("Errore di connessione al server")
    }
  }

  async function caricaVoti() {
    if (!user_id || !materia.id) {
      setError("id utente o materia non valido")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${apiUrl}/carica_voti.php?materia_index=MAT-${materia.id}`, { credentials: "include" })
      const data = await response.json()

      if (!data.success) throw new Error(data.error || "errore nel caricamento dei voti")

      const votiCaricati = data.voti || []
      setVoti(votiCaricati)
      onVotiAggiornati?.(materia.id, votiCaricati)
    } catch (err) {
      setError(err.message || "errore di connessione al server")
    } finally {
      setLoading(false)
    }
  }

  const calcolaMediaFiltrata = () => {
    const votiFiltrati = voti.filter((voto) => (periodo === undefined || periodo === null ? true : voto.periodo === periodo))

    if (votiFiltrati.length === 0) return "N/D"

    let sommaPonderata = 0
    let sommaPesi = 0

    votiFiltrati.forEach((v) => {
      const votoNum = parseFloat(v.voto)
      const peso = parseFloat(v.peso || 0)
      if (!isNaN(votoNum) && !isNaN(peso)) {
        sommaPonderata += votoNum * peso
        sommaPesi += peso
      }
    })

    if (sommaPesi === 0) return "N/D"
    return (sommaPonderata / sommaPesi).toFixed(2)
  }

  const getMediaClass = () => {
    const mediaString = calcolaMediaFiltrata()
    if (mediaString === "N/D") return "media-nulla"

    const media = parseFloat(mediaString)
    if (isNaN(media)) return "media-nulla"

    return media < 5 ? "media-insufficiente" : media < 6 ? "media-mid" : "media-sufficiente"
  }

  const calcolaVotiPeriodo = () => voti.filter((voto) => (periodo === undefined || periodo === null ? true : voto.periodo === periodo)).length

  const anni = ["2023-24", "2024-25", "2025-26", "2026-27", "2027-28", "2028-29", "2029-30"]

  const formatta = (valore) => {
    const intero = Math.floor(valore)
    const decimale = valore - intero

    if (decimale === 0) return intero.toString()
    if (decimale === 0.25) return `${intero}+`
    if (decimale === 0.5) return `${intero}½`
    if (decimale === 0.75) return `${intero + 1}-`
    return valore
  }

  return (
    <>
      <Card className={`materia-card ${expanded ? "expanded" : ""} ${getMediaClass()}`}>
        <div className="materia-header" onClick={() => setExpanded(!expanded)}>
          <div className="materia-info">
            <div className="materia-icon">{materia.nome.charAt(0).toUpperCase()}</div>
            <div>
              <h3 className="materia-nome">{materia.nome.length > 10 && window.innerWidth <= 480 ? `${materia.nome.slice(0, 9)}...` : materia.nome.length > 14 ? `${materia.nome.slice(0, 13)}...` : materia.nome}</h3>
              <p className="materia-codice">
                <span id="materia-anno">A.S. {anni[materia.anno]} - </span>
                {calcolaVotiPeriodo()} Vot{calcolaVotiPeriodo() === 1 ? "o" : "i"}
              </p>
            </div>
          </div>

          <div className="materia-stats">
            <div className="media-display">
              <span className="media-label">media</span>
              <span className={`media-value ${getMediaClass()}`}>{calcolaMediaFiltrata()}</span>
            </div>
          </div>

          <div className="materia-actions">
            <Button
              className="expand-btn"
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onAddVoto?.(materia.id)
              }}
              title="Aggiungi voto"
            >
              <i className="fas fa-plus" />
            </Button>
          </div>
        </div>

        {(expanded || short) && (
          <div className="materia-details">
            {error ? (
              <div className="error-state">
                <Alert variant="error">{error}</Alert>
                <Button onClick={caricaVoti} variant="secondary">
                  riprova
                </Button>
              </div>
            ) : loading ? (
              <div className="loading-state">
                <div className="spinner" />
                <p>caricamento voti...</p>
              </div>
            ) : (
              <>
                <div className="voti-section">
                  {calcolaVotiPeriodo() === 0 ? (
                    <div className="empty-state">
                      <span className="empty-icon">
                        <i className="fa-regular fa-folder-open" />
                      </span>
                      <p>Nessun voto registrato {periodo !== null ? "per questo periodo" : ""}</p>
                    </div>
                  ) : (
                    <div className="voti-list">
                      {voti
                        .filter((voto) => (periodo === undefined || periodo === null ? true : voto.periodo === periodo))
                        .map((voto, index) => {
                          const votoClass = voto.voto >= 6 && voto.peso > 0 ? "voto-sufficiente" : voto.voto >= 5 && voto.peso > 0 ? "voto-mid" : voto.voto < 5 && voto.peso > 0 ? "voto-insufficiente" : "voto-nullo"

                          return (
                            <div key={voto.id || index} className={`voto-element ${votoClass}`}>
                              <div className="voto-item">
                                <div className="voto-value">
                                  <span className={`voto-badge ${voto.voto >= 6 && voto.peso > 0 ? "sufficiente" : voto.voto >= 5 && voto.peso > 0 ? "mid" : voto.voto < 5 && voto.peso > 0 ? "insufficiente" : "nullo"}`}>
                                    {formatta(voto.voto)}
                                  </span>
                                </div>

                                <div className="voto-scritte">
                                  <div>
                                    {voto.tipo === "Scritto" ? <i className="fa-solid fa-file-lines" /> : voto.tipo === "Orale" ? <i className="fa-solid fa-comments" /> : <i className="fa-solid fa-person-running" />} {voto.tipo}
                                  </div>

                                  <div className="voto-details">
                                    <div className="voto-meta">
                                      <span className="voto-peso">{voto.peso}%</span>
                                      <span className="voto-data">{voto.data_formatted || voto.data}</span>
                                      <span className="voto-periodo">{voto.periodo === 0 || voto.periodo === "0" ? "Primo" : "Secondo"} periodo</span>
                                    </div>

                                    {voto.descrizione && voto.descrizione !== "Voto registrato" && <div className="voto-descrizione">{voto.descrizione}</div>}
                                  </div>
                                </div>
                                <Button className="delete-btn" variant="delete" size="sm" onClick={() => handleEliminaVoto(voto.id)}>
                                  <i className="fas fa-trash" />
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  )}
                </div>
                <div className="btns materia-btns">
                  <Button
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowRinomina(true)
                    }}
                    leftIcon={<i className="fas fa-pencil" />}
                    title="Rinomina materia"
                  >
                    Rinomina
                  </Button>

                  <Button
                    variant="delete"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEliminaMateria?.(materia.id)
                    }}
                    leftIcon={<i className="fas fa-trash" />}
                    title="Elimina materia"
                  >
                    Elimina
                  </Button>
                </div>
                <div className="media-goal-trigger">
                  {
                    (isNaN(calcolaMediaFiltrata()) || calcolaMediaFiltrata() == 0) || 
                    <Button
                      variant="secondary"
                      size="md"
                      className="media-goal-trigger-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowMediaGoal(true)
                      }}
                    >
                      Simula obiettivo
                    </Button>
                  }
                </div>
              </>
            )}
          </div>
        )}
      </Card>

      {showRinomina && handleRinominaMateria && (
        <Modal
          title="Rinomina Materia"
          onClose={() => setShowRinomina(false)}
          footer={
            <>
              <Button type="button" variant="secondary" onClick={() => setShowRinomina(false)}>
                Annulla
              </Button>
              <Button type="submit" variant="primary" form={`rename-${materia.id}`}>
                Rinomina
              </Button>
            </>
          }
        >
          <form
            id={`rename-${materia.id}`}
            onSubmit={(e) => {
              e.preventDefault()
              const nuovoNome = e.target.nome.value
              if (nuovoNome && nuovoNome.trim()) {
                handleRinominaMateria(materia.id, nuovoNome.trim())
                setShowRinomina(false)
              }
            }}
            className="ui-form-stack"
          >
            <Input
              type="text"
              id="nome"
              name="nome"
              defaultValue={materia.nome}
              label="Nuovo Nome Materia"
              placeholder="Matematica, Italiano, Storia..."
              maxLength={50}
              required
              autoFocus
            />
          </form>
        </Modal>
      )}

      {showMediaGoal && (
        <MediaGoalModal voti={voti} periodo={periodo} onClose={() => setShowMediaGoal(false)} />
      )}
    </>
  )
}
