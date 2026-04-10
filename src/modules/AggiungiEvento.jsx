import { useState, useEffect } from "react"
import { Modal, Button, Input, Select } from "../components/ui"

export function AggiungiEvento({ apiUrl, user, onClose, onEventoAggiunto }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome: "",
    tipo: "Scritto",
    data: new Date().toISOString().split("T")[0],
    descrizione: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.nome) return alert("Inserisci un nome")
    if (!user?.id) return alert("Utente non autenticato")
    if (formData.data < new Date().toISOString().split("T")[0]) return alert("Data gi� passata")

    setLoading(true)

    try {
      const response = await fetch(`${apiUrl}/aggiungi_evento.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id, ...formData }),
        credentials: "include",
      })

      const data = await response.json()

      if (data.success) {
        setFormData({ nome: "", tipo: "Scritto", data: new Date().toISOString().split("T")[0], descrizione: "" })
        onEventoAggiunto?.()
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
      title="Aggiungi Evento"
      onClose={onClose}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Annulla
          </Button>
          <Button type="submit" form="add-event-form" variant="primary" loading={loading}>
            {loading ? "Aggiungendo..." : "+ Aggiungi Evento"}
          </Button>
        </>
      }
    >
      <form id="add-event-form" onSubmit={handleSubmit} className="ui-form-stack">
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
