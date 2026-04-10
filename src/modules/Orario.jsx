import { useState, useEffect } from "react"
import { Card, Spinner } from "../components/ui"

export function Orario({ apiUrl, user }) {
  const [orari, setOrari] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchOrari = async () => {
      setLoading(true)
      setError("")
      try {
        const response = await fetch(`${apiUrl}/carica_orario.php`, {
          method: "POST",
          credentials: "include"
        })
        const data = await response.json()
        if (data.success) {
          setOrari(data.orari || [])
        } else {
          setError(data.error || "Errore nel caricamento degli orari.")
        }
      } catch (err) {
        console.error("Errore caricamento orari:", err)
        setError("Errore di rete nel caricamento degli orari.")
      } finally {
        setLoading(false)
      }
    }

    fetchOrari()
  }, [apiUrl])

  return (
    <Card className={"secondary-content " + (user?.role === "admin" ? "" : "blurred")}>
      <h2>Orari</h2>
      {loading ? (
        <p style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
          <Spinner />
          Caricamento orari...
        </p>
      ) : error ? (
        <p>{error}</p>
      ) : orari.length > 0 ? (
        <>
          <ul>
            {orari.map((orario, index) => (
              <li key={index}>
                {orario.giorno} - {orario.ora}: {orario.materia} - {orario.aula}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>Nessun orario disponibile.</p>
      )}
    </Card>
  )
}
