import "./Navbar.css"

export function UINavbar({ brand, actions, className = "" }) {
  return (
    <>
      <nav className={`ui-navbar ${className}`.trim()}>
        <div className="ui-navbar__container container">
          <div className="ui-navbar__brand">{brand}</div>
          <div className="ui-navbar__actions">{actions}</div>
        </div>
      </nav>
    </>
  )
}
