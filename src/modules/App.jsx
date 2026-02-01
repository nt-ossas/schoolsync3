import { useEffect } from "react";
import { useState } from "react";
import { AuthWrapper } from "./AuthWrapper";
import { Navbar } from "./Navbar.jsx";
import { Footer } from "./Footer.jsx";
import { StatsGrid } from "./StatsGrid.jsx";
import { MaterieList } from "./MaterieList.jsx";
import { Profile } from "./Profile.jsx";
import { Versions } from "./Versions.jsx";
import { UltimiVoti } from "./UltimiVoti.jsx";
//import { Miracolo } from "./Miracolo.jsx";
import "./app.css";

const API_BASE_URL = "/api";

export function App() {
  const [page, setPage] = useState("materie");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    mediaGenerale: "N/D",
    materieTotali: 0,
    votiTotali: 0,
    materieInsuff: 0,
  });
  
  // Stato per refresh automatico di UltimiVoti
  const [ultimiVotiKey, setUltimiVotiKey] = useState(0);
  
  const caricaTema = () => {
    /*const temaSalvato = localStorage.getItem("theme");
    if (temaSalvato) {
      import("./themes/" + temaSalvato + ".css")
    } else {
      import("./themes/dark.css")
    }*/
    alert("Funzione tema non ancora implementata.");
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("schoolsync_user");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        console.log("Utente caricato da localStorage:", parsedUser)
      } catch (e) {
        console.error("errore nel parsing dell'utente:", e);
        localStorage.removeItem("schoolsync_user");
      }
    }
    //caricaTema();
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      const userToSave = { ...user, statsData };
      localStorage.setItem("schoolsync_user", JSON.stringify(userToSave));
    }
  }, [user, statsData]);

  const handleUpdateStats = (newStats) => {
    setStatsData((prev) => ({ ...prev, ...newStats }));
  };

  // Funzione per forzare il refresh di UltimiVoti
  const refreshUltimiVoti = () => {
    setUltimiVotiKey(prev => prev + 1);
    console.log("Refresh UltimiVoti chiamato");
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

  // Gestione del contenuto della pagina in base allo stato `page`
  let pageContent;
  switch (page) {
    case "materie":
      pageContent = (
        <MaterieList
          user={user}
          apiUrl={API_BASE_URL}
          onUpdateStats={handleUpdateStats}
          periodo={periodo}
          anno={anno}
          onVotiModificati={refreshUltimiVoti} // Passa la funzione di refresh
        />
      );
      break;
    case "profile":
      pageContent = (
        <Profile 
          user={user}
          onLogout={handleLogout}
          onUserUpdated={(updatedUser) => {setUser((prev) => ({ ...prev, ...updatedUser }));}}
          caricaTema={caricaTema}
        />
      );
      break;
    case "versions":
      pageContent = (
        <Versions 
          user={user}
        />
      );
      break;
    /*case "miracolo":
      pageContent = <Miracolo />;
      break;*/
    default:
      pageContent = null;
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>caricamento...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthWrapper apiUrl={API_BASE_URL} onLogin={setUser} />;
  }

  let schoolCode = "";
  switch (String(user.school || "").trim().toLowerCase()) {
    case "b":
      schoolCode = "I.I.S. Blaise Pascal";
      break;
    case "d":
      schoolCode = "S. D'Arzo";
      break;
    default:
      schoolCode = user.school || "N/D";
  }

  return (
    <div className="app">
      <Navbar
        user={user}
        mediaGenerale={statsData.mediaGenerale}
        onPageChange={setPage}
        anno={anno}
        onChangeAnno={setAnno}
      />

      <main className="container section">
        <div className="welcome-section">
          <h1 className="welcome-title">
            ciao, <span className="capitalize">{user.username} </span> 
            <i className="fa-solid fa-hand-peace"></i>
          </h1>
          <p className="welcome-subtitle">
            {user.classe ? `Classe ${user.classe}` : ""} • {schoolCode}
          </p>
        </div>

        <div className="flex-header">
          <StatsGrid
            statsData={statsData}
            periodo={periodo}
            anno={anno}
            onChangePeriodo={setPeriodo}
            onChangeAnno={setAnno}
          />

          <UltimiVoti 
            key={ultimiVotiKey}
            user={user} 
            anno={anno}
            apiUrl={API_BASE_URL} 
          />
        </div>

        {pageContent}
      </main>
      <Footer 
        onPageChange={setPage} 
      />
    </div>
  );
}