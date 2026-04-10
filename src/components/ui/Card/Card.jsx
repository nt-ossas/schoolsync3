import "./Card.css"

export function Card({ children, className = "", interactive = false, ...props }) {
  return (
    <section className={`ui-card ${interactive ? "ui-card--interactive" : ""} ${className}`.trim()} {...props}>
      {children}
    </section>
  )
}
