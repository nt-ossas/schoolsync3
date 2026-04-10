import "./ListItem.css"

export function ListItem({ title, subtitle, meta, icon, onClick, right, className = "" }) {
  const Tag = onClick ? "button" : "div"

  return (
    <Tag className={`ui-list-item ${onClick ? "is-clickable" : ""} ${className}`.trim()} onClick={onClick}>
      <div className="ui-list-item__left">
        {icon ? <span className="ui-list-item__icon">{icon}</span> : null}
        <div className="ui-list-item__content">
          <h4>{title}</h4>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
      </div>
      <div className="ui-list-item__right">
        {meta ? <span className="ui-list-item__meta">{meta}</span> : null}
        {right}
      </div>
    </Tag>
  )
}
