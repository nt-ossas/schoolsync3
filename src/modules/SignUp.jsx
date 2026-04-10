import { useState } from "react"
import { Link } from "react-router-dom"
import "./login.css"
import { Button, Card, Input, Alert } from "../components/ui"
import { Scuole } from "../components/ui"

export function SignUp({ onLogin, apiUrl }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [provincia, setProvincia] = useState("")
  const [scuola, setScuola] = useState("")
  const [classe, setClasse] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (!provincia || !scuola) {
        throw new Error("Seleziona provincia e scuola")
      }

      const response = await fetch(`${apiUrl}/register.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username, provincia, scuola, classe }),
        credentials: "include",
      })

      const data = await response.json()
      if (!data.success) throw new Error(data.error || "Registrazione fallita")
      onLogin(data.user)
    } catch (err) {
      setError(err.message || "Impossibile connettersi al server")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <Card className="auth-card auth-card--wide">
        <div className="auth-header">
          <div className="auth-logo">
            <i className="fa-solid fa-graduation-cap" />
          </div>
          <h1>Crea account</h1>
          <p>Registra il tuo profilo su SchoolSync</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <Input type="text" value={username} onChange={(e) => setUsername(e.target.value)} label="Username" required disabled={loading} placeholder="tocodrew" />
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} label="Email" required disabled={loading} placeholder="nome@mail.com" />
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} label="Password" required disabled={loading} placeholder="••••••••" />

          <div className="input-group">
            <label>Scuola</label>
            <Scuole
              initialProvincia={provincia}
              initialScuola={scuola}
              onProvinciaChange={setProvincia}
              onScuolaChange={setScuola}
              disabled={loading}
              className="ui-select"
            />
          </div>

          <div className="input-group">
            <label>Classe</label>
            <div className="classe-row">
              <select
                value={classe.match(/^\d+/)?.[0] || ""}
                onChange={(e) => setClasse(e.target.value + (classe.match(/[A-Z]+$/i)?.[0] || ""))}
                disabled={loading}
                className="ui-select"
              >
                <option value="">Anno</option>
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}°</option>)}
              </select>
              <select
                value={classe.match(/[A-Z]+$/i)?.[0]?.toUpperCase() || ""}
                onChange={(e) => setClasse((classe.match(/^\d+/)?.[0] || "") + e.target.value)}
                disabled={loading}
                className="ui-select"
              >
                <option value="">Sezione</option>
                {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          {error ? <Alert variant="error">{error}</Alert> : null}

          <Button type="submit" variant="primary" size="lg" loading={loading} className="auth-submit">
            {loading ? "Registrazione..." : "Registrati"}
          </Button>
        </form>

        <div className="auth-footer">
          <p>
            Hai già un account? <Link to="/login">Accedi</Link>
          </p>
        </div>
      </Card>
    </div>
  )
}
