import { useState } from "react";
import "./login.css";

export function Login({ onLogin, apiUrl, switchToSignUp }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const isEmail = email.includes("@");
      const identifier = email.trim();

      if (!identifier || !password) {
        throw new Error("Inserisci email/username e password");
      }

      const response = await fetch(`${apiUrl}/login.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [isEmail ? "email" : "username"]: identifier,
          password: password,
        }),
      });

      const data = await response.json();

      console.log("Login API response:", data);

      if (!data.success) {
        throw new Error(data.error || "Login fallito");
      }

      console.log("User data from API:", data.user);

      if (data.user) {
        onLogin(data.user);
      } else {
        throw new Error("Dati utente non validi");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Impossibile connettersi al server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <i className="fa-solid fa-graduation-cap"></i>
          </div>
          <h1 className="login-title">SchoolSync</h1>
          <p className="login-subtitle">Accedi al tuo account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Email o Username</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
              disabled={loading}
              placeholder="Inserisci email o username"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              required
              disabled={loading}
              placeholder="Inserisci la password"
            />
          </div>

          {error && (
            <div className="error-message">
              <i className="icon-error">⚠️</i>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary login-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Accesso in corso...
              </>
            ) : (
              "Accedi"
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Non hai un account?
            <button
              type="button"
              className="link-btn"
              onClick={switchToSignUp}
              disabled={loading}
            >
              Registrati
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
