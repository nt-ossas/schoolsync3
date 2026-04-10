import { useCallback, useEffect, useState } from "react"
import { Accessi } from "./Accessi"
import { Alert, Button, Input, Modal, Scuole, Section, Select, Table } from "../components/ui"
import { PFP_CHOICES } from "../constants/pfpChoices"
import "./admin.css"

export function AdminPanel({ apiUrl }) {
  const [users, setUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [error, setError] = useState("")
  const [editingUser, setEditingUser] = useState(null)
  const [userForm, setUserForm] = useState({})
  const [savingUser, setSavingUser] = useState(false)
  const [graficoDati, setGraficoDati] = useState([])

  const loadUsers = useCallback(async () => {
    setUsersLoading(true)
    setError("")
    try {
      const response = await fetch(`${apiUrl}/carica_utenti.php`, {
        credentials: "include",
      })
      const data = await response.json()
      if (!data.success) throw new Error(data.error || "Errore nel caricamento degli utenti")
      setUsers(Array.isArray(data.users) ? data.users : [])
    } catch (err) {
      setError(err.message || "Errore nel caricamento degli utenti")
    } finally {
      setUsersLoading(false)
    }
  }, [apiUrl])

  const loadGraph = useCallback(async (giorni = 9999999) => {
    try {
      const res = await fetch(`${apiUrl}/carica_accessi.php?giorni=${giorni}`, {
        credentials: "include",
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setGraficoDati(data.dati)
    } catch (err) {
      setError(err.message)
    }
  }, [apiUrl])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  useEffect(() => {
    loadUsers()
    loadGraph()
  }, [loadUsers, loadGraph])

  const userColumns = [
    { key: "id", title: "ID" },
    { key: "username", title: "Username" },
    { key: "email", title: "Email" },
    { key: "provincia", title: "Provincia" },
    { key: "classe", title: "Classe" },
    { key: "school", title: "Scuola" },
    { key: "role", title: "Ruolo" },
    {
      key: "pfp",
      title: "PFP",
      render: (row) => (
        <div className="admin-pfp">
          <img src={`pfp/${row.pfp || "scimmia"}.png`} alt={row.pfp || "scimmia"} />
        </div>
      ),
    },
    {
      key: "token_segnalazioni",
      title: "segnal.",
      render: (row) => (row.token_segnalazioni ?? "-"),
    },
    { key: "token_groq", title: "Groq" },
    {
      key: "last_active",
      title: "Ultima attività",
      render: (row) => (row.last_active ? row.last_active : "-"),
    },
    {
      key: "actions",
      title: "",
      render: (row) => (
        <Button size="sm" variant="ghost" onClick={() => handleEditUser(row)}>
          Modifica
        </Button>
      ),
    },
  ]

  function handleEditUser(user) {
    setEditingUser(user)
    setUserForm({
      id: user.id ?? "",
      username: user.username ?? "",
      email: user.email ?? "",
      provincia: user.provincia ?? "",
      classe: user.classe ?? "",
      school: user.school ?? "",
      password: "",
      role: user.role ?? "user",
      pfp: user.pfp ?? "scimmia",
      token_groq: user.token_groq ?? 0,
      token_segnalazioni: user.token_segnalazioni ?? 0,
      last_active: user.last_active ?? "",
    })
  }

  async function handleUserSubmit(e) {
    e.preventDefault()
    if (!editingUser) return

    setSavingUser(true)
    setError("")

    const payload = {
      id: editingUser.id,
      username: userForm.username,
      email: userForm.email,
      provincia: userForm.provincia,
      classe: userForm.classe,
      school: userForm.school,
      password: userForm.password,
      role: userForm.role,
      pfp: userForm.pfp,
      token_groq: Number(userForm.token_groq) || 0,
      token_segnalazioni: Number(userForm.token_segnalazioni) || 0,
      last_active: userForm.last_active,
    }

    try {
      const response = await fetch(`${apiUrl}/modifica_utente.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || "Errore durante l'aggiornamento utente")
      }

      setEditingUser(null)
      await loadUsers()
    } catch (err) {
      setError(err.message || "Errore durante l'aggiornamento utente")
    } finally {
      setSavingUser(false)
    }
  }

  function closeModal() {
    setEditingUser(null)
    setUserForm({})
  }

  function handleClasseAnnoChange(value) {
    setUserForm((prev) => ({
      ...prev,
      classe: value + (prev.classe?.match(/[A-Z]+$/i)?.[0] || ""),
    }))
  }

  function handleClasseSezioneChange(value) {
    setUserForm((prev) => ({
      ...prev,
      classe: (prev.classe?.match(/^\d+/)?.[0] || "") + value,
    }))
  }

  function formatUserId(id) {
    const stringId = String(id ?? "")
    return "0".repeat(Math.max(0, 12 - stringId.length)) + stringId
  }

  return (
    <div className="admin-page">
      {error && (
        <Alert variant="error">
          {error}
          <Button type="button" variant="ghost" onClick={() => setError("")}>
            Chiudi
          </Button>
        </Alert>
      )}

      <Section title="Utenti" subtitle="Panoramica completa degli account">
        {usersLoading ? (
          <>
            <div className="loading-spinner">
              <div className="spinner" />
              <p>Caricamento tabella...</p>
            </div>
          </>
        ) : (
          <div className="responsive-table-wrapper">
            <Accessi data={graficoDati} onRangeChange={loadGraph} />
            <Table columns={userColumns} data={users} emptyText="Nessun utente disponibile" />
          </div>
        )}
      </Section>

      {editingUser && (
        <Modal
          title={`Modifica ${editingUser.username}`}
          onClose={closeModal}
          footer={
            <>
              <Button variant="secondary" onClick={closeModal} disabled={savingUser}>
                Annulla
              </Button>
              <Button variant="primary" type="submit" form="admin-user-form" loading={savingUser}>
                Salva
              </Button>
            </>
          }
        >
          <form id="admin-user-form" className="admin-user-form" onSubmit={handleUserSubmit}>
            <Input label="ID" name="id" value={formatUserId(userForm.id)} disabled />
            <Input
              label="Username"
              name="username"
              value={userForm.username}
              onChange={(e) => setUserForm((prev) => ({ ...prev, username: e.target.value }))}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={userForm.email}
              onChange={(e) => setUserForm((prev) => ({ ...prev, email: e.target.value }))}
            />
            <div className="ui-field">
              <span className="ui-field__label">Provincia e Scuola</span>
              <Scuole
                initialProvincia={userForm.provincia}
                initialScuola={userForm.school}
                onProvinciaChange={(value) => setUserForm((prev) => ({ ...prev, provincia: value }))}
                onScuolaChange={(value) => setUserForm((prev) => ({ ...prev, school: value }))}
                disabled={savingUser}
                className="ui-select"
              />
            </div>
            <div className="ui-field">
              <span className="ui-field__label">Classe</span>
              <div className="classe-row">
                <Select
                  name="classe-anno"
                  value={userForm.classe?.match(/^\d+/)?.[0] || ""}
                  onChange={(e) => handleClasseAnnoChange(e.target.value)}
                  disabled={savingUser}
                >
                  <option value="">Anno</option>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}°
                    </option>
                  ))}
                </Select>
                <Select
                  name="classe-sezione"
                  value={userForm.classe?.match(/[A-Z]+$/i)?.[0]?.toUpperCase() || ""}
                  onChange={(e) => handleClasseSezioneChange(e.target.value)}
                  disabled={savingUser}
                >
                  <option value="">Sezione</option>
                  {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((lettera) => (
                    <option key={lettera} value={lettera}>
                      {lettera}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <Input
              label="Nuova password (opzionale)"
              name="password"
              type="password"
              value={userForm.password}
              onChange={(e) => setUserForm((prev) => ({ ...prev, password: e.target.value }))}
              placeholder="Lascia vuoto per non cambiarla"
              helperText="Minimo 6 caratteri"
            />
            <Select
              label="Ruolo"
              name="role"
              value={userForm.role}
              onChange={(e) => setUserForm((prev) => ({ ...prev, role: e.target.value }))}
            >
              <option value="user">User</option>
              <option value="tester">Tester</option>
              <option value="admin">Admin</option>
            </Select>
            <div className="pfp-grid admin-pfp-grid">
              {PFP_CHOICES.map((choice) => (
                <Button
                  key={choice}
                  type="button"
                  className={`pfp-item pfp-btn ${userForm.pfp === choice ? "selected" : ""}`}
                  variant="ghost"
                  onClick={() => setUserForm((prev) => ({ ...prev, pfp: choice }))}
                >
                  <img src={`pfp/${choice}.png`} alt={choice} />
                </Button>
              ))}
            </div>
            <Input
              label="Token segnalazioni"
              name="token_segnalazioni"
              type="number"
              min="0"
              value={userForm.token_segnalazioni}
              onChange={(e) => setUserForm((prev) => ({ ...prev, token_segnalazioni: e.target.value }))}
            />
            <Input
              label="Token Groq"
              name="token_groq"
              type="number"
              min="0"
              value={userForm.token_groq}
              onChange={(e) => setUserForm((prev) => ({ ...prev, token_groq: e.target.value }))}
            />
            <Input
              label="Ultima attività"
              name="last_active"
              value={(userForm.last_active || "").split(" ")[0]}
              onChange={(e) => setUserForm((prev) => ({ ...prev, last_active: e.target.value }))}
              helperText="Formato libero (2024-06-12 14:20:00)"
            />
          </form>
        </Modal>
      )}
    </div>
  )
}
