import { useState, useEffect } from "react";
import "./materia.css";

export function Materia({
  materia,
  user_id,
  apiUrl,
  onAddVoto,
  periodo,
  onVotiAggiornati,
  onEliminaMateria,
}) {
  const [expanded, setExpanded] = useState(false);
  const [voti, setVoti] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (materia.id && user_id) {
      caricaVoti();
    }
  }, [expanded, materia.id, user_id]);

  useEffect(() => {
    if (onVotiAggiornati && voti.length >= 0) {
      onVotiAggiornati(materia.id, voti);
    }
  }, [voti, materia.id, onVotiAggiornati]);

  const handleEliminaVoto = async (votoId) => {
    if (!window.confirm("Sei sicuro di voler eliminare questo voto?")) {
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/elimina_voto.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user_id,
          voto_id: votoId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        caricaVoti();
      } else {
        alert(`Errore: ${data.error || "Errore sconosciuto"}`);
      }
    } catch (err) {
      console.error("Errore eliminazione voto:", err);
      alert("Errore di connessione al server");
    }
  };

  async function caricaVoti() {
    if (!user_id || !materia.id) {
      setError("id utente o materia non valido");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${apiUrl}/carica_voti.php?user_id=${user_id}&materia_index=MAT-${materia.id}`,
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "errore nel caricamento dei voti");
      }

      const votiCaricati = data.voti || [];
      setVoti(votiCaricati);
      setStats(data.stats || null);

      if (onVotiAggiornati) {
        onVotiAggiornati(materia.id, votiCaricati);
      }
    } catch (err) {
      console.error("errore caricamento voti:", err);
      setError(err.message || "errore di connessione al server");
    } finally {
      setLoading(false);
    }
  }

  const calcolaMediaFiltrata = () => {
    const votiFiltrati = voti.filter((voto) => {
      if (periodo === undefined || periodo === null) {
        return true;
      }
      return voto.periodo === periodo;
    });

    if (votiFiltrati.length === 0) return "N/D";

    let sommaPonderata = 0;
    let sommaPesi = 0;

    votiFiltrati.forEach((v) => {
      const votoNum = parseFloat(v.voto);
      const peso = parseFloat(v.peso || 0);

      if (!isNaN(votoNum) && !isNaN(peso)) {
        sommaPonderata += votoNum * peso;
        sommaPesi += peso;
      }
    });

    if (sommaPesi === 0) return "N/D";

    const media = sommaPonderata / sommaPesi;
    return media.toFixed(2);
  };

  const getMediaClass = () => {
    const mediaString = calcolaMediaFiltrata();
    if (mediaString === "N/D") {
      return "media-nulla";
    }

    const media = parseFloat(mediaString);
    if (isNaN(media)) return "media-nulla";

    return media < 6 ? "media-insufficiente" : "media-sufficiente";
  };

  const calcolaVotiPeriodo = () => {
    const votiFiltrati = voti.filter((voto) => {
      if (periodo === undefined || periodo === null) {
        return true;
      }
      return voto.periodo === periodo;
    });
    return votiFiltrati.length;
  };

  const anni = [
    "2023-24",
    "2024-25",
    "2025-26",
    "2026-27",
    "2027-28",
    "2028-29",
    "2029-30",
  ];

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

  return (
    <div
      className={`materia-card ${expanded ? "expanded" : ""} ${getMediaClass()}`}
    >
      <div className="materia-bg"></div>
      <div className="materia-header" onClick={() => setExpanded(!expanded)}>
        <div className="materia-info">
          <div className="materia-icon">
            {materia.nome.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="materia-nome">{materia.nome}</h3>
            <p className="materia-codice">
              A.S. {anni[materia.anno]} • {calcolaVotiPeriodo()} Voti
            </p>
          </div>
        </div>

        <div className="materia-stats">
          <div className="media-display">
            <span className="media-label">media</span>
            <span className={`media-value ${getMediaClass()}`}>
              {calcolaMediaFiltrata()}
            </span>
          </div>
        </div>

        <div className="materia-actions">
          <button
            className="expand-btn"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          >
            {expanded ? (
              <i className="fas fa-minus"></i>
            ) : (
              <i className="fas fa-plus"></i>
            )}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="materia-details">
          {error ? (
            <div className="error-state">
              <span className="error-icon">⚠️</span>
              <p>{error}</p>
              <button onClick={caricaVoti} className="btn btn-secondary">
                riprova
              </button>
            </div>
          ) : loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>caricamento voti...</p>
            </div>
          ) : (
            <>
              <div className="voti-section">
                {calcolaVotiPeriodo() === 0 ? (
                  <div className="empty-state">
                    <span className="empty-icon">📭</span>
                    <p>
                      nessun voto registrato{" "}
                      {periodo !== null ? `per questo periodo` : ""}
                    </p>
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        if (onAddVoto) onAddVoto();
                      }}
                    >
                      + Aggiungi il primo voto
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="voti-list">
                      {voti
                        .filter((voto) => {
                          if (periodo === undefined || periodo === null) {
                            return true;
                          }
                          return voto.periodo === periodo;
                        })
                        .map((voto, index) => {
                          const votoClass =
                            voto.voto >= 6 && voto.peso > 0 ? "voto-sufficiente" 
                            : voto.voto < 6 && voto.peso > 0 ? "voto-insufficiente" 
                            : voto.peso == 0 ? "voto-nullo" : "voto-nullo"

                          return (
                            <div
                              key={voto.id || index}
                              className={`voto-element ${votoClass}`}
                            >
                              <div className="materia-bg"></div>
                              <div className="voto-item">
                                <div className="voto-value">
                                  <span
                                    className={`voto-badge ${voto.voto >= 6 && voto.peso > 0 ? "sufficiente" : voto.voto < 6 && voto.peso > 0 ? "insufficiente" : voto.peso == 0 ? "nullo" : "nullo"}`}
                                  >
                                    {formatta(voto.voto)}
                                  </span>
                                </div>

                                <div className="voto-details">
                                  <div className="voto-tipo">
                                    <span className="tipo-icon">
                                      {voto.tipo === "Scritto"
                                        ? "📝"
                                        : voto.tipo === "Orale"
                                          ? "🗣️"
                                          : "🔧"}
                                    </span>
                                    {voto.tipo}
                                  </div>

                                  <div className="voto-meta">
                                    <div>
                                      <span className="voto-peso">
                                        {voto.peso}%
                                      </span>
                                      <span className="voto-data">
                                        {voto.data_formatted || voto.data}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="voto-periodo">
                                        {voto.periodo === 0 ||
                                        voto.periodo === "0"
                                          ? "Primo"
                                          : "Secondo"}{" "}
                                        periodo
                                      </span>
                                    </div>
                                  </div>

                                  {voto.descrizione &&
                                    voto.descrizione !== "Voto registrato" && (
                                      <div className="voto-descrizione">
                                        {voto.descrizione}
                                      </div>
                                    )}
                                </div>
                                <button
                                  className="delete-btn"
                                  onClick={() => handleEliminaVoto(voto.id)}
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </>
                )}
              </div>
              <button
                className="delete-btn-text btn btn-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onEliminaMateria) {
                    onEliminaMateria(materia.id);
                  }
                }}
                title="Elimina materia"
              >
                - Elimina materia
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
