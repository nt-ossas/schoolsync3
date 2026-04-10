import "./Queue.css"

export function Queue({ todos = [] }) {
  
  return (
    <>
      <div className="queue">
        <div className="queue-header">
          <h2>Status dello sviluppo del sito</h2>
        </div>
        <div className="queue-body">
          <div className="line"></div>
          <div className="item">
            <div className="icon active"></div>
            <div className="queue-item">
              <span>Versione attuale</span>
            </div>
          </div>
          {todos.map((item, index) => (
            <div className="item" key={index}>
              <div className={"icon " + (item.completato ? "active" : "")}></div>
              <div className="queue-item">
                <span>{item?.titolo}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
