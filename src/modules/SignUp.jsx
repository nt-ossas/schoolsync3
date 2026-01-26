import { useState } from "react";
import "./login.css";

export function SignUp({ onLogin, apiUrl, switchToLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [scuola, setScuola] = useState("");
  const [classe, setClasse] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/register.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          username,
          scuola,
          classe,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Registrazione fallita");
      }

      onLogin(data.user);
    } catch (err) {
      console.error("SignUp error:", err);
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
          <p className="login-subtitle">Crea un nuovo account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
              disabled={loading}
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
            />
          </div>

          <div className="form-group">
            <label className="form-label">Scuola</label>
            <input
              type="text"
              value={scuola}
              onChange={(e) => setScuola(e.target.value)}
              className="input"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Classe</label>
            <input
              type="text"
              value={classe}
              onChange={(e) => setClasse(e.target.value)}
              className="input"
              required
              disabled={loading}
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
                Registrazione in corso...
              </>
            ) : (
              "Registrati"
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Hai già un account?
            <button className="link-btn" onClick={switchToLogin}>
              Accedi
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
