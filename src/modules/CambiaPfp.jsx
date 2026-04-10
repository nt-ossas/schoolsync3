import { useState } from "react";
import { Button, Modal } from "../components/ui";
import { PFP_CHOICES } from "../constants/pfpChoices";
import "./cambia-pfp.css";

export function CambiaPfp({ user, apiUrl, onClose, onPfpCambiata }) {
  const [loading, setLoading] = useState(false);
  const [pfp, setPfp] = useState(user?.pfp ?? "scimmia");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/cambia_pfp.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pfp }),
        credentials: "include",
      });

      const data = await response.json();

      if (!data.success) throw new Error(data.messaggio || "Errore aggiornamento pfp");
 
      onPfpCambiata(pfp);
      onClose();

    } catch (err) {
      alert(err.message || "Errore di connessione");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Seleziona foto profilo"
      onClose={onClose}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Annulla
          </Button>
          <Button
            type="submit"
            variant="primary"
            form="change-pfp"
            disabled={loading}
          >
            {loading ? "Salvataggio..." : "Salva"}
          </Button>
        </>
      }
    >
      <form id="change-pfp" onSubmit={handleSubmit} className="pfp-grid">
        {PFP_CHOICES.map((item) => (
          <Button
            key={item}
            type="button"
            className={`pfp-item pfp-btn ${pfp === item ? "selected" : ""}`}
            onClick={() => setPfp(item)}
            variant="ghost"
          >
            <img src={`pfp/${item}.png`} alt={item} />
          </Button>
        ))}
      </form>
    </Modal>
  );
}
