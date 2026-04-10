import "./Select.css"

export function Select({ label, error, helperText, className = "", children, id, ...props }) {
  const selectId = id || props.name

  return (
    <label className="ui-field" htmlFor={selectId}>
      {label ? <span className="ui-field__label">{label}</span> : null}
      <select id={selectId} className={`ui-select ${className}`.trim()} {...props}>
        {children}
      </select>
      {error ? <span className="ui-field__error">{error}</span> : null}
      {!error && helperText ? <span className="ui-field__helper">{helperText}</span> : null}
    </label>
  )
}
