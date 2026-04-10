import { useEffect, useState, useCallback } from "react"
import {BrowserRouter,Routes,Route,Navigate,NavLink,} from "react-router-dom"
import { Login } from "./Login"
import { SignUp } from "./SignUp"
import { Navbar } from "./Navbar.jsx"
import { Footer } from "./Footer.jsx"
import { StatsGrid } from "./StatsGrid.jsx"
import { MaterieList } from "./MaterieList.jsx"
import { Orario } from "./Orario.jsx"
import { Profile } from "./Profile.jsx"
import { Assistenza } from "./Assistenza.jsx"
import { Versions } from "./Versions.jsx"
import { UltimiVoti } from "./UltimiVoti.jsx"
import { Calendario } from "./Calendario.jsx"
import { Info } from "./Info.jsx"
import { ScrollTop } from "../components/tools/ScrollTop.jsx"
import { Page404 } from "./Page404.jsx"
import { AdminPanel } from "./AdminPanel.jsx"
import { TesterPanel } from "./TesterPanel.jsx"
import { Forum } from "../components/ui/Forum/Forum.jsx"
import { Andamento } from "./AndamentoGraph.jsx"
import { Layout, Sidebar, Section } from "../components/ui"
import "./app.css"
import "./forms.css"

const API_BASE_URL = "/api"

export function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [statsData, setStatsData] = useState({
    mediaGenerale: "N/D",
    materieTotali: 0,
    votiTotali: 0,
    materieInsuff: 0,
    ultimiVoti: [],
  })

  const [materie, setMaterie] = useState([])
  const [votiPerMateria, setVotiPerMateria] = useState({})
  const [anno, setAnno] = useState(getAnnoDefault())
  const [periodo, setPeriodo] = useState(getPeriodoDefault())
  const [votes, setVotes] = useState([])

  const sidebar = window.innerWidth < 1025

  const [sidebarCollapsed, setSidebarCollapsed] = useState(sidebar)

  function getAnnoDefault() {
    const oggi = new Date()
    const annoCorrente = oggi.getFullYear()
    const mese = oggi.getMonth() + 1
    const annoScolastico = mese >= 9 ? annoCorrente : annoCorrente - 1
    return annoScolastico - 2023
  }

  function getPeriodoDefault() {
    const oggi = new Date()
    const mese = oggi.getMonth() + 1
    return mese >= 1 && mese <= 8 ? 1 : 0
  }

  const caricaMaterie = useCallback(async () => {
    if (!user?.id) return
    try {
      const response = await fetch(`${API_BASE_URL}/carica_materie.php`, {
        method: "GET",
        credentials: "include",
      })
      const data = await response.json()
      if (data.success) {
        const materieCaricate = data.materie || []
        setMaterie(materieCaricate)
        caricaTuttiVoti(materieCaricate)
      }
    } catch (err) {
      console.error("Errore caricamento materie:", err)
    }
  }, [user?.id])

  const caricaTuttiVoti = useCallback(async (materieList) => {
    if (!materieList || materieList.length === 0) return
    try {
      const promises = materieList.map((materia) =>
        fetch(
          `${API_BASE_URL}/carica_voti.php?materia_index=MAT-${materia.id}`,
          {
            credentials: "include",
          },
        )
          .then((res) => res.json())
          .then((data) => ({
            id: materia.id,
            voti: data.success ? data.voti || [] : [],
          }))
          .catch(() => ({ id: materia.id, voti: [] })),
      )
      const risultati = await Promise.all(promises)
      const nuoviVoti = {}
      risultati.forEach(({ id, voti }) => {
        nuoviVoti[id] = voti
      })
      setVotiPerMateria(nuoviVoti)
    } catch (err) {
      console.error("Errore caricamento voti:", err)
    }
  }, [])

  const calcolaStats = useCallback(() => {
    const materieFiltratePerAnno = materie.filter((materia) => {
      if (anno === -1 || anno === null || anno === undefined) return true
      return materia.anno == anno
    })

    let totVoti = 0
    let sommaVoti = 0
    let countVoti = 0
    let materieInsuff = 0
    let ultimiVotiConMateria = []

    materieFiltratePerAnno.forEach((materia) => {
      const votiMateria = votiPerMateria[materia.id] || []
      const votiFiltrati = votiMateria.filter((voto) => {
        if (periodo === undefined || periodo === null) return true
        return Number(voto.periodo) === Number(periodo)
      })

      votiFiltrati.forEach((voto) => {
        ultimiVotiConMateria.push({
          id: voto.id,
          voto: voto.voto,
          peso: voto.peso,
          materia: materia.nome,
          data: voto.data,
        })
      })

      totVoti += votiFiltrati.length

      if (votiFiltrati.length > 0) {
        let sommaVotiMateria = 0
        let sommaPesi = 0

        votiFiltrati.forEach((voto) => {
          const votoNum = parseFloat(voto.voto)
          const peso = parseFloat(voto.peso || 1)
          if (!isNaN(votoNum) && !isNaN(peso) && peso > 0) {
            sommaVotiMateria += votoNum * peso
            sommaPesi += peso
            sommaVoti += votoNum * peso
            countVoti += peso
          }
        })

        const mediaMateria = sommaPesi > 0 ? sommaVotiMateria / sommaPesi : 0
        if (mediaMateria < 6) materieInsuff++
      }
    })

    const ultimiVoti = [...ultimiVotiConMateria].sort((a, b) => {
      const dataA = new Date(a.data || 0).getTime()
      const dataB = new Date(b.data || 0).getTime()

      if (dataB !== dataA) return dataB - dataA

      const idA = Number(a.id || 0)
      const idB = Number(b.id || 0)
      return idB - idA
    })

    return {
      materieTotali: materieFiltratePerAnno.length,
      votiTotali: totVoti,
      mediaGenerale: countVoti > 0 ? (sommaVoti / countVoti).toFixed(2) : "N/D",
      materieInsuff,
      ultimiVoti,
    }
  }, [materie, votiPerMateria, periodo, anno])

  useEffect(() => {
    const nuoveStats = calcolaStats()
    setStatsData(nuoveStats)
  }, [calcolaStats])

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/check_session.php`, {
          credentials: "include",
        })
        if (response.ok) {
          const data = await response.json()
          if (data.logged_in && data.user) {
            setUser(data.user)
            localStorage.setItem("schoolsync_user", JSON.stringify(data.user))
          } else {
            localStorage.removeItem("schoolsync_user")
          }
        }
      } catch (error) {
        console.error("Session check failed:", error)
        const savedUser = localStorage.getItem("schoolsync_user")
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser))
          } catch {
            localStorage.removeItem("schoolsync_user")
          }
        }
      } finally {
        setLoading(false)
      }
    }
    checkSession()

    const eliminaEventiPassati = async () => {
      try {
        await fetch(`${API_BASE_URL}/elimina_eventi_passati.php`, {
          method: "POST",
          credentials: "include",
        })
      } catch (err) {
        console.error("Errore eliminazione eventi passati:", err)
      }
    }
    eliminaEventiPassati()
  }, [])

  useEffect(() => {
    if (user?.id) caricaMaterie()
  }, [user?.id, caricaMaterie])

  useEffect(() => {
    if (user) {
      localStorage.setItem(
        "schoolsync_user",
        JSON.stringify({ ...user, statsData }),
      )
    }
  }, [user, statsData])

  const applyTheme = (isDark) => {
    document.documentElement.classList.toggle("theme-light", !isDark)
  }

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    applyTheme(mediaQuery.matches)

    const handleChange = (event) => applyTheme(event.matches)

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange)
    } else {
      mediaQuery.addListener(handleChange)
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange)
      } else {
        mediaQuery.removeListener(handleChange)
      }
    }
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
    localStorage.setItem("schoolsync_user", JSON.stringify(userData))
  }

  const refreshAll = useCallback(() => {
    caricaMaterie()
  }, [caricaMaterie])

  async function handleLogout() {
    if(!confirm("Sei sicuro di volere effettuare il logout?")) return
    try {
      const response = await fetch(`${API_BASE_URL}/logout.php`, {
        method: "POST",
        credentials: "include",
      })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setUser(null)
      setMaterie([])
      setVotiPerMateria({})
      setStatsData({
        mediaGenerale: "N/D",
        materieTotali: 0,
        votiTotali: 0,
        materieInsuff: 0,
        ultimiVoti: [],
      })
      localStorage.removeItem("schoolsync_user")
      window.location.href = "/login"
    }
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>caricamento...</p>
      </div>
    )
  }

  const sidebarItems = [
    {
      key: "dashboard",
      content: (
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `dashboard-nav-link ${isActive ? "is-active" : ""}`.trim()
          }
          onClick={() => {
            window.innerWidth < 1025 && setSidebarCollapsed(true)
          }}
        >
          <i className="fa-solid fa-chart-line"></i>
          <span
            className={"navbar-text " + (sidebarCollapsed ? "is-hidden" : "")}
          >
            Dashboard
          </span>
        </NavLink>
      ),
    },
    {
      key: "materie",
      content: (
        <NavLink
          to="/materie"
          className={({ isActive }) =>
            `dashboard-nav-link ${isActive ? "is-active" : ""}`.trim()
          }
          onClick={() => {
            window.innerWidth < 1025 && setSidebarCollapsed(true)
          }}
        >
          <i className="fa-solid fa-book-open" />
          <span
            className={"navbar-text " + (sidebarCollapsed ? "is-hidden" : "")}
          >
            Materie
          </span>
        </NavLink>
      ),
    },
    {
      key: "orario",
      content: (
        <NavLink
          to="/orario"
          className={({ isActive }) =>
            `dashboard-nav-link ${isActive ? "is-active" : ""}`.trim()
          }
          onClick={() => {
            window.innerWidth < 1025 && setSidebarCollapsed(true)
          }}
        >
          <i className="fa-solid fa-clock" />
          <span
            className={"navbar-text " + (sidebarCollapsed ? "is-hidden" : "")}
          >
            Orario
          </span>
        </NavLink>
      ),
    },
    {
      key: "profilo",
      content: (
        <NavLink
          to="/profilo"
          className={({ isActive }) =>
            `dashboard-nav-link ${isActive ? "is-active" : ""}`.trim()
          }
          onClick={() => {
            window.innerWidth < 1025 && setSidebarCollapsed(true)
          }}
        >
          <i className="fa-solid fa-user" />
          <span
            className={"navbar-text " + (sidebarCollapsed ? "is-hidden" : "")}
          >
            Profilo
          </span>
        </NavLink>
      ),
    },
    {
      key: "versioni",
      content: (
        <NavLink
          to="/versioni"
          className={({ isActive }) =>
            `dashboard-nav-link ${isActive ? "is-active" : ""}`.trim()
          }
          onClick={() => {
            window.innerWidth < 1025 && setSidebarCollapsed(true)
          }}
        >
          <i className="fa-solid fa-code-branch" />
          <span
            className={"navbar-text " + (sidebarCollapsed ? "is-hidden" : "")}
          >
            Versioni
          </span>
        </NavLink>
      ),
    },
    {
      key: "assistenza",
      content: (
        <NavLink
          to="/assistenza"
          className={({ isActive }) =>
            `dashboard-nav-link ${isActive ? "is-active" : ""}`.trim()
          }
          onClick={() => {
            window.innerWidth < 1025 && setSidebarCollapsed(true)
          }}
        >
          <i className="fa-solid fa-headset" />
          <span
            className={"navbar-text " + (sidebarCollapsed ? "is-hidden" : "")}
          >
            Assistenza
          </span>
        </NavLink>
      ),
    },
    {
      key: "logout",
      content: (
        <button
          type="button"
          className="dashboard-nav-link danger"
          onClick={handleLogout}
        >
          <i className="fa-solid fa-arrow-right-from-bracket" />
          <span
            className={"navbar-text " + (sidebarCollapsed ? "is-hidden" : "")}
          >
            Logout
          </span>
        </button>
      ),
    },
  ]

  if (user?.role === "admin" || user?.role === "tester") {
    sidebarItems.splice(sidebarItems.length - 1, 0, {
      key: "tester",
      content: (
        <NavLink
          to="/tester"
          className={({ isActive }) =>
            `dashboard-nav-link ${isActive ? "is-active" : ""}`.trim()
          }
          onClick={() => {
            window.innerWidth < 1025 && setSidebarCollapsed(true)
          }}
        >
          <i className="fa-solid fa-flask"></i>
          <span
            className={"navbar-text " + (sidebarCollapsed ? "is-hidden" : "")}
          >
            Tester
          </span>
        </NavLink>
      ),
    })
  }

  if (user?.role === "admin") {
    sidebarItems.splice(sidebarItems.length - 1, 0, {
      key: "admin",
      content: (
        <NavLink
          to="/admin"
          className={({ isActive }) =>
            `dashboard-nav-link ${isActive ? "is-active" : ""}`.trim()
          }
          onClick={() => {
            window.innerWidth < 1025 && setSidebarCollapsed(true)
          }}
        >
          <i className="fa-solid fa-user-shield" />
          <span
            className={"navbar-text " + (sidebarCollapsed ? "is-hidden" : "")}
          >
            Admin
          </span>
        </NavLink>
      ),
    })
  }

  async function loadVotes() {
    try {
      const res = await fetch(`${API_BASE_URL}/get_forum.php`, {
        credentials: "include",
      })
      const data = await res.json()
      if (data.success && data.votes) {
        setVotes(data.votes)
        return
      }
    } catch (err) {
      console.error("Errore caricamento forum:", err)
    }
    setVotes([])
  }

  return (
    <BrowserRouter>
      <ScrollTop />
      <Routes>
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/" replace />
            ) : (
              <Login apiUrl={API_BASE_URL} onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/signup"
          element={
            user ? (
              <Navigate to="/" replace />
            ) : (
              <SignUp apiUrl={API_BASE_URL} onLogin={handleLogin} />
            )
          }
        />
        <Route path="/404" element={<Page404 />} />
        <Route
          path="/*"
          element={
            user ? (
              <Layout
                navbar={
                  <Navbar
                    user={user}
                    mediaGenerale={statsData.mediaGenerale}
                    anno={anno}
                    onChangeAnno={setAnno}
                    onChangePeriodo={setPeriodo}
                    periodo={periodo}
                    sidebarCollapsed={sidebarCollapsed}
                    setSidebarCollapsed={setSidebarCollapsed}
                  />
                }
                sidebar={
                  <Sidebar
                    title="Workspace"
                    collapsed={sidebarCollapsed}
                    onToggle={() => setSidebarCollapsed((v) => !v)}
                    items={sidebarItems}
                  />
                }
                footer={<Footer />}
              >
                <div className="container app-dashboard-content">
                  <Routes>
                    <Route
                      path="/"
                      element={
                        <div className="dashboard-page">
                          <section className="welcome-section">
                            <h1 className="welcome-title">
                              Ciao,{" "}
                              <span className="capitalize">
                                {user.username}{" "}
                                <i className="fa-solid fa-hand-peace"></i>
                              </span>
                            </h1>
                            <p className="welcome-subtitle">
                              {user.classe
                                ? `Classe ${user.classe}`
                                : "Classe non impostata"}{" "}
                              • {user.school ?? "Scuola non impostata"}
                            </p>
                          </section>

                          <Section
                            title="Andamento scolastico"
                            subtitle="Panoramica del rendimento scolastico."
                          >
                            <StatsGrid statsData={statsData} />
                          </Section>

                          <Section
                            title="Test e scadenze"
                            subtitle="Verifiche, interrogazioni e compiti da monitorare."
                            className="activity-section"
                          >
                            <Calendario user={user} apiUrl={API_BASE_URL} />
                          </Section>

                          <Section
                            title={"Grafico Andamento"}
                            subtitle="Visualizzazione dell'andamento scolastico nel tempo."
                          >
                            {statsData.ultimiVoti.length > 0 &&
                              <Andamento data={[...statsData.ultimiVoti].map(voto => ({ voto: voto.voto, id: voto.id, peso: voto.peso })).reverse()} />
                            }
                          </Section>

                          <Section
                            title="Blocchi Operativi"
                            subtitle="Contenuti secondari per pianificazione e focus."
                          >
                            <Info />
                          </Section>
                        </div>
                      }
                    />

                    <Route
                      path="/materie"
                      element={
                        <>
                          <Section
                            title="Andamento scolastico"
                            subtitle="Panoramica dell'andamento scolastico."
                          >
                            <StatsGrid statsData={statsData} />
                          </Section>
                          <UltimiVoti
                            user={user}
                            voti={statsData.ultimiVoti || []}
                          />
                          {/*<Forum
                            title="Preferisci le materie espanse con i voti disponibili o un elemento da cliccare per visualizzare i voti?"
                            description="Esprimi la tua preferenza, il sondaggio avrà scadenza 2026-03-30"
                            votes={votes}
                            expired="2026-03-30"
                            apiUrl={API_BASE_URL}
                            loadVotes={loadVotes}
                          />*/}
                          <MaterieList
                            user={user}
                            apiUrl={API_BASE_URL}
                            onUpdateStats={(s) =>
                              setStatsData((prev) => ({ ...prev, ...s }))
                            }
                            periodo={periodo}
                            anno={anno}
                            onVotiModificati={refreshAll}
                            materieEsterne={materie}
                            votiEsterniPerMateria={votiPerMateria}
                            onMaterieChange={caricaMaterie}
                          />
                        </>
                      }
                    />

                    <Route
                      path="/orario"
                      element={
                        <>
                          <Section
                            title="Orario scolastico"
                            subtitle="Visualizzazione dell'orario settimanale."
                          >
                            <Orario apiUrl={API_BASE_URL} user={user} />
                          </Section>
                        </>
                      }
                    />

                    <Route
                      path="/profilo"
                      element={
                        <Profile
                          user={user}
                          setUser={setUser}
                          onLogout={handleLogout}
                          onUserUpdated={(updatedUser) =>
                            setUser((prev) => ({ ...prev, ...updatedUser }))
                          }
                          caricaTema={applyTheme}
                          apiUrl={API_BASE_URL}
                        />
                      }
                    />

                    <Route
                      path="/assistenza"
                      element={<Assistenza user={user} apiUrl={API_BASE_URL} />}
                    />

                    <Route
                      path="/tester"
                      element={
                        user?.role === "admin" || user?.role === "tester" ? (
                          <TesterPanel
                            apiUrl={API_BASE_URL}
                            userRole={user?.role}
                          />
                        ) : (
                          <Navigate to="/404" replace />
                        )
                      }
                    />

                    <Route
                      path="/admin"
                      element={
                        user?.role === "admin" ? (
                          <AdminPanel apiUrl={API_BASE_URL} />
                        ) : (
                          <Navigate to="/404" replace />
                        )
                      }
                    />

                    <Route
                      path="/versioni"
                      element={<Versions user={user} apiUrl={API_BASE_URL} />}
                    />
                    <Route path="*" element={<Navigate to="/404" replace />} />
                  </Routes>
                </div>
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
