import { useCallback, useEffect, useMemo, useState } from "react"
import { Alert, Button, Input, Modal, Section, Select, Table } from "../components/ui"
import "./admin.css"

const initialForm = {
  id: "",
  titolo: "",
  autore: "",
  testo: "",
  completato: 0,
}

export function TesterPanel({ apiUrl, userRole }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [actionId, setActionId] = useState(null)
  const [editingMsg, setEditingMsg] = useState(false)
  const [editingRequest, setEditingRequest] = useState(null)
  const [userForm, setUserForm] = useState(initialForm)
  const [savingMsg, setSavingMsg] = useState(false)
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
        closeModal()
      }
    },
    [apiUrl, isAdmin, loadRequests],
  )

  function openEditModal(request) {
    setEditingRequest(request)
    setUserForm({
      id: request.id ?? "",
      titolo: request.titolo ?? "",
      autore: request.autore ?? "",
      testo: request.testo ?? "",
      completato: Number(request.completato) ? 1 : 0,
    })
    setEditingMsg(true)
    setError("")
  }

  const requestColumns = useMemo(
    () => [
      { key: "id", title: "ID" },
      { key: "autore", title: "Autore" },
      { key: "testo", title: "Segnalazione" },
      { key: "data", title: "Data" },
      {
        key: "info",
        title: "info",
        render: (row) => {
          return (
            <p className="info-msg">
              <span className={`status ${row.completato ? "completed" : "pending"}`}>
                {row.completato ? <i class="fa-solid fa-square-check"></i> : <i class="fa-solid fa-hourglass-half"></i>}
              </span>
              <span className={`status ${row.titolo ? "authorized" : "unauthorized"}`}>
                {row.titolo ? <i class="fa-solid fa-cloud-arrow-up"></i> : <i class="fa-solid fa-bug"></i>}
              </span>
            </p>
          )
        },
      },
      {
        key: "actions",
        title: "Action",
        render: (row) =>
          isAdmin && (
            <div className="table-actions">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => openEditModal(row)}
              >
                Modifica
              </Button>
            </div>
          ),
      },
    ],
    [actionId, handleDeleteRequest, isAdmin],
  )

  function closeModal() {
    setEditingMsg(false)
    setEditingRequest(null)
    setUserForm(initialForm)
  }

  async function handleUserSubmit(e) {
    e.preventDefault()
    setSavingMsg(true)
    setError("")

    try {
      const response = await fetch(`${apiUrl}/modifica_messaggio.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(userForm),
      })
      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || "Errore durante la modifica del messaggio")
      }
      await loadRequests()
      closeModal()
    } catch (err) {
      setError(err.message || "Errore durante la modifica del messaggio")
    } finally {
      setSavingMsg(false)
    }
  }

  const formatId = (id) => {
    const stringId = String(id ?? "")
    return "0".repeat(Math.max(0, 8 - stringId.length)) + stringId
  }

  return (
    <>
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

      {editingMsg && (
        <Modal
          title={`Modifica messaggio${editingRequest?.id ? ` #${formatId(editingRequest.id)}` : ""}`}
          onClose={closeModal}
          footer={
            <>
              <Button
                variant="delete"
                loading={actionId === userForm.id && savingMsg}
                onClick={() => handleDeleteRequest(userForm.id)}
              >
                Elimina
              </Button>
              <Button variant="secondary" onClick={closeModal} disabled={savingMsg}>
                Annulla
              </Button>
              <Button variant="primary" type="submit" form="tester-message-form" loading={savingMsg}>
                Salva
              </Button>
            </>
          }
        >
          <form id="tester-message-form" className="admin-user-form" onSubmit={handleUserSubmit}>
            <Input
              label="ID"
              name="id"
              value={formatId(userForm.id)}
              disabled
            />
            <Input
              label="Autore"
              name="autore"
              value={userForm.autore}
              onChange={(e) => setUserForm((prev) => ({ ...prev, autore: e.target.value }))}
            />
            <Input
              label="Titolo"
              name="titolo"
              value={userForm.titolo}
              onChange={(e) => setUserForm((prev) => ({ ...prev, titolo: e.target.value }))}
            />
            <Select
              label="Completato"
              name="completato"
              value={String(userForm.completato)}
              onChange={(e) =>
                setUserForm((prev) => ({ ...prev, completato: Number(e.target.value) }))
              }
            >
              <option value="0">Non completato</option>
              <option value="1">Completato</option>
            </Select>
            <label className="ui-field" htmlFor="testo">
              <span className="ui-field__label">Testo</span>
              <textarea
                id="testo"
                className="ui-textarea"
                value={userForm.testo}
                onChange={(e) => setUserForm((prev) => ({ ...prev, testo: e.target.value }))}
                rows="5"
              />
            </label>
          </form>
        </Modal>
      )}
    </>
  )
}
