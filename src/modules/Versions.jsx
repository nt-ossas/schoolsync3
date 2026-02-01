import { useEffect, useState } from "react";
import "./versions.css";

const API_BASE_URL = "/api";

export function Versions({ user }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    titolo: "",
    descrizione: "",
    data: ""
  });
  const [submitting, setSubmitting] = useState(false);

  async function fetchVersions() {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/carica_versioni.php`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const text = await response.text();
      let data;
      
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error("Invalid JSON response:", text);
        throw new Error("Il server ha restituito una risposta non valida");
      }
      
      console.log("Versions data:", data);

      if (data.success && Array.isArray(data.versions)) {
        setVersions(data.versions);
      } else {
        throw new Error(data.error || "Errore nel caricamento delle versioni");
      }
    } catch (error) {
      console.error("Error fetching versions:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteVersion(versionId) {
    if (!confirm("Sei sicuro di voler eliminare questa versione?")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/elimina_versione.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          id: versionId,
          userId: user.id,
          isAdmin: user.admin === 1 ? 1 : 0
        })
      });

      const data = await response.json();

      if (data.success) {
        setVersions(versions.filter(v => v.id !== versionId));
      } else {
        alert(data.error || "Errore durante l'eliminazione");
      }
    } catch (error) {
      console.error("Error deleting version:", error);
      alert("Errore durante l'eliminazione della versione");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!formData.titolo || !formData.data) {
      alert("Titolo e data sono obbligatori");
      return;
    }

    try {
      setSubmitting(true);
      
      const response = await fetch(`${API_BASE_URL}/aggiungi_versione.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...formData,
          userId: user.id,
          isAdmin: user.admin === 1 ? 1 : 0
        })
      });

      const data = await response.json();

      if (data.success) {
        setShowModal(false);
        setFormData({ titolo: "", descrizione: "", data: "" });
        fetchVersions();
      } else {
        alert(data.error || "Errore durante l'aggiunta");
      }
    } catch (error) {
      console.error("Error adding version:", error);
      alert("Errore durante l'aggiunta della versione");
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    fetchVersions();
  }, []);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="versions">
      <div className="versions-header">
        <h2>Versioni di SchoolSync</h2>
        {user && user.admin === 1 && (
          <button 
            onClick={() => setShowModal(true)} 
            className="btn btn-primary"
          >
            <i className="fas fa-plus"></i>
            Aggiungi Versione
          </button>
        )}
      </div>
      
      {loading ? (
        <p>Caricamento versioni...</p>
      ) : error ? (
        <div className="error-message">
          <p>Errore nel caricamento delle versioni: {error}</p>
          <button onClick={fetchVersions} className="retry-button">
            Riprova
          </button>
        </div>
      ) : versions.length === 0 ? (
        <p>Nessuna versione disponibile</p>
      ) : (
        <div className="versions-list">
          {versions.map((version) => (
            <div key={version.id} className="version-item stat-card">
              <div className="version-header-row">
                <div>
                  <h3>{version.titolo || `Versione ${version.id}`}</h3>
                  <p className="version-date">
                    <strong>Data di rilascio:</strong> {formatDate(version.data)}
                  </p>
                </div>
                {user && user.admin === 1 && (
                  <button
                    onClick={() => handleDeleteVersion(version.id)}
                    className="delete-version-btn"
                    title="Elimina versione"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                )}
              </div>
              <p className="version-description">
                {version.descrizione || "Nessuna descrizione disponibile"}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Modal per aggiungere versione */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Aggiungi Nuova Versione</h2>
              <button 
                className="close-btn" 
                onClick={() => setShowModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="version-form">
              <div className="form-group">
                <label htmlFor="titolo">
                  Titolo <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="titolo"
                  value={formData.titolo}
                  onChange={(e) => setFormData({...formData, titolo: e.target.value})}
                  placeholder="es. Versione 1.0.0"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="data">
                  Data di rilascio <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="data"
                  value={formData.data}
                  onChange={(e) => setFormData({...formData, data: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="descrizione">Descrizione</label>
                <textarea
                  id="descrizione"
                  value={formData.descrizione}
                  onChange={(e) => setFormData({...formData, descrizione: e.target.value})}
                  placeholder="Descrivi le novità di questa versione..."
                  rows="5"
                />
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                >
                  Annulla
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner"></span>
                      Salvataggio...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save"></i>
                      Salva Versione
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
