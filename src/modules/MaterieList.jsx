import { useEffect, useState, useCallback } from "react";
import { Materia } from "./Materia.jsx";
import { AggiungiVoto } from "./AggiungiVoto.jsx";
import { AggiungiMateria } from "./AggiungiMateria.jsx";
import "./materie.css";

export function MaterieList({ 
  user, 
  apiUrl, 
  onUpdateStats, 
  periodo, 
  anno,
  onVotiModificati // Nuova prop per notificare modifiche voti
}) {
  const [materie, setMaterie] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddVoto, setShowAddVoto] = useState(false);
  const [showAddMateria, setShowAddMateria] = useState(false);
  const [selectedMateria, setSelectedMateria] = useState(null);
  const [votiPerMateria, setVotiPerMateria] = useState({});

  useEffect(() => {
    caricaMaterie();
  }, [user?.id, apiUrl]);

  const handleVotiAggiornati = useCallback((materiaId, voti) => {
    setVotiPerMateria((prev) => ({
      ...prev,
      [materiaId]: voti,
    }));
  }, []);

  const handleEliminaMateria = async (materiaId) => {
    if (
      !window.confirm(
        "Sei sicuro di voler eliminare questa materia? Verranno eliminati anche tutti i voti associati!",
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/elimina_materia.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          materia_id: materiaId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        caricaMaterie();
        // Notifica che i voti potrebbero essere cambiati
        if (onVotiModificati) {
          onVotiModificati();
        }
      } else {
        alert(`Errore: ${data.error || "Errore sconosciuto"}`);
      }
    } catch (err) {
      console.error("Errore eliminazione materia:", err);
      alert("Errore di connessione al server: " + err.message);
    }
  };

  const handleRinominaMateria = async (materiaId, nuovoNome) => {
    if (!nuovoNome || nuovoNome.trim() === "") return;

    try {
      const response = await fetch(`${apiUrl}/rinomina_materia.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          id_materia: materiaId,
          nuovo_nome: nuovoNome.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        caricaMaterie();
        alert("Materia rinominata con successo!");
      } else {
        alert(`Errore: ${data.error || "Errore sconosciuto"}`);
      }
    } catch (err) {
      console.error("Errore rinomina materia:", err);
      alert("Errore di connessione al server");
    }
  };

  const calcolaStatisticheFiltrate = useCallback(() => {
    let totVoti = 0;
    let sommaVoti = 0;
    let countVoti = 0;
    let materieInsuff = 0;

    // Filtra materie per anno (se anno >= 0)
    const materieFiltratePerAnno = materie.filter((materia) => {
      if (anno === -1 || anno === null || anno === undefined) {
        return true; // Mostra tutte le materie quando anno = -1
      }
      return materia.anno == anno;
    });

    materieFiltratePerAnno.forEach((materia) => {
      const votiMateria = votiPerMateria[materia.id] || [];

      const votiFiltrati = votiMateria.filter((voto) => {
        if (periodo === undefined || periodo === null) {
          return true;
        }
        return voto.periodo == periodo;
      });

      totVoti += votiFiltrati.length;

      if (votiFiltrati.length > 0) {
        let sommaVotiMateria = 0;
        let sommaPesi = 0;

        votiFiltrati.forEach((voto) => {
          const votoNum = parseFloat(voto.voto);
          const peso = parseFloat(voto.peso || 1);
          
          if (!isNaN(votoNum) && !isNaN(peso) && peso > 0) {
            sommaVotiMateria += votoNum * peso;
            sommaPesi += peso;
            sommaVoti += votoNum * peso;
            countVoti += peso;
          }
        });

        const mediaMateria = sommaPesi > 0 ? sommaVotiMateria / sommaPesi : 0;

        if (mediaMateria < 6) {
          materieInsuff++;
        }
      }
    });

    const mediaGenerale = countVoti > 0 ? (sommaVoti / countVoti).toFixed(2) : "N/D";

    return {
      materieTotali: materieFiltratePerAnno.length,
      votiTotali: totVoti,
      mediaGenerale: mediaGenerale,
      materieInsuff: materieInsuff,
    };
  }, [materie, votiPerMateria, periodo, anno]);

  useEffect(() => {
    if (materie.length === 0 && Object.keys(votiPerMateria).length === 0) {
      if (onUpdateStats) {
        onUpdateStats({
          materieTotali: 0,
          votiTotali: 0,
          mediaGenerale: "N/D",
          materieInsuff: 0,
        });
      }
      return;
    }

    const nuoveStats = calcolaStatisticheFiltrate();
    if (onUpdateStats) {
      onUpdateStats(nuoveStats);
    }
  }, [materie, votiPerMateria, periodo, anno, calcolaStatisticheFiltrate]);

  async function caricaMaterie() {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${apiUrl}/carica_materie.php?user_id=${user.id}`,
      );
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "errore nel caricamento delle materie");
      }

      const materieCaricate = data.materie || [];
      setMaterie(materieCaricate);
    } catch (err) {
      console.error("errore caricamento materie:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenAddVoto = (materiaId = null) => {
    setSelectedMateria(materiaId);
    setShowAddVoto(true);
  };

  const handleVotoAggiunto = () => {
    caricaMaterie();
    // Notifica che un voto è stato aggiunto
    if (onVotiModificati) {
      onVotiModificati();
    }
  };

  const handleMateriaAggiunta = () => {
    caricaMaterie();
    setShowAddMateria(false);
  };

  if (loading) {
    return (
      <div className="materie-list loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>caricamento materie...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="materie-list error">
        <div className="error-container">
          <span className="error-icon">⚠️</span>
          <p className="error-message">{error}</p>
          <button className="btn btn-primary" onClick={() => caricaMaterie()}>
            Riprova
          </button>
        </div>
      </div>
    );
  }

  if (materie.length === 0) {
    return (
      <div className="materie-list empty">
        <div className="empty-container">
          <span className="empty-icon">📚</span>
          <h3>Nessuna materia registrata</h3>
          <p>Inizia aggiungendo la tua prima materia</p>
          <button
            className="btn btn-primary btn-large"
            onClick={() => setShowAddMateria(true)}
          >
            + Aggiungi prima materia
          </button>
        </div>

        {showAddMateria && (
          <AggiungiMateria
            user={user}
            apiUrl={apiUrl}
            onMateriaAggiunta={handleMateriaAggiunta}
            onClose={() => setShowAddMateria(false)}
          />
        )}
      </div>
    );
  }

  // Filtra le materie visibili in base all'anno
  const materieVisibili = materie.filter((materia) => {
    if (anno === -1 || anno === null || anno === undefined) {
      return true; // Mostra tutte le materie quando anno = -1
    }
    return materia.anno == anno;
  });

  if (anno !== -1 && materieVisibili.length === 0) {
    return (
      <div className="materie-list empty">
        <div className="empty-container">
          <span className="empty-icon"><i class="fa-solid fa-magnifying-glass"></i></span>
          <h3>Nessuna materia per l'anno selezionato</h3>
          <p>
            Aggiungi una materia per l'anno {2023 + parseInt(anno)}-{2024 + parseInt(anno)}
          </p>
          <button
            className="btn btn-primary btn-large"
            onClick={() => setShowAddMateria(true)}
          >
            + Aggiungi materia
          </button>
        </div>

        {showAddMateria && (
          <AggiungiMateria
            user={user}
            apiUrl={apiUrl}
            onMateriaAggiunta={handleMateriaAggiunta}
            onClose={() => setShowAddMateria(false)}
          />
        )}
      </div>
    );
  }

  // Testo del titolo
  const titolo = anno === -1 
    ? `${materieVisibili.length} ${materieVisibili.length === 1 ? 'materia' : 'materie'} totali`
    : `${materieVisibili.length} ${materieVisibili.length === 1 ? 'materia' : 'materie'} (A.S. ${2023 + parseInt(anno)}-${2024 + parseInt(anno)})`;

  return (
    <div className="materie-list">
      <div className="materie-header">
        <div className="header-info">
          <h2>{titolo}</h2>
        </div>
        <div className="flex">
          {/*<button
            className="btn btn-small btn-primary"
            onClick={() => handleOpenAddVoto()}
          >
            + Aggiungi voto
          </button>*/}
          <button
            className="btn btn-primary"
            onClick={() => setShowAddMateria(true)}
          >
            + Aggiungi materia
          </button>
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
            onVotiAggiornati={handleVotiAggiornati}
            onEliminaMateria={handleEliminaMateria}
            handleRinominaMateria={handleRinominaMateria}
            onVotoModificato={onVotiModificati} // Passa la prop
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
          onVotoModificato={onVotiModificati} // Passa la prop
        />
      )}

      {showAddMateria && (
        <AggiungiMateria
          user={user}
          apiUrl={apiUrl}
          onMateriaAggiunta={handleMateriaAggiunta}
          onClose={() => setShowAddMateria(false)}
        />
      )}
    </div>
  );
}