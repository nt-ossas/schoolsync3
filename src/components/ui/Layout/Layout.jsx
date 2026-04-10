import "./Layout.css"

export function Layout({ navbar, sidebar, children, footer }) {
  return (
    <div className="ui-layout">
      {navbar}
      <div className="ui-layout__frame">
        {sidebar ? <div className="ui-layout__sidebar">{sidebar}</div> : null}
        <div>
          <main className="ui-layout__content">{children}</main>
          {footer}
        </div>
      </div>
    </div>
  )
}
