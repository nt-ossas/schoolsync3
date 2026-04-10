import "./Input.css"

export function Input({ label, error, helperText, className = "", id, ...props }) {
  const inputId = id || props.name

  return (
    <label className="ui-field" htmlFor={inputId}>
      {label ? <span className="ui-field__label">{label}</span> : null}
      <input id={inputId} className={`ui-input ${className}`.trim()} {...props} />
      {error ? <span className="ui-field__error">{error}</span> : null}
      {!error && helperText ? <span className="ui-field__helper">{helperText}</span> : null}
    </label>
  )
}
