const GRADE_STEP = 0.25
const GRADE_MIN = 2
const GRADE_MAX = 10

const ROUND_PRECISION = 2

const roundToStep = (value) => Number((Math.round(value / GRADE_STEP) * GRADE_STEP).toFixed(ROUND_PRECISION))
const clampToRange = (value) => {
  if (!Number.isFinite(value)) return GRADE_MIN
  return Math.min(GRADE_MAX, Math.max(GRADE_MIN, roundToStep(value)))
}

export const GRADE_STEP_VALUE = GRADE_STEP
export const GRADE_MIN_VALUE = GRADE_MIN
export const GRADE_MAX_VALUE = GRADE_MAX

export const gradeValuesDescending = Array.from(
  { length: Math.round((GRADE_MAX - GRADE_MIN) / GRADE_STEP) + 1 },
  (_, index) => Number((GRADE_MAX - index * GRADE_STEP).toFixed(ROUND_PRECISION)),
)

export const clampGradeToRange = clampToRange

export const formatGradeLabel = (value) => {
  if (!Number.isFinite(value)) return ""
  const rounded = Number(value.toFixed(ROUND_PRECISION))
  const integer = Math.floor(rounded)
  const decimal = Math.round((rounded - integer) * 100) / 100

  if (decimal === 0) return `${integer}`
  if (decimal === 0.25) return `${integer}+`
  if (decimal === 0.5) return `${integer}\u00BD`
  if (decimal === 0.75) return `${integer + 1}-`

  return rounded.toFixed(ROUND_PRECISION)
}
