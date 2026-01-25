import './navbar.css';

export function Navbar({ user, onLogout, mediaGenerale }) {
  const classMedia = () => {
    if (isNaN(mediaGenerale)) {
      return "nullo";
    }
    return mediaGenerale >= 6 ? "sufficiente" : "insufficiente";
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <span className="navbar-logo">🎓</span>
          <h2 className="navbar-title">SchoolSync</h2>
        </div>

        <div className="navbar-menu">
          <button className="navbar-profile">
            <span className={"profile-avatar " + classMedia()}>
              {user?.username?.charAt(0)?.toUpperCase() || "?"}
            </span>
            <span className="profile-name">{user?.username || "Anonimo"}</span>
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