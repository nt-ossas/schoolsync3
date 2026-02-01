import "./navbar.css";

export function Navbar({ user, mediaGenerale, onPageChange, anno, onChangeAnno }) {
  const classMedia = () => {
    if (isNaN(mediaGenerale)) {
      return "nullo";
    }
    return mediaGenerale >= 6
      ? "sufficiente"
      : mediaGenerale >= 5
        ? "mid"
        : "insufficiente";
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div
          className="navbar-brand"
          onClick={() => onPageChange("materie")}
          title="Torna alla Home"
        >
          <span className="navbar-logo">
            <i className="fa-solid fa-graduation-cap"></i>
          </span>
          <h2 className="navbar-title">SchoolSync Beta</h2>
        </div>

        <div className="navbar-menu">
          <button
            className="navbar-profile"
            onClick={() => onPageChange("profile")}
            title="Profilo"
          >
            <span className="profile-name">{user.username}</span>
            <span className={"profile-avatar " + classMedia()}>
              {user?.username?.charAt(0)?.toUpperCase() || "?"}
            </span>
          </button>
          <select
            name="anno"
            id="anno"
            value={anno ?? ""}
            onChange={(event) => onChangeAnno(event.target.value ? Number(event.target.value) : null)}
            className="stat-value"
            onClick={(e) => e.stopPropagation()}
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
          </select>
        </div>
      </div>
    </nav>
  );
}
