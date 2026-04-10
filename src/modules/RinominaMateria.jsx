import { useState } from "react";
import "./aggiungi-materia.css";

export function RinominaMateria({ user, apiUrl, materiaId, onClose, onMateriaRinominata }) {
  const [loading, setLoading] = useState(false);
  const [nome, setNome] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!nome.trim()) {
      alert("Il nome della materia non può essere vuoto");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/rinomina_materia.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_materia: materiaId,
          nuovo_nome: nome.trim(),
        }),
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        if (onMateriaRinominata) {
          onMateriaRinominata();
        }

        if (onClose) {
          onClose();
        }
      } else {
        alert(`Errore: ${data.error || "Errore sconosciuto"}`);
      }
    } catch (err) {
      console.error("Errore:", err);
      alert("Errore di connessione al server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Rinomina Materia</h2>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="materia-form">
          <div className="form-group">
            <label htmlFor="nome">
              Nuovo Nome Materia <span className="required">*</span>
            </label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Matematica, Italiano, Storia..."
              maxLength={50}
              required
              autoFocus
            />
            <span className="helper-text">
              {nome.length}/50 caratteri
            </span>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Annulla
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Rinomina in corso..." : "Rinomina"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}