import "./Modal.css"
import { Button } from "../Button/Button"

export function Modal({ title, children, onClose, footer, className = "" }) {
  return (
    <div className="ui-modal__overlay" onMouseDown={onClose} role="dialog" aria-modal="true">
      <div className={`ui-modal ${className}`.trim()} onMouseDown={(e) => e.stopPropagation()}>
        <header className="ui-modal__header">
          <h2>{title}</h2>
          <Button type="button" variant="secondary" size="sm" onClick={onClose} aria-label="Chiudi">
            <i className="fas fa-xmark" />
          </Button>
        </header>
        <div className="ui-modal__body">{children}</div>
        {footer ? <footer className="ui-modal__footer">{footer}</footer> : null}
      </div>
    </div>
  )
}
