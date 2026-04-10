import "./Button.css"
import { Spinner } from "../Spinner/Spinner"

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  className = "",
  children,
  onClick = () => {},
  ...props
}) {
  const isDisabled = disabled || loading

  return (
    <button
      className={`ui-btn ui-btn--${variant} ui-btn--${size} ${className}`.trim()}
      disabled={isDisabled}
      {...props}
      onClick={onClick}
    >
      {loading ? <Spinner className="ui-btn__spinner" /> : leftIcon ? <span className="ui-btn__icon">{leftIcon}</span> : null}
      <span>{children}</span>
      {!loading && rightIcon ? <span className="ui-btn__icon">{rightIcon}</span> : null}
    </button>
  )
}
