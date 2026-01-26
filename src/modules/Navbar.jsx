import "./navbar.css";

export function Navbar({ user, onLogout, mediaGenerale, handlePage }) {
  const classMedia = () => {
    if (isNaN(mediaGenerale)) {
      return "nullo";
    }
    return mediaGenerale >= 6 ? "sufficiente" : "insufficiente";
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div
          className="navbar-brand"
          onClick={() => handlePage("materie")}
          title="Torna alla Home"
        >
          <span className="navbar-logo">
            <i className="fa-solid fa-graduation-cap"></i>
          </span>
          <h2 className="navbar-title">SchoolSync</h2>
        </div>

        <div className="navbar-menu">
          <button
            className="navbar-profile"
            onClick={() => handlePage("profile")}
          >
            <span className={"profile-avatar " + classMedia()}>
              {user?.username?.charAt(0)?.toUpperCase() || "?"}
            </span>
            <span className="profile-name">{user.username}</span>
          </button>

          <button onClick={onLogout} className="btn btn-secondary logout-btn">
            <i className="fas fa-arrow-right-from-bracket"></i>
            Esci
          </button>
        </div>
      </div>
    </nav>
  );
}
