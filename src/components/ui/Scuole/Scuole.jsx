import { useState, useEffect } from "react"

let cache = null
const SCUOLE_URL = `./scuole_light.json`

const normalizeValue = (value) =>
  String(value ?? "")
    .replace(/["']/g, "")
    .replace(/\s+/g, " ")
    .trim()

const getProvince = async (setLoading) => {
  if (!cache) {
    setLoading(true)
    try {
      const response = await fetch(SCUOLE_URL)
      if (!response.ok) {
        throw new Error("Impossibile caricare l'elenco scuole")
      }
      const data = await response.json()
      cache = data
    } finally {
      setLoading(false)
    }
  }
  return cache
}

export function Scuole({
  onProvinciaChange,
  onScuolaChange,
  disabled,
  initialProvincia = "",
  initialScuola = "",
  className = ""
}) {
  const [province, setProvince] = useState([])
  const [scuole, setScuole] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState("")
  const [provinciaSelezionata, setProvinciaSelezionata] = useState(initialProvincia)
  const [scuolaSelezionata, setScuolaSelezionata] = useState(initialScuola)

  useEffect(() => {
    const load = async () => {
      try {
        setLoadError("")
        const data = await getProvince(setLoading)
        setProvince(Object.keys(data).sort())
      } catch {
        setProvince([])
        setLoadError("Impossibile caricare province e scuole")
      }
    }
    load()
  }, [])

  useEffect(() => {
    setProvinciaSelezionata(initialProvincia)
    setScuolaSelezionata(initialScuola)
  }, [initialProvincia, initialScuola])

  useEffect(() => {
    const loadSchools = async () => {
      if (!provinciaSelezionata) {
        setScuole([])
        return
      }

      const data = await getProvince(setLoading)
      const provinceKey =
        Object.keys(data).find(
          (key) => normalizeValue(key) === normalizeValue(provinciaSelezionata),
        ) ?? provinciaSelezionata
      const scuoleList = data[provinceKey] || []

      setScuole(scuoleList)

      setScuolaSelezionata((current) =>
        scuoleList.some(
          (s) => normalizeValue(s.nome) === normalizeValue(current),
        )
          ? current
          : ""
      )
    }

    loadSchools().catch(() => {
      setScuole([])
      setLoadError("Impossibile caricare le scuole")
    })
  }, [provinciaSelezionata])

  const handleProvincia = (e) => {
    const value = e.target.value
    setProvinciaSelezionata(value)
    setScuolaSelezionata("")
    onProvinciaChange?.(value)
    onScuolaChange?.("")
  }

  const handleScuola = (e) => {
    setScuolaSelezionata(e.target.value)
    onScuolaChange?.(e.target.value)
  }

  return (
    <div className="flex select-scuole">
      <select
        value={provinciaSelezionata}
        onChange={handleProvincia}
        disabled={disabled || loading}
        className={className}
      >
        <option value="">
          {loading
            ? "Caricamento..."
            : loadError
              ? "Errore caricamento"
              : "Seleziona provincia"}
        </option>
        {province.map((p, i) => (
          <option key={i} value={p}>
            {p}
          </option>
        ))}
      </select>

      <select
        value={scuolaSelezionata}
        onChange={handleScuola}
        disabled={disabled || !provinciaSelezionata || loading}
        className={className}
      >
        <option value="">
          {loading
            ? "Caricamento..."
            : loadError
              ? "Errore caricamento"
              : !provinciaSelezionata
                ? "Seleziona prima la provincia"
                : scuole.length === 0
                  ? "Nessuna scuola trovata"
                  : "Seleziona scuola"}
        </option>
        {scuole.map((s, i) => (
          <option 
            key={i} 
            value={
              s.nome.replace(/["']/g, "")
              .replace(/\s+/g, " ")
              .trim()
            }
          >
            {
              s.nome.replace(/["']/g, "")
              .replace(/\s+/g, " ")
              .trim()
            }
          </option>
        ))}
      </select>
    </div>
  )
}
