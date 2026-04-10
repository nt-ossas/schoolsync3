import { useState } from "react";
import { Button } from "../components/ui/Button/Button.jsx";
import { GroqChat } from "./GroqChat.jsx";
import "./profile.css";

export function Assistenza({ user, apiUrl }) {
  const [loadingAssistenza, setLoadingAssistenza] = useState(false);
  const [assistenzaSuccess, setAssistenzaSuccess] = useState("");
  const [assistenzaError, setAssistenzaError] = useState("");
  const handleSubmitAssistenza = async (e) => {
    e.preventDefault();

    setLoadingAssistenza(true);
    setAssistenzaError("");
    setAssistenzaSuccess("");

    try {
      const problemaInput = document.getElementById("problema");
      const testoProblema = problemaInput?.value.trim() || "";

      if (!testoProblema) {
        setAssistenzaError("Per favore, descrivi il problema");
        setLoadingAssistenza(false);
        return;
      }

      const requestData = {
        id: user.id || "Id",
        username: user.username || "Utente",
        email: user.email || "Email non specificata",
        scuola: user.school || user.scuola || "Scuola non specificata",
        classe: user.classe || "Classe non specificata",
        problema: testoProblema,
        autore: user.username || "Utente",
        testo: testoProblema,
        data: new Date().toISOString(),
      };

      try {
        const dbResponse = await fetch(
          "https://schoolsync.altervista.org/bot/aggiungi_msg.php",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              autore: requestData.autore,
              testo: requestData.testo,
              data: requestData.data,
            }),
          },
        );

        const dbData = await dbResponse.json();

        if (!dbData.success) {
          console.warn("Messaggio non salvato nel DB:", dbData.error);
        }
      } catch (dbError) {
        console.warn("Errore connessione DB:", dbError.message);
      }

      const botResponse = await fetch(
        "https://notify-sc.onrender.com/webhook/assistenza",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: requestData.id,
            username: requestData.username,
            email: requestData.email,
            scuola: requestData.scuola,
            classe: requestData.classe,
            problema: requestData.problema,
          }),
        },
      );

      const botData = await botResponse.json();

      if (!botResponse.ok) {
        throw new Error(botData.error || `Errore HTTP: ${botResponse.status}`);
      }

      if (!botData.success) {
        throw new Error(botData.error || "Errore dal server bot");
      }

      setAssistenzaSuccess("Richiesta inviata! Ti aiuterò al più presto.");

      if (problemaInput) {
        problemaInput.value = "";
      }

      setTimeout(() => {
        setAssistenzaSuccess("");
      }, 5000);
    } catch (error) {
      console.error("Errore invio assistenza:", error);

      let errorMessage = "Errore invio richiesta";

      if (error.message.includes("Failed to fetch")) {
        errorMessage = "Errore di connessione. Controlla la rete.";
      } else if (error.message.includes("404")) {
        errorMessage = "Server non trovato. Contatta l'amministratore.";
      } else if (error.message.includes("timeout")) {
        errorMessage = "Timeout. Riprova tra qualche secondo.";
      } else {
        errorMessage = `${error.message}`;
      }

      setAssistenzaError(errorMessage);

      setTimeout(() => {
        setAssistenzaError("");
      }, 5000);
    } finally {
      setLoadingAssistenza(false);
    }
  };

  return (
    <>
      <div className="flex pari">
        <div className="assistenza-section stat-card">
          <div className="section-header">
            <h3>
              <i className="fas fa-headset"></i> Assistenza
            </h3>
            <span className="section-badge short-text">Supporto rapido</span>
          </div>
          <p className="assistenza-description">
            Hai riscontrato un problema o hai un idea per una nuova
            funzionalità? <br />
            Scrivi qua sotto e riceverai aiuto al più presto.
          </p>
          <form onSubmit={handleSubmitAssistenza}>
            <div className="assistenza-form">
              <label htmlFor="problema">
                <i className="fas fa-exclamation-circle"></i> Descrizione della
                segnalazione
              </label>
              <textarea
                id="problema"
                placeholder="Non riesco a visualizzare i miei compiti, ho un errore quando provo a..."
                rows="4"
                className="assistenza-textarea"
              ></textarea>

              <div className="assistenza-info">
                <p>
                  <strong>Informazioni che verranno inviate:</strong>
                </p>
                <ul>
                  <li>
                    <i className="fas fa-user"></i> Nome:{" "}
                    {user.username || "Utente"}
                  </li>
                  <li>
                    <i className="fas fa-envelope"></i> Email:{" "}
                    {user.email || "Non specificata"}
                  </li>
                  <li>
                    <i className="fas fa-school"></i> Scuola:{" "}
                    {user.school || user.scuola || "Non specificata"}
                  </li>
                  <li>
                    <i className="fas fa-graduation-cap"></i> Classe:{" "}
                    {user.classe || "Non specificata"}
                  </li>
                </ul>
              </div>

              {assistenzaError && (
                <p className="error assistenza-error">{assistenzaError}</p>
              )}
              {assistenzaSuccess && (
                <p className="success assistenza-success">
                  {assistenzaSuccess}
                </p>
              )}

              <div className="assistenza-btns">
                <Button
                  type="submit"
                  size="md"
                  variant="secondary"
                  disabled={loadingAssistenza}
                  className="assistenza-submit"
                >
                  {loadingAssistenza ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Invio in
                      corso...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i> Invia segnalazione
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
        <GroqChat apiUrl={apiUrl} user={user} />
      </div>
    </>
  );
}
