import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'

export default function HomeScreen({ navigate }) {
  const { profile } = useAuth()
  const [activeMembers, setActiveMembers] = useState([])
  const [featuredEvent, setFeaturedEvent] = useState(null)
  const [stats, setStats] = useState({ uppdrag: 0, event: 0, members: 0 })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    // Active members (latest profiles)
    const { data: members } = await supabase
      .from('profiles')
      .select('id, full_name, company_name, membership_tier, avatar_url')
      .not('full_name', 'is', null)
      .limit(8)
    if (members) setActiveMembers(members)

    // Next upcoming event
    const { data: events } = await supabase
      .from('events')
      .select('*')
      .gte('start_date', new Date().toISOString())
      .order('start_date', { ascending: true })
      .limit(1)
    if (events && events.length > 0) setFeaturedEvent(events[0])

    // Stats
    const [{ count: uppdragCount }, { count: eventCount }, { count: memberCount }] = await Promise.all([
      supabase.from('assignments').select('*', { count: 'exact', head: true }).eq('status', 'open'),
      supabase.from('events').select('*', { count: 'exact', head: true }).gte('start_date', new Date().toISOString()),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
    ])
    setStats({ uppdrag: uppdragCount || 0, event: eventCount || 0, members: memberCount || 0 })
  }

  const tier = profile?.membership_tier || 'Basic'
  const firstName = profile?.full_name?.split(' ')[0] || 'Välkommen'

  const GRADIENTS = [
    '135deg, #7B4BA0, #C8AEDE',
    '135deg, #A0607B, #D4849E',
    '135deg, #4A7B9D, #82B4CC',
    '135deg, #7B8A4A, #B0C07B',
    '135deg, #8A4A6B, #C082A0',
    '135deg, #4A5C8A, #7B8EC0',
    '135deg, #6B4A3A, #B08070',
    '135deg, #4A7B5C, #82B4A0',
  ]

  const formatEventDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('sv-SE', { weekday: 'long', day: 'numeric', month: 'long' })
  }

  return (
    <div>
      {/* Header */}
      <div className="fade-up" style={{ padding: '12px 28px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div className="display" style={{ fontSize: 20, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--white)' }}>
          Masterminds
        </div>
        <div
          className="avatar"
          onClick={() => navigate('profil')}
          style={{ width: 36, height: 36, background: 'linear-gradient(135deg, var(--purple-mid), var(--purple-light))', fontSize: 14, cursor: 'pointer' }}
        >
          {firstName[0]}
        </div>
      </div>

      {/* Greeting */}
      <div className="fade-up-1" style={{ padding: '0 28px', marginBottom: 32 }}>
        <div style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 6 }}>
          Välkommen tillbaka
        </div>
        <div className="display-italic" style={{ fontSize: 40, lineHeight: 1.1, color: 'var(--white)' }}>
          God morgon,
          <span className="display" style={{ display: 'block', fontStyle: 'normal', fontWeight: 600 }}>
            {firstName}
          </span>
        </div>
        <div className="tier-badge" style={{ marginTop: 14 }}>{tier} Medlem</div>
      </div>

      {/* Featured event */}
      <div className="fade-up-2" style={{ padding: '0 28px', marginBottom: 32 }}>
        <div className="section-label">Nästa event</div>
        <div
          onClick={() => navigate('events')}
          style={{
            height: 200,
            borderRadius: 20,
            background: 'linear-gradient(160deg, var(--purple-deep) 0%, var(--purple-mid) 55%, #8B5FC0 100%)',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer',
          }}
        >
          <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(212,168,67,0.06)' }} />
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '24px 20px 20px',
            background: 'linear-gradient(to top, rgba(13,10,16,0.92), transparent)',
          }}>
            {featuredEvent ? (
              <>
                <div style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 7 }}>
                  {formatEventDate(featuredEvent.start_date)}
                </div>
                <div className="display-italic" style={{ fontSize: 24, color: 'var(--white)', lineHeight: 1.2 }}>
                  {featuredEvent.title}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 7, fontWeight: 300 }}>
                  {featuredEvent.location || 'Online'} · Tryck för att boka
                </div>
              </>
            ) : (
              <div className="display-italic" style={{ fontSize: 22, color: 'var(--white)' }}>
                Inga kommande event just nu
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="fade-up-3" style={{ padding: '0 28px', marginBottom: 24 }}>
        <div className="section-label">Genvägar</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { icon: '◇', title: 'Event', sub: `${stats.event} kommande`, screen: 'events' },
            { icon: '✉', title: 'Meddelanden', sub: 'Dina konversationer', screen: 'messages' },
          ].map((q) => (
            <div key={q.title} className="card" onClick={() => navigate(q.screen)} style={{ padding: '18px 16px' }}>
              <div style={{ fontSize: 22, marginBottom: 10, color: 'var(--gold)' }}>{q.icon}</div>
              <div className="display" style={{ fontSize: 17, color: 'var(--white)', marginBottom: 3 }}>{q.title}</div>
              <div style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 300 }}>{q.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tools row */}
      <div className="fade-up-3" style={{ padding: '0 28px', marginBottom: 32 }}>
        <div className="section-label">Dina verktyg</div>
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4 }}>
          {[
            { icon: '◭', title: 'CRM', screen: 'crm' },
            { icon: '◉', title: 'Visitkort', screen: 'visitkort' },
            { icon: '◆', title: 'Impact', screen: 'impact' },
            { icon: '✦', title: 'Investerare', screen: 'investerare' },
          ].map((t) => (
            <div key={t.title} className="card" onClick={() => navigate(t.screen)} style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 84, flexShrink: 0 }}>
              <div style={{ fontSize: 20, color: 'var(--gold)' }}>{t.icon}</div>
              <div style={{ fontSize: 11, color: 'var(--white)', fontWeight: 300, whiteSpace: 'nowrap' }}>{t.title}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Active members */}
      {activeMembers.length > 0 && (
        <div className="fade-up-4" style={{ padding: '0 28px', marginBottom: 16 }}>
          <div className="section-label">Medlemmar</div>
          <div style={{ display: 'flex', gap: 20, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4 }}>
            {activeMembers.map((m, i) => (
              <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, flexShrink: 0 }}>
                <div style={{ position: 'relative' }}>
                  <div className="avatar" style={{ width: 52, height: 52, background: `linear-gradient(${GRADIENTS[i % GRADIENTS.length]})`, fontSize: 18 }}>
                    {m.full_name?.[0] || '?'}
                  </div>
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 300, whiteSpace: 'nowrap', maxWidth: 56, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {m.full_name?.split(' ')[0]}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
