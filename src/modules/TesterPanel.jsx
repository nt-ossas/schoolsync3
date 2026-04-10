import { useCallback, useEffect, useMemo, useState } from "react"
import { Alert, Button, Section, Spinner, Table } from "../components/ui"
import "./admin.css"

export function TesterPanel({ apiUrl, userRole }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [actionId, setActionId] = useState(null)
  const isAdmin = userRole === "admin"

  const loadRequests = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch(`${apiUrl}/carica_richieste.php`, {
        credentials: "include",
      })
      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || "Errore nel caricamento delle segnalazioni")
      }
      Array.isArray(data.richieste) && data.richieste.forEach(req => {
        req.autorizzato = req.autorizzato ? "Autorizzato" : "Non autorizzato"
        req.completato = req.completato ? "Completato" : "Non completato"
      })
      setRequests(Array.isArray(data.richieste) ? data.richieste : [])
    } catch (err) {
      setError(err.message || "Errore nel caricamento delle segnalazioni")
    } finally {
      setLoading(false)
    }
  }, [apiUrl])

  useEffect(() => {
    loadRequests()
  }, [loadRequests])

  const handleDeleteRequest = useCallback(
    async (id) => {
      if (!isAdmin) return
      setActionId(id)
      setError("")
      try {
        const response = await fetch(`${apiUrl}/elimina_richiesta.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ id }),
        })
        const data = await response.json()
        if (!data.success) {
          throw new Error(data.error || "Errore durante l'eliminazione della segnalazione")
        }
        await loadRequests()
      } catch (err) {
        setError(err.message || "Errore durante l'eliminazione della segnalazione")
      } finally {
        setActionId(null)
      }
    },
    [apiUrl, isAdmin, loadRequests],
  )

  const requestColumns = useMemo(
    () => [
      { key: "id", title: "ID" },
      { key: "autore", title: "Autore" },
      { key: "testo", title: "Segnalazione" },
      { key: "data", title: "Data" },
      { key: "autorizzato", title: "Autorizzazione" },
      {
        key: "actions",
        title: "Action",
        render: (row) =>
          isAdmin && (
            <Button
              size="sm"
              variant="secondary"
              loading={actionId === row.id}
              onClick={() => alert("Modifica richiesta")} //modifica
            >
              Modifica
            </Button>
          )
      },
    ],
    [actionId, handleDeleteRequest, isAdmin],
  )

  return (
    <div className="admin-page">
      <Section title="Segnalazioni" subtitle="Tutte le richieste raccolte">
        {error && <Alert variant="error">{error}</Alert>}
        <div className="responsive-table-wrapper">
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner" />
              <p>Caricamento tabella...</p>
            </div>
          ) : (
            <Table columns={requestColumns} data={requests} emptyText="Nessuna segnalazione" />
          )}
        </div>
      </Section>
    </div>
  )
}
