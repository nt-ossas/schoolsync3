import "./navbar.css";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { UINavbar, Select, Button, Badge } from "../components/ui"

export function Navbar({
  user,
  anno,
  onChangeAnno,
  onChangePeriodo,
  periodo,
  sidebarCollapsed,
  setSidebarCollapsed,
}) {
  const { pathname } = useLocation()
  const mostraSelect = ["/", "/dashboard", "/materie"].includes(pathname)

  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia("(max-width: 1024px)").matches,
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1024px)");
    const handler = (event) => setIsMobile(event.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [])

  const brand = isMobile ? (
    <Link to="/" className="navbar-brand" title="Dashboard">
      <span className="navbar-logo">
        <i className="fa-solid fa-graduation-cap" />
      </span>
      <div className="navbar-brand__text">
        <strong>SchoolSync</strong>
        <span>Dashboard</span>
      </div>
    </Link>
  ) : (
    <div onClick={() => setSidebarCollapsed(false)} className="navbar-brand">
      <span className="navbar-logo">
        <i className="fa-solid fa-graduation-cap" />
      </span>
      <div className="navbar-brand__text">
        <strong>SchoolSync</strong>
        <span>Dashboard</span>
      </div>
    </div>
  );

  const sidebarToggle = isMobile ? (
    <Button
      variant="ghost"
      className="navbar-sidebar-toggle"
      onClick={() => setSidebarCollapsed((v) => !v)}
    >
      <i className={`fa-solid ${sidebarCollapsed ? "fa-bars" : "fa-xmark"}`} />
    </Button>
  ) : null;

  const actions = (
    <>
      {sidebarToggle}

      {mostraSelect && (
        <div className="navbar-context">
          <Select
            name="anno"
            id="anno"
            value={anno ?? ""}
            onChange={(event) =>
              onChangeAnno(event.target.value ? Number(event.target.value) : null)
            }
            className="navbar-select"
            title="Anno scolastico"
          >
            <option value="-1">Tutti gli anni</option>
            <option value="0">A.S. 2023-24</option>
            <option value="1">A.S. 2024-25</option>
            <option value="2">A.S. 2025-26</option>
            <option value="3">A.S. 2026-27</option>
            <option value="4">A.S. 2027-28</option>
            <option value="5">A.S. 2028-29</option>
            <option value="6">A.S. 2029-30</option>
          </Select>

          <Select
            name="periodo"
            id="periodo"
            value={periodo === null ? "tutti" : periodo}
            onChange={(event) => {
              const value = event.target.value;
              onChangePeriodo(value === "tutti" ? null : Number(value));
            }}
            className="navbar-select"
          >
            <option value="tutti">Tutti i periodi</option>
            <option value="0">Primo periodo</option>
            <option value="1">Secondo periodo</option>
          </Select>
        </div>
      )}

      {user?.classe ? <Badge variant="info">Classe {user.classe}</Badge> : null}

      <Link to="/profilo" className="navbar-profile-link">
        <Button
          variant="ghost"
          className="navbar-profile"
          title="Profilo"
          leftIcon={
            <img
              src={user?.pfp ? "pfp/" + user.pfp + ".png" : "pfp/scimmia.png"}
              className="pfp-img"
              alt={user?.pfp ? user.pfp : "scimmia"}
            />
          }
        >
          <span className="profile-name">{user.username}</span>
        </Button>
      </Link>
    </>
  );

  return <UINavbar brand={brand} actions={actions} className="navbar" />;
}