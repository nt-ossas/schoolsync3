import { useState } from "react"
import { Modal, Button, Input, Select } from "../components/ui"

export function AggiungiMateria({ apiUrl, onMateriaAggiunta, onClose, currentAnno }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ nome: "", anno: currentAnno || "0" })

  const anni = [
    { value: 0, label: "2023-24" },
    { value: 1, label: "2024-25" },
    { value: 2, label: "2025-26" },
    { value: 3, label: "2026-27" },
    { value: 4, label: "2027-28" },
    { value: 5, label: "2028-29" },
    { value: 6, label: "2029-30" },
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.nome.trim()) return alert("Inserisci il nome della materia")
    if (formData.nome.trim().length < 2) return alert("Il nome della materia deve essere di almeno 2 caratteri")

    setLoading(true)

    try {
      const response = await fetch(`${apiUrl}/aggiungi_materia.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: formData.nome.trim(), anno: parseInt(formData.anno) }),
        credentials: "include",
      })

      const data = await response.json()

      if (data.success) {
        onMateriaAggiunta?.()
        onClose?.()
        setFormData({ nome: "", anno: "0" })
      } else {
        alert(`Errore: ${data.error || "Errore sconosciuto"}`)
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
      title="Aggiungi Materia"
      onClose={onClose}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Annulla
          </Button>
          <Button type="submit" form="add-materia-form" variant="primary" loading={loading}>
            {loading ? "Aggiunta in corso..." : "+ Aggiungi Materia"}
          </Button>
        </>
      }
    >
      <form id="add-materia-form" onSubmit={handleSubmit} className="ui-form-stack">
        <Input
          type="text"
          id="nome"
          name="nome"
          value={formData.nome}
          onChange={handleChange}
          label="Nome Materia"
          placeholder="Matematica, Italiano, Storia..."
          maxLength={50}
          required
          autoFocus
          helperText={`${formData.nome.length}/50 caratteri`}
        />

        <Select id="anno" name="anno" value={formData.anno} onChange={handleChange} label="Anno Scolastico" required helperText="Seleziona l'anno scolastico di riferimento">
          {anni.map((anno) => (
            <option key={anno.value} value={anno.value}>
              {anno.label}
            </option>
          ))}
        </Select>
      </form>
    </Modal>
  )
}
