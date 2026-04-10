import React, { useState, useRef, useEffect } from "react";
import "./groq-chat.css";

export function GroqChat({ apiUrl, user }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userMessage, setUserMessage] = useState(null);
  const [botMessage, setBotMessage] = useState(null);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);
  const chatMessagesRef = useRef(null);
  const inputRef = useRef(null);

  const MODEL = "llama-3.1-8b-instant";

  const rmToken = async () => {
    try {
      const response = await fetch(apiUrl + "/remove_token.php", {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.messaggio || `HTTP error! Status: ${response.status}`);
      }
    } catch (e) {
      console.error("Errore: " + e);
    }
  };

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [userMessage, botMessage, loading]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value.length <= 500) {
      setInput(value);
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!input.trim() || input.length > 500) return;

    setUserMessage(null);
    setBotMessage(null);

    const newUserMessage = {
      id: Date.now(),
      text: input,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setUserMessage(newUserMessage);

    const currentInput = input;
    setInput("");
    setLoading(true);
    setError("");

    setTimeout(() => {
      inputRef.current?.focus();
      if (inputRef.current) {
        inputRef.current.style.height = "auto";
      }
    }, 100);

    try {
      const apiMessages = [
        {
          role: "user",
          content: currentInput,
        },
      ];

      const res = await fetch(apiUrl + "/groq_request.php", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL,
          messages: apiMessages,
          max_tokens: 300,
          temperature: 0.7,
        }),
      });

      const raw = await res.text();
      let data = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        data = {};
      }

      if (res.ok) {
        const botResponse =
          data?.choices?.[0]?.message?.content ||
          "Risposta non valida dal server";
        const newBotMessage = {
          id: Date.now() + 1,
          text: botResponse,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        rmToken();
        setBotMessage(newBotMessage);
      } else {
        const err = new Error(
          data?.errore || data?.error?.message || `Errore HTTP ${res.status}`
        );
        err.status = res.status;
        err.code = data?.code || data?.error?.code;
        throw err;
      }
    } catch (err) {
      if (err?.status === 429 && err?.code === "TOKEN_EXHAUSTED") {
        setError("Hai finito i token AI disponibili per oggi.");
      } else if (err?.status === 429) {
        setError("Troppe richieste in poco tempo. Riprova tra qualche secondo.");
      } else if (err?.status === 401) {
        setError("Sessione scaduta. Fai di nuovo login.");
      } else {
        setError("SyncBot momentaneamente indisponibile. Riprova tra poco.");
      }
      console.error("Errore chat:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className={`groq-chat-container ${user?.role === "admin" ? "" : "blurred"}`}>
      <div className="chat-header">
        <div className="chat-header-left">
          <div className="chat-logo">
            <i className="fas fa-robot"></i>
          </div>
          <div className="chat-title">
            <h3>SyncBot Assistant</h3>
            <p className="chat-subtitle">AI per assistenza SchoolSync</p>
          </div>
        </div>
      </div>

      <div className="chat-messages" ref={chatMessagesRef}>
        {!userMessage && !loading && (
          <div className="message-wrapper bot">
            <div className="message-bubble">
              <div className="message-content">
                Ciao! Sono SyncBot, l'assistente di SchoolSync. Come posso
                aiutarti oggi? 🎓
              </div>
              <div className="message-meta">
                <span className="message-sender">SyncBot</span>
                <span className="message-time">
                  {new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </div>
        )}

        {userMessage && (
          <div className="message-wrapper user">
            <div className="message-bubble">
              <div className="message-content">{userMessage.text}</div>
              <div className="message-meta">
                <span className="message-sender">Tu</span>
                <span className="message-time">{userMessage.timestamp}</span>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="message-wrapper bot">
            <div className="message-bubble">
              <div className="message-content">
                <div className="typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
              <div className="message-meta">
                <span className="message-sender">SyncBot</span>
                <span className="message-time">...</span>
              </div>
            </div>
          </div>
        )}

        {botMessage && (
          <div className="message-wrapper bot">
            <div className="message-bubble">
              <div className="message-content">{botMessage.text}</div>
              <div className="message-meta">
                <span className="message-sender">SyncBot</span>
                <span className="message-time">{botMessage.timestamp}</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="chat-input-area">
        <div className="input-wrapper">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            maxLength={500}
            placeholder="Scrivi il tuo messaggio a SyncBot..."
            disabled={loading}
            rows={1}
            className="assistenza-textarea syncbot-input"
          ></textarea>
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="send-btn"
            title="Invia messaggio"
          >
            {loading ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <i className="fas fa-paper-plane"></i>
            )}
          </button>
        </div>

        <div className="input-footer">
          <span className={`char-count ${input.length >= 450 ? "warning" : ""}`}>
            {input.length}/500
          </span>
        </div>

        {error && (
          <div className="chat-error">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}
      </form>

      <div className="chat-footer">
        <div className="footer-info">
          <i className="fas fa-robot"></i>
          <div className="model-info">
            <span className="model-badge">{MODEL}</span>
          </div>
        </div>
      </div>
    </div>
  );
}