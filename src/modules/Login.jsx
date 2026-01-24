import { useState } from "react";
import "./login.css";

export function Login({ onLogin, apiUrl }) {
  const [email, setEmail] = useState("mario@test.com");
  const [password, setPassword] = useState("test123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/login.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
        mode: "cors",
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Login fallito");
      }

      onLogin(data.user);
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
          <div className="login-logo">🎓</div>
          <h1 className="login-title">SchoolSync</h1>
          <p className="login-subtitle">Accedi al tuo account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
                Accesso in corso...
              </>
            ) : (
              "Accedi"
            )}
          </button>
        </form>

        <div className="login-footer">
          <p className="demo-hint">
            <strong>SchoolSync v3.0.0b</strong> <br />
            Connessione database attiva
          </p>
        </div>
      </div>
    </div>
  );
}
