import "./Sidebar.css"

export function Sidebar({ title = "Navigation", collapsed = false, onToggle, items = [] }) {
  return (
    <aside className={`ui-sidebar ${collapsed ? "is-collapsed" : ""}`}>
      <div className="ui-sidebar__top">
        <span className="ui-sidebar__title">{collapsed ? "" : title}</span>
        <button type="button" className="ui-sidebar__toggle" onClick={onToggle} aria-label="Toggle sidebar">
          <i className={`fa-solid ${collapsed ? "fa-angles-right" : "fa-angles-left"}`} />
        </button>
      </div>
      <nav className="ui-sidebar__list" aria-label="Dashboard navigation">
        {items.map((item) => (
          <div key={item.key || item.label} className="ui-sidebar__item">
            {item.content || item.label}
          </div>
        ))}
      </nav>
    </aside>
  )
}
