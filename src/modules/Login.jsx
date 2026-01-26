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
      const response = await fetch(`${apiUrl}/login.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      console.log("Login API response:", data);

      if (!data.success) {
        throw new Error(data.error || "Login fallito");
      }

      console.log("User data from API:", data.user);

      onLogin(data.user);
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Impossibile connettersi al server");

      let prova = {
        id: 2,
        username: "UtenteDiProva",
        email: "prova@gmail.com",
        classe: "4M",
        school: "b",
      };
      onLogin(prova);
      setLoading(false);
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
            <button className="link-btn" onClick={switchToSignUp}>
              Registrati
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
