import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'

export default function ImpactScreen() {
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    uppdragVunna: 0,
    omsattning: 0,
    kontakter: 0,
    eventDeltagit: 0,
    profilvisningar: 0,
    medlemSedan: null,
  })
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => { fetchImpact() }, [user])

  async function fetchImpact() {
    setLoading(true)

    // Assignments wonned (interests that were accepted / assignments completed)
    const { data: interests } = await supabase
      .from('assignment_interests')
      .select('id, assignment_id, status, created_at, assignments(title, budget, status)')
      .eq('user_id', user.id)

    const wonAssignments = (interests || []).filter(i => i.assignments?.status === 'completed' || i.status === 'accepted')
    const omsattning = wonAssignments.reduce((sum, i) => sum + (i.assignments?.budget || 0), 0)

    // Contacts in CRM
    const { count: contactCount } = await supabase
      .from('card_contacts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    // Event bookings
    const { count: eventCount } = await supabase
      .from('event_bookings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    // Profile views (digital card)
    const { data: card } = await supabase
      .from('digital_cards')
      .select('id')
      .eq('user_id', user.id)
      .single()

    let viewCount = 0
    if (card) {
      const { count } = await supabase
        .from('business_profile_views')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', card.id)
      viewCount = count || 0
    }

    setStats({
      uppdragVunna: wonAssignments.length,
      omsattning,
      kontakter: contactCount || 0,
      eventDeltagit: eventCount || 0,
      profilvisningar: viewCount,
      medlemSedan: profile?.created_at,
    })

    // Recent activity feed (last 5 interests)
    const activity = (interests || [])
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5)
      .map(i => ({
        title: i.assignments?.title || 'Uppdrag',
        amount: i.assignments?.budget,
        status: i.status,
        date: i.created_at,
      }))
    setRecentActivity(activity)

    setLoading(false)
  }

  const formatSEK = (amount) => {
    if (!amount) return '0 kr'
    return new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 0 }).format(amount) + ' kr'
  }

  const memberSince = stats.medlemSedan
    ? new Date(stats.medlemSedan).toLocaleDateString('sv-SE', { month: 'long', year: 'numeric' })
    : '—'

  const STATUS_LABELS = {
    pending: 'Väntar svar',
    accepted: 'Accepterad',
    rejected: 'Avböjd',
  }
  const STATUS_COLORS = {
    pending: { bg: 'rgba(100,150,232,0.15)', text: '#6496E8' },
    accepted: { bg: 'rgba(100,210,130,0.15)', text: '#64D282' },
    rejected: { bg: 'rgba(232,100,100,0.15)', text: '#E86464' },
  }

  return (
    <div style={{ background: 'var(--ink)', minHeight: '100%' }}>

      {/* Header */}
      <div className="fade-up" style={{ padding: '12px 28px 24px' }}>
        <div className="display-italic" style={{ fontSize: 38, lineHeight: 1.1, color: 'var(--white)' }}>
          Ditt
          <span className="display" style={{ display: 'block', fontStyle: 'normal', fontWeight: 500 }}>Impact</span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 300, marginTop: 6 }}>
          Värdet du skapat via Masterminds
        </div>
      </div>

      {loading && <div className="loading">Laddar din impact…</div>}

      {!loading && (
        <>
          {/* Hero metric — total revenue */}
          <div className="fade-up-1" style={{ margin: '0 28px 20px' }}>
            <div style={{
              background: 'linear-gradient(160deg, var(--purple-deep) 0%, var(--purple-mid) 60%, #8B5FC0 100%)',
              borderRadius: 20,
              padding: '28px 24px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(212,168,67,0.07)' }} />
              <div style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 10, position: 'relative', zIndex: 1 }}>
                Genererad omsättning
              </div>
              <div className="display" style={{ fontSize: 42, color: 'var(--white)', lineHeight: 1, position: 'relative', zIndex: 1 }}>
                {formatSEK(stats.omsattning)}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 8, fontWeight: 300, position: 'relative', zIndex: 1 }}>
                via {stats.uppdragVunna} {stats.uppdragVunna === 1 ? 'uppdrag' : 'uppdrag'} på Uppdragstavlan
              </div>
            </div>
          </div>

          {/* Stat grid */}
          <div className="fade-up-2" style={{ padding: '0 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div className="card" style={{ padding: '16px 18px', cursor: 'default' }}>
              <div style={{ fontSize: 22, color: 'var(--gold)', marginBottom: 8 }}>◈</div>
              <div className="display" style={{ fontSize: 26, color: 'var(--white)' }}>{stats.uppdragVunna}</div>
              <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Uppdrag vunna</div>
            </div>
            <div className="card" style={{ padding: '16px 18px', cursor: 'default' }}>
              <div style={{ fontSize: 22, color: 'var(--gold)', marginBottom: 8 }}>◭</div>
              <div className="display" style={{ fontSize: 26, color: 'var(--white)' }}>{stats.kontakter}</div>
              <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Kontakter i CRM</div>
            </div>
            <div className="card" style={{ padding: '16px 18px', cursor: 'default' }}>
              <div style={{ fontSize: 22, color: 'var(--gold)', marginBottom: 8 }}>◇</div>
              <div className="display" style={{ fontSize: 26, color: 'var(--white)' }}>{stats.eventDeltagit}</div>
              <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Event besökta</div>
            </div>
            <div className="card" style={{ padding: '16px 18px', cursor: 'default' }}>
              <div style={{ fontSize: 22, color: 'var(--gold)', marginBottom: 8 }}>◉</div>
              <div className="display" style={{ fontSize: 26, color: 'var(--white)' }}>{stats.profilvisningar}</div>
              <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Profilvisningar</div>
            </div>
          </div>

          {/* Membership longevity */}
          <div className="fade-up-3" style={{ margin: '0 28px 20px' }}>
            <div className="card" style={{ padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'default' }}>
              <div>
                <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 4 }}>Medlem sedan</div>
                <div className="display" style={{ fontSize: 16, color: 'var(--white)' }}>{memberSince}</div>
              </div>
              <div className="tier-badge">{profile?.membership_tier || 'Basic'}</div>
            </div>
          </div>

          {/* Recent activity */}
          <div className="fade-up-4" style={{ padding: '0 28px', marginBottom: 16 }}>
            <div className="section-label">Senaste aktivitet</div>
            {recentActivity.length === 0 ? (
              <div className="empty" style={{ padding: '40px 0' }}>
                <div style={{ fontSize: 28, marginBottom: 12, opacity: 0.2 }}>◈</div>
                Ingen aktivitet ännu.<br />
                <span style={{ fontSize: 11, marginTop: 6, display: 'block' }}>
                  Ansök om ditt första uppdrag på Uppdragstavlan.
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {recentActivity.map((a, i) => {
                  const s = STATUS_COLORS[a.status] || STATUS_COLORS.pending
                  return (
                    <div key={i} className="card" style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'default' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="display" style={{ fontSize: 14, color: 'var(--white)', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {a.title}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 300 }}>
                          {new Date(a.date).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })}
                          {a.amount ? ` · ${formatSEK(a.amount)}` : ''}
                        </div>
                      </div>
                      <div style={{ padding: '4px 10px', borderRadius: 12, background: s.bg, color: s.text, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', flexShrink: 0, marginLeft: 10 }}>
                        {STATUS_LABELS[a.status] || a.status}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
