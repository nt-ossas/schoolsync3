import { useEffect, useState } from "react";
import { Login } from "./Login.jsx";
import { Navbar } from "./Navbar.jsx";
import { Footer } from "./Footer.jsx";
import { StatsGrid } from "./StatsGrid.jsx";
import { MaterieList } from "./MaterieList.jsx";
import "./app.css";

const API_BASE_URL = "https://random.altervista.org/api";

export function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    mediaGenerale: "N/D",
    materieTotali: 0,
    votiTotali: 0,
    materieInsuff: 0,
  });

  useEffect(() => {
    const savedUser = localStorage.getItem("schoolsync_user");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error("errore nel parsing dell'utente:", e);
        localStorage.removeItem("schoolsync_user");
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      const userToSave = {
        ...user,
        statsData: statsData,
      };
      localStorage.setItem("schoolsync_user", JSON.stringify(userToSave));
    }
  }, [user, statsData]);

  const handleUpdateStats = (newStats) => {
    setStatsData((prev) => ({ ...prev, ...newStats }));
  };

  function handleLogout() {
    setUser(null);
    setStatsData({
      mediaGenerale: "N/D",
      materieTotali: 0,
      votiTotali: 0,
      materieInsuff: 0,
    });
    localStorage.removeItem("schoolsync_user");
  }

  const getAnnoDefault = () => {
    const oggi = new Date();
    const annoCorrente = oggi.getFullYear();
    const mese = oggi.getMonth() + 1;

    const annoScolastico = mese >= 9 ? annoCorrente : annoCorrente - 1;
    return annoScolastico - 2023;
  };

  const getPeriodoDefault = () => {
    const oggi = new Date();
    const mese = oggi.getMonth() + 1;
    return mese >= 1 && mese <= 8 ? 1 : 0;
  };

  const [anno, setAnno] = useState(getAnnoDefault());
  const [periodo, setPeriodo] = useState(getPeriodoDefault());

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>caricamento...</p>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={setUser} apiUrl={API_BASE_URL} />;
  }

  let schoolCode = "";

  switch (
    String(user.school || "")
      .trim()
      .toLowerCase()
  ) {
    case "b":
      schoolCode = "I.I.S. Blaise Pascal";
      break;
    case "d":
      schoolCode = "S. D'Arzo";
      break;
    default:
      schoolCode = "N/D";
  }

  return (
    <div className="app">
      <Navbar user={user} onLogout={handleLogout} apiUrl={API_BASE_URL} />

      <main className="container section">
        <div className="welcome-section">
          <h1 className="welcome-title">
            ciao, <span className="capitalize">{user.username}</span>👋
          </h1>
          <p className="welcome-subtitle">
            {user.classe ? `Classe ${user.classe}` : ""} • {schoolCode}
          </p>
        </div>

        <StatsGrid
          user={user}
          apiUrl={API_BASE_URL}
          statsData={statsData}
          periodo={periodo}
          anno={anno}
          onChangePeriodo={setPeriodo}
          onChangeAnno={setAnno}
        />

        <div className="materie-section">
          <MaterieList
            user={user}
            apiUrl={API_BASE_URL}
            onUpdateStats={handleUpdateStats}
            periodo={periodo}
            anno={anno}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
