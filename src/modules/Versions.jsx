import { useEffect, useState } from "react"
import "./versions.css"
import { Button, Modal, Input, Alert, Table, Card } from "../components/ui"

const API_BASE_URL = "/api"

export function Versions({ user }) {
  const [versions, setVersions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ titolo: "", descrizione: "", data: new Date().toISOString().split("T")[0] })
  const [submitting, setSubmitting] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingId, setEditingId] = useState(null)

  async function fetchVersions() {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${API_BASE_URL}/carica_versioni.php`, { credentials: "include" })
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      const data = JSON.parse(await response.text())
      if (data.success && Array.isArray(data.versions)) {
        setVersions(data.versions)
        setFormData({ titolo: data.versions[0].titolo, descrizione: "", data: new Date().toISOString().split("T")[0] })
      } else {
        throw new Error(data.error || "Errore nel caricamento delle versioni")
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleEditVersion(versionId) {
    const version = versions.find((v) => v.id === versionId)
    if (!version) return alert("Versione non trovata")

    setFormData({ titolo: version.titolo, descrizione: version.descrizione || "", data: version.data })
    setEditingId(versionId)
    setShowEditModal(true)
  }

  async function handleDeleteVersion(versionId) {
    if (!confirm("Sei sicuro di voler eliminare questa versione?")) return

    try {
      const response = await fetch(`${API_BASE_URL}/elimina_versione.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: versionId }),
        credentials: "include",
      })

      const data = await response.json()
      if (data.success) {
        setVersions(versions.filter((v) => v.id !== versionId))
      } else {
        alert(data.error || "Errore durante l'eliminazione")
      }
    } catch {
      alert("Errore durante l'eliminazione della versione")
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!formData.titolo || !formData.data) return alert("Titolo e data sono obbligatori")

    try {
      setSubmitting(true)

      const response = await fetch(`${API_BASE_URL}/aggiungi_versione.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData }),
        credentials: "include",
      })

      const data = await response.json()

      if (data.success) {
        setShowModal(false)
        setFormData({ titolo: versions[0].titolo, descrizione: "", data: new Date().toISOString().split("T")[0] })
        fetchVersions()
      } else {
        alert(data.error || "Errore durante l'aggiunta")
      }
    } catch {
      alert("Errore durante l'aggiunta della versione")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleEditSubmit(e) {
    e.preventDefault()

    if (!formData.titolo || !formData.data) return alert("Titolo e data sono obbligatori")

    try {
      setSubmitting(true)

      const response = await fetch(`${API_BASE_URL}/modifica_versione.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, id: editingId }),
        credentials: "include",
      })

      const data = await response.json()

      if (data.success) {
        setShowEditModal(false)
        setEditingId(null)
        setFormData({ titolo: versions[0].titolo, descrizione: "", data: new Date().toISOString().split("T")[0] })
        fetchVersions()
      } else {
        alert(data.error || "Errore durante la modifica")
      }
    } catch {
      alert("Errore durante la modifica della versione")
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    fetchVersions()
  }, [])

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" })
    } catch {
      return dateString
    }
  }

  const columns = [
    { key: "titolo", title: "Titolo" },
    { key: "data", title: "Data", render: (row) => formatDate(row.data) },
    { key: "descrizione", title: "Descrizione", render: (row) => row.descrizione || "Nessuna descrizione disponibile" },
  ]

  if (user?.role === "admin") {
    columns.push({
      key: "edit",
      title: "",
      render: (row) => (
        <Button
          className="version-edit-btn"
          variant="ghost"
          size="sm"
          onClick={() => handleEditVersion(row.id)}
          aria-label="Modifica versione"
        >
          <i className="fas fa-edit" />
        </Button>
      ),
    })

    columns.push({
      key: "delete",
      title: "",
      render: (row) => (
        <Button
          className="version-delete-btn"
          variant="ghost"
          size="sm"
          onClick={() => handleDeleteVersion(row.id)}
          aria-label="Elimina versione"
        >
          <i className="fas fa-trash" />
        </Button>
      ),
    })
  }

  return (
    <div className="versions">
      <div className="versions-header">
        <h2>Versioni di SchoolSync</h2>
        {user?.role === "admin" && (
          <Button
            onClick={() => {
              setFormData({ titolo: versions[0].titolo, descrizione: "", data: new Date().toISOString().split("T")[0] })
              setEditingId(null)
              setShowModal(true)
            }}
            variant="primary"
            leftIcon={<i className="fas fa-plus" />}
          >
            Aggiungi Versione
          </Button>
        )}
      </div>

      {loading ? (
        <Card className="versions-state">Caricamento versioni...</Card>
      ) : error ? (
        <div className="versions-state">
          <Alert variant="error">Errore nel caricamento delle versioni: {error}</Alert>
          <Button onClick={fetchVersions} variant="secondary">
            Riprova
          </Button>
        </div>
      ) : versions.length === 0 ? (
        <Card className="versions-state">Nessuna versione disponibile</Card>
      ) : (
        <Table columns={columns} data={versions} />
      )}

      {showEditModal && (
        <Modal
          title="Modifica Versione"
          onClose={() => {
            setShowEditModal(false)
            setEditingId(null)
          }}
          footer={
            <>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowEditModal(false)
                  setEditingId(null)
                }}
                disabled={submitting}
              >
                Annulla
              </Button>
              <Button type="submit" form="version-edit-form" variant="primary" loading={submitting}>
                {submitting ? "Salvataggio..." : "Salva Modifiche"}
              </Button>
            </>
          }
        >
          <form id="version-edit-form" onSubmit={handleEditSubmit} className="ui-form-stack">
            <Input type="text" id="titolo" value={formData.titolo} onChange={(e) => setFormData({ ...formData, titolo: e.target.value })} label="Titolo" placeholder="Versione 1.0.0" required />

            <Input type="date" id="data" value={formData.data} onChange={(e) => setFormData({ ...formData, data: e.target.value })} label="Data di rilascio" required />

            <label className="ui-field" htmlFor="descrizione">
              <span className="ui-field__label">Descrizione</span>
              <textarea className="ui-textarea" id="descrizione" value={formData.descrizione} onChange={(e) => setFormData({ ...formData, descrizione: e.target.value })} placeholder="Descrivi le novità di questa versione..." rows="5" />
            </label>
          </form>
        </Modal>
      )
      }

      {showModal && (
        <Modal
          title="Aggiungi Nuova Versione"
          onClose={() => setShowModal(false)}
          footer={
            <>
              <Button type="button" variant="secondary" onClick={() => setShowModal(false)} disabled={submitting}>
                Annulla
              </Button>
              <Button type="submit" form="version-form" variant="primary" loading={submitting}>
                {submitting ? "Salvataggio..." : "Salva Versione"}
              </Button>
            </>
          }
        >
          <form id="version-form" onSubmit={handleSubmit} className="ui-form-stack">
            <Input type="text" id="titolo" value={formData.titolo} onChange={(e) => setFormData({ ...formData, titolo: e.target.value })} label="Titolo" placeholder="Versione 1.0.0" required />

            <Input type="date" id="data" value={formData.data} onChange={(e) => setFormData({ ...formData, data: e.target.value })} label="Data di rilascio" required />

            <label className="ui-field" htmlFor="descrizione">
              <span className="ui-field__label">Descrizione</span>
              <textarea className="ui-textarea" id="descrizione" value={formData.descrizione} onChange={(e) => setFormData({ ...formData, descrizione: e.target.value })} placeholder="Descrivi le novità di questa versione..." rows="5" />
            </label>
          </form>
        </Modal>
      )}
    </div>
  )
}
