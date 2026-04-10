import { useMemo, useState } from "react"
import { Modal, Button, Select } from "../components/ui"
import {
  GRADE_MAX_VALUE,
  GRADE_MIN_VALUE,
  GRADE_STEP_VALUE,
  gradeValuesDescending,
  formatGradeLabel,
} from "../constants/gradeOptions"
import "./media-goal-modal.css"

const FUTURE_VOTE_WEIGHT = 100
const TARGET_MEDIA = 6
const TARGET_OPTIONS = gradeValuesDescending.filter((value) => value >= TARGET_MEDIA)

const formatAverage = (value) => {
  if (!Number.isFinite(value)) return "N/D"
  const rounded = Math.round(value * 10) / 10
  return Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(1)
}

const formatAverageExact = (value) => {
  if (!Number.isFinite(value)) return "N/D"
  // Mostra fino a 2 decimali senza arrotondamenti forzati
  const fixed = parseFloat(value.toFixed(2))
  return fixed.toString()
}

const roundToStep = (value, step = GRADE_STEP_VALUE) => Math.round(value / step) * step

const clampGrade = (value, step = GRADE_STEP_VALUE) => {
  if (!Number.isFinite(value)) return GRADE_MIN_VALUE
  return Math.min(GRADE_MAX_VALUE, Math.max(GRADE_MIN_VALUE, roundToStep(value, step)))
}

const adjustGradesToTarget = (grades, neededGrade, step = GRADE_STEP_VALUE) => {
  if (grades.length === 0) return []

  const cleaned = grades.map((grade) => clampGrade(grade, step))
  const targetTotal = neededGrade * cleaned.length

  if (!Number.isFinite(targetTotal)) return cleaned

  if (targetTotal >= cleaned.length * GRADE_MAX_VALUE) {
    return cleaned.map(() => GRADE_MAX_VALUE)
  }

  let total = cleaned.reduce((acc, grade) => acc + grade, 0)
  if (total >= targetTotal) return cleaned

  const updated = [...cleaned]

  while (total < targetTotal) {
    let increased = false

    for (let idx = updated.length - 1; idx >= 0 && total < targetTotal; idx--) {
      const available = GRADE_MAX_VALUE - updated[idx]
      if (available <= 0) continue

      const required = targetTotal - total
      const addition = Math.min(available, Math.ceil(required / step) * step)

      if (addition <= 0) continue

      updated[idx] = clampGrade(updated[idx] + addition, step)
      total = updated.reduce((acc, grade) => acc + grade, 0)
      increased = true
    }

    if (!increased) break
  }

  return updated
}

const buildGradeCombo = (count, neededGrade, targetReached, step) => {
  if (count <= 0) return []
  if (targetReached) {
    return Array(count).fill(clampGrade(2, step))
  }

  // Usa direttamente il voto necessario per tutti — niente lower/higher forzati
  const base = clampGrade(neededGrade, step)
  return adjustGradesToTarget(Array(count).fill(base), neededGrade, step)
}

const buildSuggestions = (sum, weight, target, targetReached, step) => {
  const safeNumber = (value) => (Number.isFinite(value) ? value : 0)

  return [1, 2, 3].map((count) => {
    const additionalWeight = count * FUTURE_VOTE_WEIGHT
    const totalWeight = safeNumber(weight) + additionalWeight
    const requiredTotal = target * totalWeight
    const neededSum = requiredTotal - safeNumber(sum)
    const neededGrade = neededSum / additionalWeight
    const grades = buildGradeCombo(count, neededGrade, targetReached, step)
    const average = grades.length > 0 ? grades.reduce((acc, grade) => acc + grade, 0) / grades.length : target
    const needsHigherThanMax = neededGrade > GRADE_MAX_VALUE

    let status = "ok"

    if (targetReached) {
      status = "already"
    } else if (needsHigherThanMax) {
      status = "warn"
    }

    return {
      count,
      grades,
      status,
      label: `${count} ${count === 1 ? "voto" : "voti"}`,
    }
  })
}

export function MediaGoalModal({ voti = [], periodo, onClose }) {
  const [target, setTarget] = useState(TARGET_MEDIA)
  const [includePlusMinus, setIncludePlusMinus] = useState(false)

  const filteredVoti = useMemo(() =>
      voti.filter((voto) => {
        if (periodo === undefined || periodo === null) return true
        return Number(voto.periodo) === Number(periodo)
      }),
    [voti, periodo],
  )

  const relevantVoti = useMemo(
    () => filteredVoti.filter((voto) => parseFloat(voto.peso || 0) > 0),
    [filteredVoti],
  )

  const { sum, weight } = useMemo(() => {
    return relevantVoti.reduce(
      (acc, voto) => {
        const votoNum = parseFloat(voto.voto)
        const peso = parseFloat(voto.peso || 0)
        if (!Number.isNaN(votoNum) && peso > 0) {
          acc.sum += votoNum * peso
          acc.weight += peso
        }
        return acc
      },
      { sum: 0, weight: 0 },
    )
  }, [relevantVoti])

  const currentAverage = weight > 0 ? sum / weight : null
  const targetReached = currentAverage !== null && currentAverage >= target
  const stepForCombos = includePlusMinus ? GRADE_STEP_VALUE : 0.5
  const unreachable =
    weight > 0
      ? (target * (weight + 3 * FUTURE_VOTE_WEIGHT) - sum) / (3 * FUTURE_VOTE_WEIGHT) > GRADE_MAX_VALUE
      : false
  const suggestions = useMemo(() => buildSuggestions(sum, weight, target, targetReached, stepForCombos),
    [sum, weight, target, targetReached, stepForCombos],
  )

  return (
    <Modal title="Simulatore media obiettivo" onClose={onClose} className="media-goal-modal">
      <div className="media-goal">
        <p className="media-goal__intro">
          {currentAverage
            ? targetReached
              ? `Hai già una media di ${formatAverageExact(currentAverage)} — continua così!`
              : `Media attuale ${formatAverageExact(currentAverage)}; scegli un obiettivo e scopri quali voti servono.`
            : `Ancora nessun voto con peso positivo. Aggiungi una verifica per iniziare il calcolo.`}
        </p>

        <div className="media-goal__stats">
          <div className="media-goal__stat">
            <span className="media-goal__stat-label">Voti considerati</span>
            <strong>{relevantVoti.length}</strong>
          </div>
          <div className="media-goal__stat">
            <span className="media-goal__stat-label">Media attuale</span>
            <strong>{currentAverage ? formatAverageExact(currentAverage) : "N/D"}</strong>
          </div>
          <div className="media-goal__stat media-goal__stat--target">
            <span className="media-goal__stat-label">Obiettivo</span>
            <Select id="media-target" value={target} onChange={(event) => setTarget(Number(event.target.value))} label="Obiettivo">
              {TARGET_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {formatGradeLabel(value)}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="media-goal__include">
          <label className="media-goal__include-toggle" htmlFor="media-include-plusminus">
            <input
              id="media-include-plusminus"
              type="checkbox"
              checked={includePlusMinus}
              onChange={(event) => setIncludePlusMinus(event.target.checked)}
            />
            <span>Includi voti con +/-</span>
          </label>
          <p className="media-goal__include-helper">Se non selezionato si useranno soltanto voti interi o con ½.</p>
        </div>

        {targetReached ? (
          <p className="media-goal__info">Hai già raggiunto o superato l'obiettivo; non servono nuovi voti.</p>
        ) : unreachable ? (
          <p className="media-goal__info">L'obiettivo non è raggiungibile con tre voti da 10. Prova ad abbassarlo.</p>
        ) : (
          <div className="media-goal__options">
            {suggestions.map((option) => (
              <article key={option.count} className="media-goal__option">
                <div className="media-goal__option-head">
                  <strong>{option.label}</strong>
                  {option.status === "warn" && (
                    <span className="media-goal__badge media-goal__badge--warn">Attenzione</span>
                  )}
                </div>
                <div className="media-goal__grades">
                  {option.grades.map((grade, i) => (
                    <span key={i} className="media-goal__grade-pill voto-badge sufficiente">
                      {formatGradeLabel(grade)}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}

        <p className="media-goal__note">
          I calcoli assumono voti con peso {FUTURE_VOTE_WEIGHT}% espressi sulla scala 2.00-10.00.
        </p>

        <div className="media-goal__actions">
          <Button variant="secondary" onClick={onClose}>
            Chiudi
          </Button>
        </div>
      </div>
    </Modal>
  )
}