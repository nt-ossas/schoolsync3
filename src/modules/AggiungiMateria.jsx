import { useState } from "react";
import "./aggiungi-materia.css";

export function AggiungiMateria({ user, apiUrl, onMateriaAggiunta, onClose }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    anno: "0",
  });

  const anni = [
    { value: 0, label: "2023-24" },
    { value: 1, label: "2024-25" },
    { value: 2, label: "2025-26" },
    { value: 3, label: "2026-27" },
    { value: 4, label: "2027-28" },
    { value: 5, label: "2028-29" },
    { value: 6, label: "2029-30" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nome.trim()) {
      alert("Inserisci il nome della materia");
      return;
    }

    if (formData.nome.trim().length < 2) {
      alert("Il nome della materia deve essere di almeno 2 caratteri");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/aggiungi_materia.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          nome: formData.nome.trim(),
          anno: parseInt(formData.anno),
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (onMateriaAggiunta) {
          onMateriaAggiunta();
        }

        if (onClose) {
          onClose();
        }

        setFormData({
          nome: "",
          anno: "0",
        });
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
          <h2>Aggiungi Materia</h2>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="materia-form">
          <div className="form-group">
            <label htmlFor="nome">
              Nome Materia <span className="required">*</span>
            </label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              placeholder="es. Matematica, Italiano, Storia..."
              maxLength={50}
              required
              autoFocus
            />
            <span className="helper-text">
              {formData.nome.length}/50 caratteri
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="anno">
              Anno Scolastico <span className="required">*</span>
            </label>
            <select
              id="anno"
              name="anno"
              value={formData.anno}
              onChange={handleChange}
              required
            >
              {anni.map((anno) => (
                <option key={anno.value} value={anno.value}>
                  {anno.label}
                </option>
              ))}
            </select>
            <span className="helper-text">
              Seleziona l'anno scolastico di riferimento
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
              {loading ? "Aggiunta in corso..." : "+ Aggiungi Materia"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
