import './navbar.css';

export function Navbar({ user, onLogout }) {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <span className="navbar-logo">🎓</span>
          <h2 className="navbar-title">SchoolSync</h2>
        </div>
        
        <div className="navbar-menu">
          <button className="navbar-profile">
            <span className="profile-avatar">{user?.username?.charAt(0)}</span>
            <span className="profile-name">{user?.username}</span>
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