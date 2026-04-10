import "./Badge.css"

export function Badge({ variant = "default", children, className = "" }) {
  return <span className={`ui-badge ui-badge--${variant} ${className}`.trim()}>{children}</span>
}
