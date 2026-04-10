import { useEffect, useMemo, useState } from "react"
import { AggiungiEvento } from "./AggiungiEvento.jsx"
import { ModificaEvento } from "./ModificaEvento.jsx"
import { Button, Alert, ListItem, Badge } from "../components/ui"
import "./calendario.css"

export function Calendario({ user, apiUrl }) {
  const [loading, setLoading] = useState(false)
  const [eventi, setEventi] = useState([])
  const [error, setError] = useState(null)
  const [showAggiungiEvento, setShowAggiungiEvento] = useState(false)
  const [eventoSelezionato, setEventoSelezionato] = useState(null)

  useEffect(() => {
    caricaEventi()
  }, [user?.id])

  async function caricaEventi() {
    if (!user?.id) {
      setEventi([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${apiUrl}/carica_eventi.php`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id }),
      })

      const data = await response.json()
      if (!data.success) throw new Error(data.messaggio || "Errore nel caricamento degli eventi")
      setEventi(data.eventi || [])
    } catch (err) {
      setError(err.message)
      setEventi([])
    } finally {
      setLoading(false)
    }
  }

  function giorniAllaScadenza(dataEvento) {
    const oggi = new Date()
    oggi.setHours(0, 0, 0, 0)

    const dataTarget = new Date(dataEvento)
    dataTarget.setHours(0, 0, 0, 0)

    return Math.ceil((dataTarget - oggi) / (1000 * 60 * 60 * 24))
  }

  function variantByDays(days) {
    if (days <= 4) return "danger"
    if (days <= 10) return "warning"
    return "success"
  }

  function iconByType(tipo) {
    switch ((tipo || "").toLowerCase()) {
      case "scritto":
        return <i className="fa-regular fa-file-lines" />
      case "orale":
        return <i className="fa-solid fa-comments" />
      case "pratico":
        return <i className="fa-solid fa-person-running" />
      default:
        return <i className="fa-regular fa-calendar" />
    }
  }

  return (
    <>
      {showAggiungiEvento && <AggiungiEvento apiUrl={apiUrl} user={user} onClose={() => setShowAggiungiEvento(false)} onEventoAggiunto={caricaEventi} />}
      {eventoSelezionato && <ModificaEvento apiUrl={apiUrl} user={user} evento={eventoSelezionato} onClose={() => setEventoSelezionato(null)} onEventoModificato={caricaEventi} />}

      <div className="activity-card">
        <div className="activity-card__head">
          <div className="flex">
            <div className="square-icon">
              <i className={`fa-solid fa-calendar-days`}></i>
            </div>
            <div className="className=ultimi-voti-title">
              <h3>Calendario Eventi</h3>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setShowAggiungiEvento(true)}>
            <i className="fa-solid fa-plus" /> Nuovo
          </Button>
        </div>

        {error ? <Alert variant="error">{error}</Alert> : null}

        {loading ? (
          <div className="activity-empty">Caricamento attività...</div>
        ) : eventi.length === 0 ? (
          <div className="activity-empty">
            <p>Nessun evento in programma.</p>
            <Button variant="primary" onClick={() => setShowAggiungiEvento(true)}>
              Aggiungi evento
            </Button>
          </div>
        ) : (
          <>
            <div className="activity-list">
              {eventi.map((evento) => {
                const days = giorniAllaScadenza(evento.data)
                const formattedDate = new Date(evento.data).toLocaleDateString("it-IT", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })

                return (
                  <ListItem
                    key={evento.id}
                    onClick={() => setEventoSelezionato(evento)}
                    icon={iconByType(evento.tipo)}
                    title={evento.nome}
                    subtitle={evento.descrizione?.trim() ? evento.descrizione : "Nessuna descrizione"}
                    meta={formattedDate}
                    right={<Badge variant={variantByDays(days)}>{days <= 0 ? "Oggi" : `${days}g`}</Badge>}
                  />
                )
              })}
            </div>
          </>
        )}
      </div>
    </>
  )
}
