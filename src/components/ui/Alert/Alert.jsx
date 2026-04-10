import "./Alert.css"

export function Alert({ variant = "info", children, className = "" }) {
  return <div className={`ui-alert ui-alert--${variant} ${className}`.trim()}>{children}</div>
}
