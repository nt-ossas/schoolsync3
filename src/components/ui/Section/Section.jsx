import "./Section.css"

export function Section({ title, subtitle, actions, children, className = "" }) {
  return (
    <section className={`ui-section ${className}`.trim()}>
      {(title || subtitle || actions) && (
        <header className="ui-section__header">
          <div className="ui-section__heading">
            {title ? <h2>{title}</h2> : null}
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          {actions ? <div className="ui-section__actions">{actions}</div> : null}
        </header>
      )}
      <div className="ui-section__body">{children}</div>
    </section>
  )
}
