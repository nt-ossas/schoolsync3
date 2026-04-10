import "./Table.css"

export function Table({ columns = [], data = [], emptyText = "Nessun dato" }) {
  return (
    <div className="ui-table-wrap">
      <table className="ui-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>{emptyText}</td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr key={row.id || index}>
                {columns.map((column) => {
                  const cellValue = column.render ? column.render(row) : row[column.key]
                  return (
                    <td key={column.key} data-label={column.title}>
                      {cellValue}
                    </td>
                  )
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
