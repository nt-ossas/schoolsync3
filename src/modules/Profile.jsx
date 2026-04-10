import { useEffect, useMemo, useState } from "react"
import "./profile.css"
import { Button } from "../components/ui/Button/Button.jsx"
import { CambiaPfp } from "./CambiaPfp.jsx"
import { Scuole } from "../components/ui"

export function Profile({
  user,
  setUser,
  onUserUpdated,
  onLogout,
  caricaTema,
  apiUrl,
}) {
  const initialForm = useMemo(
    () => ({
      id: user?.id ?? "",
      username: user?.username ?? "",
      email: user?.email ?? "",
      provincia: user?.provincia ?? "",
      scuola: user?.school ?? user?.scuola ?? "",
      classe: user?.classe ?? "",
      password: "",
    }),
    [user],
  )

  const getPfpPath = (key) => (key ? `pfp/${key}.png` : "pfp/scimmia.png")

  const [showPopup, setShowPopup] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [ok, setOk] = useState("")
  const [pfpPath, setPfpPath] = useState(() => getPfpPath(user?.pfp))
  const [loadingVerify, setLoadingVerify] = useState(false)

  useEffect(() => {
    setForm(initialForm)
    setIsEditing(false)
    setError("")
    setOk("")
  }, [initialForm])
  useEffect(() => {
    setPfpPath(getPfpPath(user?.pfp))
  }, [user?.pfp])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
  }

  function handleClasseAnnoChange(value) {
    setForm((p) => ({
      ...p,
      classe: value + (p.classe.match(/[A-Z]+$/i)?.[0] || ""),
    }))
  }

  function handleClasseSezioneChange(value) {
    setForm((p) => ({
      ...p,
      classe: (p.classe.match(/^\d+/)?.[0] || "") + value,
    }))
  }

  function startEdit() {
    setIsEditing(true)
    setOk("")
    setError("")
  }
  function cancelEdit() {
    setForm(initialForm)
    setIsEditing(false)
    setError("")
    setOk("")
  }
  const changePfp = () => setShowPopup(true)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError("")
    setOk("")
    try {
      const res = await fetch("/api/aggiorna_profilo.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        credentials: "include",
      })
      const data = await res.json()
      if (!res.ok || data.success === false) {
        throw new Error(
          data?.error ||
            (Array.isArray(data?.errors)
              ? data.errors.join(", ")
              : "Errore aggiornamento"),
        )
      }
      onUserUpdated?.(data.user)
      setOk("Profilo aggiornato.")
      setIsEditing(false)
      setForm((p) => ({ ...p, password: "" }))
    } catch (err) {
      setError(err.message || "Errore di rete")
    } finally {
      setLoading(false)
    }
  }

  const verify = async () => {
    alert("Verifica Account in sviluppo...") 
    return
    alert("Verrà inviata un'email di verifica. Segui le istruzioni nella mail per verificare il tuo account.")

    setLoadingVerify(true)

    try {
      const res = await fetch("/api/mail/send_verify.php", { //da cambiare con il raspberry
        method: "POST",
        credentials: "include",
      })
      const data = await res.json()

      if (!res.ok || data.success === false) {
        throw new Error(data?.error || "Errore durante l'invio")
      }

      alert("Email inviata! Controlla la tua casella.")
    } catch (err) {
      alert(err.message || "Errore di rete")
    }
    setLoadingVerify(false)
  }

  if (!user) return null
  const ro = !isEditing

  const idToString = (id) => {
    const s = "" + id
    return "0".repeat(Math.max(0, 12 - s.length)) + s
  }

  return (
    <>
      {showPopup && (
        <CambiaPfp
          user={user}
          apiUrl={apiUrl}
          onClose={() => setShowPopup(false)}
          onPfpCambiata={(newPfp) => {
            const updatedUser = { ...user, pfp: newPfp }
            setPfpPath(getPfpPath(newPfp))
            setUser(updatedUser)
            onUserUpdated?.(updatedUser)
          }}
        />
      )}

      <div className="profile">
        <div className="profile-header">
          <h2>Profilo</h2>
        </div>

        <div className="info-user profile-header">
          <div className="profile-content">
            <div className="profile-section stat-card">
              <form onSubmit={handleSubmit}>
                <div className="pfp-section">
                  <Button
                    type="button"
                    onClick={changePfp}
                    variant="ghost"
                    className="pfp-btn"
                    title="Cambia foto profilo"
                  >
                    <img src={pfpPath} alt="pfp" />
                  </Button>
                  <h2>{user?.username}</h2>
                </div>

                <div className="profile-form">
                  <label>
                    ID
                    <input name="id" value={idToString(form.id)} disabled/>
                  </label>

                  <label>
                    Username
                    <input
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      disabled={ro}
                    />
                  </label>

                  <label>
                    Email
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      disabled={ro}
                    />
                  </label>

                  <label>
                    Provincia e Scuola
                    {isEditing ? (
                      <Scuole
                        initialProvincia={form.provincia}
                        initialScuola={form.scuola}
                        onProvinciaChange={(v) =>
                          setForm((p) => ({ ...p, provincia: v }))
                        }
                        onScuolaChange={(v) =>
                          setForm((p) => ({ ...p, scuola: v }))
                        }
                        disabled={loading}
                      />
                    ) : (
                      <>
                        <Scuole
                          initialProvincia={form.provincia}
                          initialScuola={form.scuola}
                          onProvinciaChange={(v) =>
                            setForm((p) => ({ ...p, provincia: v }))
                          }
                          onScuolaChange={(v) =>
                            setForm((p) => ({ ...p, scuola: v }))
                          }
                          disabled={true}
                        />
                      </>
                    )}
                  </label>

                  <label>
                    Classe
                    <div className="classe-row">
                      <select
                        value={form.classe.match(/^\d+/)?.[0] || ""}
                        onChange={(e) => handleClasseAnnoChange(e.target.value)}
                        disabled={loading || ro}
                        className="ui-select"
                      >
                        <option value="">Anno</option>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <option key={n} value={n}>
                            {n}°
                          </option>
                        ))}
                      </select>
                      <select
                        value={form.classe.match(/[A-Z]+$/i)?.[0]?.toUpperCase() || ""}
                        onChange={(e) => handleClasseSezioneChange(e.target.value)}
                        disabled={loading || ro}
                        className="ui-select"
                      >
                        <option value="">Sezione</option>
                        {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((l) => (
                          <option key={l} value={l}>
                            {l}
                          </option>
                        ))}
                      </select>
                    </div>
                  </label>

                  <label>
                    Nuova password (opzionale)
                    <input
                      name="password"
                      type="password"
                      value={form.password}
                      onChange={handleChange}
                      disabled={ro}
                      placeholder={
                        isEditing
                          ? "Lascia vuoto per non cambiarla"
                          : "••••••••"
                      }
                    />
                  </label>
                </div>

                {error && <p className="error">{error}</p>}
                {ok && <p className="success">{ok}</p>}

                <div className="btns">  
                  <Button
                    onClick={() =>
                      caricaTema(
                        window.document.documentElement.classList.contains(
                          "theme-light",
                        ),
                      )
                    }
                    variant="secondary"
                    size="full"
                  >
                    Cambia Tema
                  </Button>
                  {!user.verified && user.role == "admin" && (
                    <Button
                      onClick={verify}
                      variant="secondary"
                      size="full"
                      loading={loadingVerify}
                      disabled={loadingVerify}
                    >
                      {loadingVerify ? "Invio..." : "Verifica Account"}
                    </Button>
                  )}
                  {!isEditing ? (
                    <>
                      <Button onClick={startEdit} variant="secondary">
                        <i className="fas fa-edit"></i> Modifica Profilo
                      </Button>
                      <Button onClick={onLogout} variant="delete">
                        <i className="fas fa-arrow-right-from-bracket"></i> Esci
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        type="button"
                        onClick={cancelEdit}
                        variant="delete"
                        size="full"
                        disabled={loading}
                      >
                        Annulla
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        size="full"
                        disabled={loading}
                      >
                        {loading ? "Salvataggio..." : "Salva Modifiche"}
                      </Button>
                    </>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
