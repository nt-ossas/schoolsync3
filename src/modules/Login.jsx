import { useState } from "react"
import { Link } from "react-router-dom"
import "./login.css"
import { Button, Card, Input, Alert } from "../components/ui"

export function Login({ onLogin, apiUrl }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const isEmail = email.includes("@")
      const identifier = email.trim()
      if (!identifier || !password) throw new Error("Inserisci email/username e password")

      const response = await fetch(`${apiUrl}/login.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [isEmail ? "email" : "username"]: identifier, password }),
        credentials: "include",
      })

      const data = await response.json()
      if (!data.success) throw new Error(data.error || "Login fallito")
      if (!data.user) throw new Error("Dati utente non validi")

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
          <h1>Accedi</h1>
          <p>Entra nel tuo workspace SchoolSync</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <Input type="text" value={email} onChange={(e) => setEmail(e.target.value)} label="Email o Username" required disabled={loading} placeholder="tocodrew" />
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} label="Password" required disabled={loading} placeholder="••••••••" />

          {error ? <Alert variant="error">{error}</Alert> : null}

          <Button type="submit" variant="primary" size="lg" loading={loading} className="auth-submit">
            {loading ? "Accesso..." : "Accedi"}
          </Button>
        </form>

        <div className="auth-footer">
          <p>
            Non hai un account? <Link to="/signup">Registrati</Link>
          </p>
        </div>
      </Card>
    </div>
  )
}
