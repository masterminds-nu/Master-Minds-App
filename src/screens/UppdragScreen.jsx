import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'

export default function UppdragScreen() {
  const { user, profile } = useAuth()
  const [uppdrag, setUppdrag] = useState([])
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(null)
  const [stats, setStats] = useState({ active: 0, new: 0, total: 0 })

  useEffect(() => { fetchUppdrag() }, [])

  async function fetchUppdrag() {
    const { data } = await supabase
      .from('assignments')
      .select(`
        *,
        profiles:created_by (full_name, membership_tier)
      `)
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(20)

    if (data) {
      setUppdrag(data)
      const today = new Date().toISOString().split('T')[0]
      const newToday = data.filter(u => u.created_at?.startsWith(today)).length
      const total = data.reduce((sum, u) => sum + (u.budget || 0), 0)
      setStats({ active: data.length, new: newToday, total })
    }
    setLoading(false)
  }

  async function applyToUppdrag(uppdragId) {
    setApplying(uppdragId)
    try {
      await supabase.from('assignment_interests').insert({
        assignment_id: uppdragId,
        user_id: user.id,
        message: 'Jag är intresserad av detta uppdrag.'
      })
      alert('Din ansökan är skickad!')
    } catch (e) {
      alert('Något gick fel. Försök igen.')
    }
    setApplying(null)
  }

  const formatAmount = (amount) => {
    if (!amount) return 'Pris ej angivet'
    return new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK', maximumFractionDigits: 0 }).format(amount)
  }

  const formatTotal = (amount) => {
    if (amount >= 1000000) return `${(amount/1000000).toFixed(1)}M`
    if (amount >= 1000) return `${Math.round(amount/1000)}k`
    return amount
  }

  const GRADIENTS = ['135deg, #7B4BA0, #C8AEDE','135deg, #4A7B9D, #82B4CC','135deg, #7B8A4A, #B0C07B','135deg, #8A4A6B, #C082A0']

  return (
    <div style={{ background: 'var(--ink)', minHeight: '100%' }}>

      <div className="fade-up" style={{ padding: '12px 28px 24px' }}>
        <div className="display-italic" style={{ fontSize: 38, lineHeight: 1.1, color: 'var(--white)' }}>
          Uppdrag
          <span className="display" style={{ display: 'block', fontStyle: 'normal', fontWeight: 500 }}>tavlan</span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 300, marginTop: 6, opacity: 0.8 }}>
          Din säljkanal utan säljbudget
        </div>
      </div>

      {/* Stats */}
      <div className="fade-up-1 stat-row" style={{ margin: '0 28px 24px' }}>
        <div className="stat-item">
          <div className="stat-value">{stats.active}</div>
          <div className="stat-label">Aktiva</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{stats.new}</div>
          <div className="stat-label">Nya idag</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{formatTotal(stats.total)}</div>
          <div className="stat-label">Total värde</div>
        </div>
      </div>

      {loading && <div className="loading">Laddar uppdrag…</div>}
      {!loading && uppdrag.length === 0 && <div className="empty">Inga aktiva uppdrag just nu</div>}

      {/* Cards */}
      <div className="fade-up-2" style={{ padding: '0 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {uppdrag.map((u, i) => (
          <div key={u.id} className="card" style={{ padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', opacity: 0.75 }}>
                {u.category || u.assignment_type || 'Uppdrag'}
              </div>
              {u.budget && (
                <div className="display" style={{ fontSize: 18, color: 'var(--gold)' }}>
                  {formatAmount(u.budget)}
                </div>
              )}
            </div>

            <div className="display" style={{ fontSize: 19, color: 'var(--white)', lineHeight: 1.3, marginBottom: 10 }}>
              {u.title}
            </div>

            {u.description && (
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 300, lineHeight: 1.6, marginBottom: 10 }}>
                {u.description.length > 120 ? u.description.slice(0, 120) + '…' : u.description}
              </div>
            )}

            <div style={{ display: 'flex', gap: 14, fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 300, flexWrap: 'wrap' }}>
              {u.duration && <span>{u.duration}</span>}
              {u.location && <span>{u.location}</span>}
              {u.remote && <span>Remote</span>}
            </div>

            {/* Poster */}
            {u.profiles && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                <div className="avatar" style={{ width: 26, height: 26, background: `linear-gradient(${GRADIENTS[i % GRADIENTS.length]})`, fontSize: 10 }}>
                  {u.profiles.full_name?.[0] || '?'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 300 }}>
                  {u.profiles.full_name}
                  {u.profiles.membership_tier && (
                    <span style={{ color: 'var(--gold)', marginLeft: 6, fontSize: 9, opacity: 0.7 }}>
                      ◆ {u.profiles.membership_tier}
                    </span>
                  )}
                </div>
              </div>
            )}

            <button
              className="btn-gold"
              onClick={() => applyToUppdrag(u.id)}
              disabled={applying === u.id}
            >
              {applying === u.id ? 'Skickar…' : 'Ansök om uppdraget'}
            </button>
          </div>
        ))}
      </div>

      {/* Post assignment */}
      <div className="fade-up-3" style={{ padding: '20px 28px 8px' }}>
        <button className="btn-outline">+ Posta ett uppdrag</button>
      </div>
    </div>
  )
}
