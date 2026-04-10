import { useEffect, useState } from "react"
import { Materia } from "./Materia.jsx"
import { AggiungiVoto } from "./AggiungiVoto.jsx"
import { AggiungiMateria } from "./AggiungiMateria.jsx"
import { Button, Alert, Card } from "../components/ui"
import "./materie.css"

export function MaterieList({ user, apiUrl, periodo, anno, onVotiModificati, materieEsterne, onMaterieChange }) {
  const [materie, setMaterie] = useState(materieEsterne || [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showAddVoto, setShowAddVoto] = useState(false)
  const [showAddMateria, setShowAddMateria] = useState(false)
  const [selectedMateria, setSelectedMateria] = useState(null)
  const [short, setShort] = useState(false)

  useEffect(() => {
    if (materieEsterne && materieEsterne.length > 0) {
      setMaterie(materieEsterne)
      setLoading(false)
    }
  }, [materieEsterne])

  async function caricaMaterie() {
    if (!user?.id) return
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${apiUrl}/carica_materie.php`, { method: "GET", credentials: "include" })
      const data = await response.json()
      if (!data.success) 
        throw new Error(data.error || "errore nel caricamento delle materie")
      setMaterie(data.materie || [])
      onMaterieChange?.()
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  const handleEliminaMateria = async (materiaId) => {
    if (!window.confirm("Sei sicuro di voler eliminare questa materia? Verranno eliminati anche tutti i voti associati!")) return
    try {
      const response = await fetch(`${apiUrl}/elimina_materia.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materia_id: materiaId }),
        credentials: "include",
      })
      const data = await response.json()
      if (data.success) {
        caricaMaterie()
        onVotiModificati?.()
      } else {
        alert(`Errore: ${data.error || "Errore sconosciuto"}`)
      }
    } catch (err) {
      alert("Errore di connessione al server: " + err.message)
    }
  }

  const handleRinominaMateria = async (materiaId, nuovoNome) => {
    if (!nuovoNome || nuovoNome.trim() === "") return
    try {
      const response = await fetch(`${apiUrl}/rinomina_materia.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_materia: materiaId, nuovo_nome: nuovoNome.trim() }),
        credentials: "include",
      })
      const data = await response.json()
      if (data.success) {
        caricaMaterie()
      } else {
        alert(`Errore: ${data.error || "Errore sconosciuto"}`)
      }
    } catch {
      alert("Errore di connessione al server")
    }
  }

  const handleOpenAddVoto = (materiaId = null) => {
    setSelectedMateria(materiaId)
    setShowAddVoto(true)
  }

  const handleVotoAggiunto = () => {
    caricaMaterie()
    onVotiModificati?.()
  }

  const handleMateriaAggiunta = () => {
    caricaMaterie()
    setShowAddMateria(false)
  }

  if (loading) {
    return (
      <Card className="materie-list loading">
        <div className="loading-spinner">
          <div className="spinner" />
          <p>Caricamento materie...</p>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="materie-list error">
        <Alert variant="error">{error}</Alert>
        <Button variant="primary" onClick={caricaMaterie}>
          Riprova
        </Button>
      </Card>
    )
  }

  if (materie.length === 0) {
    return (
      <Card className="materie-list empty">
        <div className="empty-container">
          <h3>Nessuna materia trovata</h3>
          <i className="fa-regular fa-folder-open" />
          <Button variant="primary" size="md" onClick={() => setShowAddMateria(true)}>
            + Aggiungi materia
          </Button>
        </div>
        {showAddMateria && <AggiungiMateria user={user} apiUrl={apiUrl} onMateriaAggiunta={handleMateriaAggiunta} onClose={() => setShowAddMateria(false)} currentAnno={anno}/>}
      </Card>
    )
  }

  const materieVisibili = materie.filter((materia) => {
    if (anno === -1 || anno === null || anno === undefined) return true
    return materia.anno == anno
  })

  if (anno !== -1 && materieVisibili.length === 0) {
    return (
      <Card className="materie-list empty">
        <div className="empty-container">
          <span className="empty-icon">
            <i className="fa-solid fa-magnifying-glass" />
          </span>
          <h3>Nessuna materia per l'anno selezionato</h3>
          <p>Aggiungi una materia per l'anno {2023 + parseInt(anno)}-{2024 + parseInt(anno)}</p>
          <Button variant="primary" size="lg" onClick={() => setShowAddMateria(true)}>
            + Aggiungi materia
          </Button>
        </div>
        {showAddMateria && <AggiungiMateria user={user} apiUrl={apiUrl} onMateriaAggiunta={handleMateriaAggiunta} onClose={() => setShowAddMateria(false)} currentAnno={anno}/>}
      </Card>
    )
  }

  const titolo =
    anno === -1
      ? `${materieVisibili.length} ${materieVisibili.length === 1 ? "materia" : "materie"} totali`
      : `${materieVisibili.length} ${materieVisibili.length === 1 ? "materia" : "materie"} (${2023 + parseInt(anno)}-${24 + parseInt(anno)})`

  return (
    <div className="materie-list">
      <div className="materie-header">
        <div className="header-info">
          <h2>{titolo}</h2>
          <Button variant="ghost" onClick={() => setShort(!short)}>
            {short ? <i className="fa-solid fa-eye-slash"></i> : <i className="fa-solid fa-eye"></i>}
          </Button>
        </div>
        <div className="flex">
          <Button variant="primary" onClick={() => setShowAddMateria(true)}>
            + Aggiungi materia
          </Button>
        </div>
      </div>

      <div className="materie-grid">
        {materieVisibili.map((materia) => (
          <Materia
            key={materia.id}
            materia={materia}
            user_id={user?.id}
            apiUrl={apiUrl}
            onAddVoto={handleOpenAddVoto}
            periodo={periodo}
            onEliminaMateria={handleEliminaMateria}
            handleRinominaMateria={handleRinominaMateria}
            onVotoModificato={onVotiModificati}
            short={short}
          />
        ))}
      </div>

      {showAddVoto && (
        <AggiungiVoto
          user={user}
          apiUrl={apiUrl}
          materiaId={selectedMateria}
          onVotoAggiunto={handleVotoAggiunto}
          onClose={() => setShowAddVoto(false)}
          periodo={periodo}
          anno={anno}
          onVotoModificato={onVotiModificati}
        />
      )}

      {showAddMateria && <AggiungiMateria user={user} apiUrl={apiUrl} onMateriaAggiunta={handleMateriaAggiunta} onClose={() => setShowAddMateria(false)} currentAnno={anno}/>}
    </div>
  )
}
