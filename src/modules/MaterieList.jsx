import { useEffect, useState, useCallback } from "react";
import { Materia } from "./Materia.jsx";
import { AggiungiVoto } from "./AggiungiVoto.jsx";
import { AggiungiMateria } from "./AggiungiMateria.jsx";
import "./materie.css";

export function MaterieList({ user, apiUrl, onUpdateStats, periodo, anno }) {
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

      const responseText = await response.text();

      const data = JSON.parse(responseText);

      if (data.success) {
        caricaMaterie();
      } else {
        alert(`Errore: ${data.error || "Errore sconosciuto"}`);
      }
    } catch (err) {
      console.error("Errore eliminazione materia:", err);
      alert("Errore di connessione al server: " + err.message);
    }
  };

  const handleRinominaMateria = async (materiaId) => {
    alert("Funzione di rinomina materia in sviluppo.");

    /*const nuovaNome = window.prompt("Inserisci il nuovo nome della materia:");

    if (!nuovaNome || nuovaNome.trim() === "") {
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/rinomina_materia.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          materia_id: materiaId,
          nuovo_nome: nuovaNome.trim(),
        }),
      });

      const responseText = await response.text();
      const data = JSON.parse(responseText);
      if (data.success) {
        caricaMaterie();
      } else {
        alert(`Errore: ${data.error || "Errore sconosciuto"}`);
      }
    } catch (err) {
      console.error("Errore rinomina materia:", err);
      alert("Errore di connessione al server: " + err.message);
    }*/
  };

  const calcolaStatisticheFiltrate = useCallback(() => {
    let totVoti = 0;
    let sommaVoti = 0;
    let countVoti = 0;
    let materieInsuff = 0;

    const materieFiltratePerAnno = materie.filter((materia) => {
      if (anno === undefined || anno === null) {
        return true;
      }
      return materia.anno === anno;
    });

    materieFiltratePerAnno.forEach((materia) => {
      const votiMateria = votiPerMateria[materia.id] || [];

      const votiFiltrati = votiMateria.filter((voto) => {
        if (periodo === undefined || periodo === null) {
          return true;
        }
        return voto.periodo === periodo;
      });

      totVoti += votiFiltrati.length;

      if (votiFiltrati.length > 0) {
        let sommaVotiMateria = 0;

        votiFiltrati.forEach((voto) => {
          const votoNum = parseFloat(voto.voto);
          if (!isNaN(votoNum)) {
            sommaVotiMateria += votoNum;
            sommaVoti += votoNum;
            countVoti++;
          }
        });

        const mediaMateria = sommaVotiMateria / votiFiltrati.length;

        if (mediaMateria < 6) {
          materieInsuff++;
        }
      }
    });

    const mediaGenerale =
      countVoti > 0 ? (sommaVoti / countVoti).toFixed(2) : "N/D";

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
  }, [materie, votiPerMateria, periodo, anno]);

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
            🔄 Riprova
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

  const materieVisibili = materie.filter((materia) => {
    if (anno === null || anno === undefined) {
      return true;
    }
    return materia.anno === anno;
  });

  if (materieVisibili.length === 0) {
    return (
      <div className="materie-list empty">
        <div className="empty-container">
          <span className="empty-icon">🔍</span>
          <h3>Nessuna materia per l'anno selezionato</h3>
          <p>
            Aggiungi una materia per l'anno {2022 + anno}-{2023 + anno}
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

  return (
    <div className="materie-list">
      <div className="materie-header">
        <div className="header-info">
          <h2>
            {materieVisibili.length}{" "}
            {materieVisibili.length === 1 ? "materia" : "materie"}
          </h2>
        </div>
        <div className="flex">
          <button
            className="btn btn-small btn-primary"
            onClick={(e) => {
              e.stopPropagation();
              if (handleOpenAddVoto) handleOpenAddVoto();
            }}
          >
            + Aggiungi voto
          </button>
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
            onRinominaMateria={handleRinominaMateria}
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
