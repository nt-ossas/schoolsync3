import "./stats.css";

export function StatsGrid({ statsData, periodo, anno, onChangePeriodo, onChangeAnno }) {
  const getInsuffText = (num) => {
    if (!num) return "Nessuna";
    return `${num} Insufficienz${num === 1 ? "a" : "e"}`;
  };

  const mediaNumber =
    statsData.mediaGenerale === "N/D" || statsData.mediaGenerale == null
      ? null
      : Number(statsData.mediaGenerale);

  const mediaColor =
    mediaNumber === null
      ? "var(--accent-blue)"
      : mediaNumber >= 6
        ? "var(--accent-green)"
        : "var(--accent-red)";

  const mediaBgClass =
    mediaNumber === null ? "media-nulla" : mediaNumber >= 6 ? "media-sufficiente" : "media-insufficiente";

  const insuffBgClass = statsData.materieInsuff >= 1 ? "media-insufficiente" : "media-nulla";

  const stats = [
    {
      title: "Media Generale",
      value: statsData.mediaGenerale || "N/D",
      icon: <i className="fa-solid fa-user-graduate" />,
      color: mediaColor,
      bgClass: mediaBgClass,
      type: "media",
    },
    {
      title: "Anno Scolastico",
      icon: <i className="fa fa-calendar" />,
      color: "var(--label-primary)",
      bgClass: "media-nulla",
      type: "anno",
    },
    {
      title: "Periodo",
      icon: periodo === 0 ? <i className="fas fa-hourglass-start" /> : <i className="fas fa-hourglass-end" />,
      color: "var(--label-primary)",
      bgClass: "media-nulla",
      type: "periodo",
    },
    {
      title: "Materie Insufficienti",
      value: getInsuffText(statsData.materieInsuff),
      icon: statsData.materieInsuff >= 1 ? <i className="fa-solid fa-triangle-exclamation"></i> : <i className="fa-solid fa-square-check"></i>,
      color: statsData.materieInsuff >= 1 ? "var(--accent-red)" : "var(--accent-green)",
      bgClass: insuffBgClass,
      type: "insufficienti",
    },
  ];

  return (
    <div className="stats-grid">
      {stats.map((stat, index) => (
        <div key={index} className="stat-card">
          <div className={"stat-bg " + stat.bgClass} />

          <div className="stat-header">
            <div className="stat-icon" style={{ backgroundColor: `${stat.color}15` }}>
              <span style={{ color: stat.color }}>{stat.icon}</span>
            </div>

            <div className="stat-info">
              <h3 className="stat-title">{stat.title}</h3>

              {stat.type === "anno" ? (
                <select
                  name="anno"
                  id="anno"
                  value={anno ?? ""}
                  onChange={(event) => onChangeAnno(event.target.value ? Number(event.target.value) : null)}
                  className="stat-value"
                  style={{ color: stat.color }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="">Tutti gli anni</option>
                  <option value="0">2023-24</option>
                  <option value="1">2024-25</option>
                  <option value="2">2025-26</option>
                  <option value="3">2026-27</option>
                  <option value="4">2027-28</option>
                  <option value="5">2028-29</option>
                  <option value="6">2029-30</option>
                </select>
              ) : stat.type === "periodo" ? (
                <select
                  name="periodo"
                  id="periodo"
                  value={periodo === null ? "tutti" : periodo}
                  onChange={(event) => {
                    const value = event.target.value;
                    onChangePeriodo(value === "tutti" ? null : Number(value));
                  }}
                  className="stat-value"
                  style={{ color: stat.color }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="tutti">Tutti</option>
                  <option value="0">Primo</option>
                  <option value="1">Secondo</option>
                </select>
              ) : (
                <p className={"stat-value" + (stat.type === "media" ? " media" : "")} style={{ color: stat.color }}>
                  {stat.value}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
