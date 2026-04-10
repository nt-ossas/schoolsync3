import { useState } from "react"
import { Modal, Button, Input, Select } from "../components/ui"

export function ModificaEvento({ apiUrl, user, onClose, onEventoModificato, evento }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome: evento?.nome || "",
    tipo: evento?.tipo || "Scritto",
    data: evento?.data || new Date().toISOString().split("T")[0],
    descrizione: evento?.descrizione || "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.nome) return alert("Inserisci un nome")
    if (!user?.id) return alert("Utente non autenticato")
    if (formData.data < new Date().toISOString().split("T")[0]) return alert("Data già passata")

    setLoading(true)

    try {
      const response = await fetch(`${apiUrl}/modifica_evento.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ evento_id: evento.id, ...formData }),
        credentials: "include",
      })

      const data = await response.json()

      if (data.success) {
        onEventoModificato?.()
        onClose?.()
      } else {
        alert(`Errore: ${data.messaggio || "Errore sconosciuto"}`)
      }
    } catch (err) {
      console.error("Errore:", err)
      alert("Errore di connessione al server")
    } finally {
      setLoading(false)
    }
  }

  const eliminaEvento = async () => {
    setLoading(true)

    try {
      const response = await fetch(`${apiUrl}/elimina_evento.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ evento_id: evento.id }),
        credentials: "include",
      })

      const data = await response.json()

      if (data.success) {
        onEventoModificato?.()
        onClose?.()
      } else {
        alert(`Errore: ${data.messaggio || "Errore sconosciuto"}`)
      }
    } catch (err) {
      console.error("Errore:", err)
      alert("Errore di connessione al server")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title="Modifica Evento"
      onClose={onClose}
      footer={
        <>
          <Button type="button" onClick={eliminaEvento} variant="secondary" disabled={loading} leftIcon={<i className="fas fa-trash" />}>
            {loading ? "Eliminando..." : "Elimina"}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Annulla
          </Button>
          <Button type="submit" form="edit-event-form" variant="primary" loading={loading}>
            {loading ? "Modificando..." : "Modifica"}
          </Button>
        </>
      }
    >
      <form id="edit-event-form" onSubmit={handleSubmit} className="ui-form-stack">
        <Input type="text" placeholder="Verifica di matematica" name="nome" id="nome" value={formData.nome} onChange={handleChange} required disabled={loading} label="Nome Evento" />
        <Select id="tipo" name="tipo" value={formData.tipo} onChange={handleChange} required disabled={loading} label="Tipo">
          <option value="Scritto">Scritto</option>
          <option value="Orale">Orale</option>
          <option value="Pratico">Pratico</option>
        </Select>
        <Input id="data" type="date" name="data" value={formData.data} onChange={handleChange} required disabled={loading} label="Data" />
        <Input id="descrizione" type="text" name="descrizione" value={formData.descrizione} onChange={handleChange} placeholder="Test sui logaritmi" maxLength={50} disabled={loading} label="Descrizione" helperText="Opzionale, max 50 caratteri" />
      </form>
    </Modal>
  )
}
