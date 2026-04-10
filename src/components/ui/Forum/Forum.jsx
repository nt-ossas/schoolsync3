import "./forum.css"
import { Card } from "../"
import { useState, useEffect } from "react"

export function Forum({
  title = "Domanda agli utenti",
  description = "Esprimi la tua opinione.",
  votes = [],
  expired = null,
  apiUrl,
  loadVotes
}) {
  const [voted, setVoted] = useState(null)
  const [localVotes, setLocalVotes] = useState(votes)

  const isExpired = expired ? new Date(expired) < new Date() : false

  useEffect(() => {
    setLocalVotes(votes)
  }, [votes])

  useEffect(() => {
    if (!apiUrl) return
    const loadUserVote = async () => {
      try {
        const res = await fetch(apiUrl + "/get_vote.php", {
          credentials: "include",
        })
        const data = await res.json()
        if (data.success && data.value) {
          setVoted(data.value)
        }
      } catch (err) {
        console.error("Errore caricamento voto:", err)
      }
    }
    loadUserVote()
  }, [apiUrl])

  useEffect(() => {
    if (!apiUrl) return
    loadVotes()
  }, [apiUrl, loadVotes])

  const totalVotes = localVotes.reduce((sum, v) => sum + (v.count || 0), 0)

  const sendVote = async (value, prevVoted, prevVotes) => {
    try {
      const res = await fetch(apiUrl + "/vote.php", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      })
      const data = await res.json()
      if (!data.success) {
        setVoted(prevVoted)
        setLocalVotes(prevVotes)
      }
    } catch (err) {
      console.error("Errore voto:", err)
      setVoted(prevVoted)
      setLocalVotes(prevVotes)
    }
  }

  const handleVote = (value) => {
    if (isExpired || value === voted) return

    const prevVoted = voted
    const prevVotes = localVotes

    if (voted !== null) {
      const updated = localVotes.map((v) => {
        if (v.value === voted) return { ...v, count: Math.max((v.count || 0) - 1, 0) }
        if (v.value === value) return { ...v, count: (v.count || 0) + 1 }
        return v
      })
      setLocalVotes(updated)
      setVoted(value)
      sendVote(value, prevVoted, prevVotes)
      loadVotes()
      return
    }

    const updated = localVotes.map((v) =>
      v.value === value ? { ...v, count: (v.count || 0) + 1 } : v,
    )
    setLocalVotes(updated)
    setVoted(value)
    sendVote(value, prevVoted, prevVotes)
    loadVotes()
  }

  const getPercentage = (count) => {
    if (totalVotes === 0) return 0
    return Math.round((count / totalVotes) * 100)
  }

  const hasVoted = voted !== null
  const showBars = hasVoted || isExpired

  return (
    <Card className={`forum-card ${isExpired ? "forum-card--expired" : ""}`}>
      <div className="forum-header">
        <div className="forum-icon">
          <i
            className={`fa-solid ${isExpired ? "fa-clock" : "fa-square-poll-vertical"}`}
          ></i>
        </div>
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        {expired && (
          <span
            className={`forum-badge ${isExpired ? "forum-badge--expired" : ""}`}
          >
            {isExpired
              ? "Scaduto"
              : `Scade il ${new Date(expired).toLocaleDateString("it-IT")}`}
          </span>
        )}
      </div>

      {localVotes.length > 0 && (
        <div className="forum-options">
          {localVotes.map(({ label, value, count = 0 }) => {
            const pct = getPercentage(count)
            const isSelected = voted === value

            return (
              <button
                key={value}
                className={`forum-option ${isSelected ? "forum-option--selected" : ""} ${showBars ? "forum-option--voted" : ""}`}
                onClick={() => handleVote(value)}
                disabled={isExpired}
              >
                <div
                  className="forum-option__bar"
                  style={{ width: showBars ? `${pct}%` : "0%" }}
                />
                <span className="forum-option__label">{label}</span>
                {isSelected && (
                  <span className="forum-option__check">
                    <i className="fa-solid fa-check"></i>
                  </span>
                )}
                {showBars && <span className="forum-option__pct">{pct}%</span>}
              </button>
            )
          })}
        </div>
      )}

      {(hasVoted || isExpired) && (
        <div className="forum-footer-row">
          <p className="forum-footer">
            {isExpired ? (
              <>
                <i className="fa-solid fa-lock"></i> Sondaggio chiuso
              </>
            ) : (
              <>
                <i className="fa-solid fa-circle-check"></i> Hai votato!
              </>
            )}
          </p>
          {hasVoted && !isExpired && (
            <span className="forum-change-hint">
              <i className="fa-solid fa-arrow-rotate-left"></i> Clicca un'altra
              opzione per cambiare voto
            </span>
          )}
        </div>
      )}
    </Card>
  )
}
