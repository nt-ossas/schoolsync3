import "./Spinner.css"

export function Spinner({ className = "" }) {
  return <span className={`ui-spinner ${className}`.trim()} aria-hidden="true" />
}
