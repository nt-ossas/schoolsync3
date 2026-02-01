import { useState, useEffect } from "react";
import "./aggiungi-voto.css";

export function AggiungiVoto({
  user,
  apiUrl,
  materiaId,
  onVotoAggiunto,
  onClose,
  periodo,
  anno,
  onVotoModificato,
}) {
  const [loading, setLoading] = useState(false);
  const [materie, setMaterie] = useState([]);
  
  // Inizializza il form con materiaId se fornito
  const [formData, setFormData] = useState({
    materia_id: materiaId || "",
    voto: "",
    periodo:
      periodo !== undefined && periodo !== null ? periodo.toString() : "0",
    tipo: "Scritto",
    peso: "100",
    data: new Date().toISOString().split("T")[0],
    descrizione: "",
  });

  useEffect(() => {
    caricaMaterie();
  }, [user, anno]);

  // Aggiorna materia_id quando cambia materiaId
  useEffect(() => {
    if (materiaId) {
      setFormData(prev => ({
        ...prev,
        materia_id: materiaId
      }));
    }
  }, [materiaId]);

  async function caricaMaterie() {
    try {
      const response = await fetch(
        `${apiUrl}/carica_materie.php?user_id=${user.id}`,
      );
      const data = await response.json();
      if (data.success) {
        let materieFiltrate = data.materie || [];

        if (anno !== undefined && anno !== null) {
          materieFiltrate = materieFiltrate.filter((m) => m.anno == anno);
        }

        setMaterie(materieFiltrate);
        
        // Se non c'è una materia selezionata ma abbiamo materiaId, usala
        if (!formData.materia_id && materiaId) {
          setFormData(prev => ({
            ...prev,
            materia_id: materiaId
          }));
        }
        // Altrimenti seleziona la prima materia disponibile
        else if (!formData.materia_id && materieFiltrate.length > 0) {
          setFormData(prev => ({
            ...prev,
            materia_id: materieFiltrate[0].id
          }));
        }
      }
    } catch (err) {
      console.error("Errore caricamento materie:", err);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.materia_id) {
      alert("Seleziona una materia");
      return;
    }

    const votoNum = parseFloat(formData.voto);
    if (isNaN(votoNum) || votoNum < 2 || votoNum > 10) {
      alert("Il voto deve essere un numero tra 2 e 10");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/aggiungi_voto.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          materia_id: formData.materia_id,
          voto: votoNum,
          periodo: parseInt(formData.periodo),
          data: formData.data,
          tipo: formData.tipo,
          peso: parseInt(formData.peso),
          descrizione: formData.descrizione,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (onVotoAggiunto) {
          onVotoAggiunto();
        }
        // Notifica che un voto è stato aggiunto
        if (onVotoModificato) {
          onVotoModificato();
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

  const formatta = (valore) => {
    const intero = Math.floor(valore);
    const decimale = valore - intero;

    if (decimale === 0) {
      return intero.toString();
    } else if (decimale === 0.25) {
      return `${intero}+`;
    } else if (decimale === 0.5) {
      return `${intero}½`;
    } else if (decimale === 0.75) {
      return `${intero + 1}-`;
    }
  };

  const voti_options = () => {
    const options = [];
    let i = 10;
    while (i >= 2) {
      options.push(
        <option key={i} value={i}>
          {formatta(i)}
        </option>,
      );
      i -= 0.25;
    }
    return options;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Aggiungi Voto</h2>
          <button
            type="button"
            className="close-btn"
            onClick={onClose}
            aria-label="Chiudi"
          >
            <i className="fas fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="voto-form">
          <div className="form-group">
            <label htmlFor="materia_id">
              Materia <span className="required">*</span>
            </label>
            <select
              id="materia_id"
              name="materia_id"
              value={formData.materia_id}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="">Seleziona una materia</option>
              {materie.map((materia) => (
                <option key={materia.id} value={materia.id}>
                  {materia.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="voto">
                Voto <span className="required">*</span>
              </label>
              <select
                id="voto"
                name="voto"
                value={formData.voto}
                onChange={handleChange}
                disabled={loading}
                required
              >
                <option value="">Seleziona voto</option>
                {voti_options()}
              </select>
              <span className="helper-text">Da 2 a 10</span>
            </div>

            <div className="form-group">
              <label htmlFor="peso">
                Peso (%) <span className="required">*</span>
              </label>
              <input
                id="peso"
                type="number"
                name="peso"
                value={formData.peso}
                onChange={handleChange}
                placeholder="100"
                min="0"
                max="200"
                step="10"
                required
                disabled={loading}
              />
              <span className="helper-text">0-200% (0% = non influisce)</span>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="tipo">
                Tipo <span className="required">*</span>
              </label>
              <select
                id="tipo"
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <option value="Scritto">Scritto</option>
                <option value="Orale">Orale</option>
                <option value="Pratico">Pratico</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="data">
                Data <span className="required">*</span>
              </label>
              <input
                id="data"
                type="date"
                name="data"
                value={formData.data}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="periodo">
              Periodo <span className="required">*</span>
            </label>
            <select
              id="periodo"
              name="periodo"
              value={formData.periodo}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="0"> Primo Periodo</option>
              <option value="1"> Secondo Periodo</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="descrizione">Descrizione</label>
            <input
              id="descrizione"
              type="text"
              name="descrizione"
              value={formData.descrizione}
              onChange={handleChange}
              placeholder="Es: Verifica di matematica"
              maxLength={100}
              disabled={loading}
            />
            <span className="helper-text">Opzionale, max 100 caratteri</span>
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
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Aggiungendo...
                </>
              ) : (
                <>+ Aggiungi Voto</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}