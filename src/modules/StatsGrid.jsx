import './stats.css';

export function StatsGrid({ statsData, periodo, anno, onChangePeriodo, onChangeAnno }) {

  const getInsuffText = (num) => {
    if (!num) return "Nullo";
    return num + " Insufficienz" + (num == 1 ? "a" : "e");
  };

  const stats = [
    {
      title: "Media Generale",
      value: statsData.mediaGenerale || "N/D",
      icon: "📈",
      color: statsData.mediaGenerale === "N/D" 
        ? "var(--accent-blue)" 
        : parseFloat(statsData.mediaGenerale) >= 6 
          ? "var(--accent-green)" 
          : "var(--accent-red)",
      type: "media"
    },
    {
      title: "Anno Scolastico",
      value: null,
      icon: "📅",
      color: "var(--text-color)",
      type: "anno"
    },
    {
      title: "Periodo",
      value: null,
      icon: "📚",
      color: "var(--text-color)",
      type: "periodo"
    },
    {
      title: "Materie Insufficienti",
      value: getInsuffText(statsData.materieInsuff),
      icon: statsData.materieInsuff >= 1 ? "⚠️" : "✅",
      color: statsData.materieInsuff >= 1 
        ? "var(--accent-red)" 
        : "var(--accent-green)",
      type: "insufficienti"
    }
  ];

  return (
    <div className="stats-grid">
      {stats.map((stat, index) => (
        <div key={index} className="stat-card">
          
          <div className={"stat-bg " + (
            stat.type === "media"
              ? (stat.value >= 6 ? "media-sufficiente" : stat.value < 6 ? "media-insufficiente" : "media-nulla")
              : stat.type === "insufficienti"
                ? (statsData.materieInsuff >= 1 ? "media-insufficiente" : "media-nulla")
                : "media-nulla"
          )}></div>

          <div className="stat-header">
            <div 
              className="stat-icon" 
              style={{ backgroundColor: `${stat.color}15` }}
            >
              <span style={{ color: stat.color }}>{stat.icon}</span>
            </div>

            <div className="stat-info">
              <h3 className="stat-title">{stat.title}</h3>

              {stat.type === "anno" ? (
                <select 
                  name="anno" 
                  id="anno" 
                  value={anno ?? ""}
                  onChange={event => onChangeAnno(event.target.value ? Number(event.target.value) : null)}
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
                  onChange={event => {
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
              ) : stat.type === "media" ? (
                <p className="stat-value media" style={{ color: stat.color }}>
                  {stat.value}
                </p>

              ) : (
                <p className="stat-value" style={{ color: stat.color }}>
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
