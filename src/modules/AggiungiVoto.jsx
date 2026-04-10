import { useState, useEffect } from "react"
import { Modal, Button, Input, Select } from "../components/ui"
import { gradeValuesDescending, formatGradeLabel } from "../constants/gradeOptions"

export function AggiungiVoto({ user, apiUrl, materiaId, onVotoAggiunto, onClose, periodo, anno, onVotoModificato }) {
  const [loading, setLoading] = useState(false)
  const [materie, setMaterie] = useState([])
  const [formData, setFormData] = useState({
    materia_id: materiaId || "",
    voto: "",
    periodo: periodo !== undefined && periodo !== null ? periodo.toString() : "0",
    tipo: "Scritto",
    peso: "100",
    data: new Date().toISOString().split("T")[0],
    descrizione: "",
  })

  useEffect(() => {
    caricaMaterie()
  }, [user, anno])

  useEffect(() => {
    if (materiaId) {
      setFormData((prev) => ({ ...prev, materia_id: materiaId }))
    }
  }, [materiaId])

  async function caricaMaterie() {
    try {
      const response = await fetch(`${apiUrl}/carica_materie.php`, { credentials: "include" })
      const data = await response.json()
      if (data.success) {
        let materieFiltrate = data.materie || []
        if (anno !== undefined && anno !== null) materieFiltrate = materieFiltrate.filter((m) => m.anno == anno)
        setMaterie(materieFiltrate)

        if (!formData.materia_id && materiaId) {
          setFormData((prev) => ({ ...prev, materia_id: materiaId }))
        } else if (!formData.materia_id && materieFiltrate.length > 0) {
          setFormData((prev) => ({ ...prev, materia_id: materieFiltrate[0].id }))
        }
      }
    } catch (err) {
      console.error("Errore caricamento materie:", err)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.materia_id) return alert("Seleziona una materia")

    const votoNum = parseFloat(formData.voto)
    if (isNaN(votoNum) || votoNum < 2 || votoNum > 10) return alert("Il voto deve essere un numero tra 2 e 10")

    setLoading(true)

    try {
      const response = await fetch(`${apiUrl}/aggiungi_voto.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materia_id: formData.materia_id,
          voto: votoNum,
          periodo: parseInt(formData.periodo),
          data: formData.data,
          tipo: formData.tipo,
          peso: parseInt(formData.peso),
          descrizione: formData.descrizione,
        }),
        credentials: "include",
      })

      const data = await response.json()

      if (data.success) {
        onVotoAggiunto?.()
        onVotoModificato?.()
        onClose?.()
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
      title="Aggiungi Voto"
      onClose={onClose}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Annulla
          </Button>
          <Button type="submit" form="add-voto-form" variant="primary" loading={loading}>
            {loading ? "Aggiungendo..." : "+ Aggiungi Voto"}
          </Button>
        </>
      }
    >
      <form id="add-voto-form" onSubmit={handleSubmit} className="ui-form-stack">
        <Select id="materia_id" name="materia_id" value={formData.materia_id} onChange={handleChange} label="Materia" required disabled={loading}>
          <option value="">Seleziona una materia</option>
          {materie.map((materia) => (
            <option key={materia.id} value={materia.id}>
              {materia.nome}
            </option>
          ))}
        </Select>

        <div className="ui-form-row">
        <Select id="voto" name="voto" value={formData.voto} onChange={handleChange} disabled={loading} required label="Voto" helperText="Da 2 a 10">
          <option value="">Seleziona voto</option>
          {gradeValuesDescending.map((value) => (
            <option key={value} value={value}>
              {formatGradeLabel(value)}
            </option>
          ))}
        </Select>
          <Input id="peso" type="number" name="peso" value={formData.peso} onChange={handleChange} label="Peso (%)" placeholder="100" min="0" max="100" step="10" required disabled={loading} helperText="0-100%" />
        </div>

        <div className="ui-form-row">
          <Select id="tipo" name="tipo" value={formData.tipo} onChange={handleChange} required disabled={loading} label="Tipo">
            <option value="Scritto">Scritto</option>
            <option value="Orale">Orale</option>
            <option value="Pratico">Pratico</option>
          </Select>
          <Input id="data" type="date" name="data" value={formData.data} onChange={handleChange} required disabled={loading} label="Data" />
        </div>

        <Select id="periodo" name="periodo" value={formData.periodo} onChange={handleChange} required disabled={loading} label="Periodo">
          <option value="0">Primo Periodo</option>
          <option value="1">Secondo Periodo</option>
        </Select>

        <Input id="descrizione" type="text" name="descrizione" value={formData.descrizione} onChange={handleChange} label="Descrizione" placeholder="Verifica di matematica" maxLength={100} disabled={loading} helperText="Opzionale, max 100 caratteri" />
      </form>
    </Modal>
  )
}
