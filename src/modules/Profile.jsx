import { useEffect } from "react";
import { useMemo } from "react";
import { useState } from "react";
import "./profile.css";

export function Profile({ user, onUserUpdated, onLogout, caricaTema }) {
  const initialForm = useMemo(
    () => ({
      id: user?.id ?? "",
      username: user?.username ?? "",
      email: user?.email ?? "",
      scuola: user?.school ?? user?.scuola ?? "",
      classe: user?.classe ?? "",
      password: "",
    }),
    [user],
  );

  const [form, setForm] = useState(initialForm);
  const [isEditing, setIsEditing] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => {
    setForm(initialForm);
    setIsEditing(false);
    setError("");
    setOk("");
  }, [initialForm]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  function startEdit() {
    setIsEditing(true);
    setOk("");
    setError("");
  }

  function cancelEdit() {
    setForm(initialForm);
    setIsEditing(false);
    setError("");
    setOk("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOk("");

    try {
      const res = await fetch("/api/aggiorna_profilo.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        const msg =
          data?.error ||
          (Array.isArray(data?.errors)
            ? data.errors.join(", ")
            : "Errore aggiornamento");
        throw new Error(msg);
      }

      // aggiorna lo user nel padre [web:89]
      onUserUpdated?.(data.user);

      setOk("Profilo aggiornato.");
      setIsEditing(false);
      setForm((p) => ({ ...p, password: "" }));
    } catch (err) {
      setError(err.message || "Errore di rete");
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  const ro = !isEditing;

  return (
    <div className="profile">
      <div className="info-user">
        <h2>Profilo</h2>
        <div className="stat-card">

          <form onSubmit={handleSubmit}>
            <div className="profile-form">
              <label>
                ID
                <input name="id" value={form.id} readOnly />
              </label>

              <label>
                Username
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  readOnly={ro}
                />
              </label>

              <label>
                Email
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  readOnly={ro}
                />
              </label>

              <label>
                Scuola
                <input
                  name="scuola"
                  value={form.scuola}
                  onChange={handleChange}
                  readOnly={ro}
                />
              </label>

              <label>
                Classe
                <input
                  name="classe"
                  value={form.classe}
                  onChange={handleChange}
                  readOnly={ro}
                />
              </label>

              <label>
                Nuova password (opzionale)
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  readOnly={ro}
                  placeholder={
                    isEditing ? "Lascia vuoto per non cambiarla" : "••••••••"
                  }
                />
              </label>
            </div>

            {error && <p className="error">{error}</p>}
            {ok && <p className="success">{ok}</p>}

            <div className="btns">
              {!isEditing ? (
                <>
                  <button type="button" onClick={startEdit}>
                    Modifica
                  </button>
                  <button
                    type="button"
                    onClick={onLogout}
                    className="btn btn-secondary logout-btn"
                  >
                    <i className="fas fa-arrow-right-from-bracket"></i>
                    Esci
                  </button>
                </>
              ) : (
                <>
                  <button type="button" onClick={cancelEdit} disabled={loading}>
                    Annulla
                  </button>
                  <button type="submit" disabled={loading}>
                    {loading ? "Salvataggio..." : "Salva"}
                  </button>
                </>
              )}
            </div>
          </form>

          <div className="theme-toggle">
              <button
                onClick={() => {
                  if (localStorage.getItem("theme") !== "dark") {
                    localStorage.removeItem("theme");
                    localStorage.setItem("theme", "dark");
                  } else {
                    localStorage.removeItem("theme");
                    localStorage.setItem("theme", "light");
                  }
                  caricaTema();
                }}
              >
              Tema Scuro
              </button>
          </div>
        </div>
      </div>
    </div>
  );
}
