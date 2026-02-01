import { useEffect, useState } from "react";
import "./ultimi-voti.css";

export function UltimiVoti({ user, apiUrl, anno, refreshKey }) {
  const [loading, setLoading] = useState(false);
  const [voti, setVoti] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    caricaVoti();
  }, [user, anno, refreshKey]); // Aggiunto refreshKey come dipendenza

  async function caricaVoti() {
    if (!user?.id || anno === undefined || anno === null) {
      setVoti([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        user_id: user.id,
        anno: anno
      });
      
      const response = await fetch(
        `${apiUrl}/carica_voti_all.php?${params.toString()}`,
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const text = await response.text();
      let data;
      
      try {
        data = JSON.parse(text);
      } catch (jsonError) {
        console.error("Errore parsing JSON:", jsonError, "Testo ricevuto:", text);
        throw new Error("Risposta non valida dal server");
      }
      
      if (!data.success) {
        throw new Error(data.error || "errore nel caricamento dei voti");
      }

      const votiCaricati = data.voti || [];
      setVoti(votiCaricati);
    } catch (err) {
      console.error("errore caricamento voti:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

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
    <>
      <div className="ultimi-voti-container stat-card">
        {error ? (
          <div className="error-message">
            <p>Errore: {error}</p>
            <button onClick={caricaVoti} className="btn btn-small btn-primary">
              Riprova
            </button>
          </div>
        ) : loading ? (
          <p>Caricamento in corso...</p>
        ) : voti.length > 0 ? (
          <>
            <p className="voti-count">Ultimi {Math.min(voti.length, 16)} vot{voti.length == 1 ? "o" : "i"} attuali</p>
            <ul className="ultimi-voti-lista">
              {voti.slice(0, 16).map((voto) => {
                const votoClass = "voto-badge ultimi-voti" + (voto.voto < 5 ? " insufficiente" : voto.voto < 6 ? " mid" : voto.voto >= 6 ? " sufficiente" : " nullo");
                return (
                  <li key={voto.id} className={votoClass}>
                    {formatta(voto.voto)}
                  </li>
                );
              })}
            </ul>
          </>
        ) : (
          <p>Nessun voto disponibile per l'anno selezionato.</p>
        )}
      </div>
    </>
  );
}