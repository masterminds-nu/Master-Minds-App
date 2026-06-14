import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'

export default function ProfilScreen({ navigate }) {
  const { user, profile, signOut } = useAuth()
  const [stats, setStats] = useState({ uppdrag: 0, event: 0, kontakter: 0 })

  useEffect(() => { if (user) fetchStats() }, [user])

  async function fetchStats() {
    const [{ count: uppdragCount }, { count: eventCount }, { count: kontaktCount }] = await Promise.all([
      supabase.from('assignment_interests').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('event_bookings').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
    ])
    setStats({ uppdrag: uppdragCount || 0, event: eventCount || 0, kontakter: kontaktCount || 0 })
  }

  const firstName = profile?.full_name?.split(' ')[0] || 'Profil'
  const tier = profile?.membership_tier || 'Basic'

  const SKILLS = profile?.skills || []

  const MENU = [
    { icon: '◈', label: 'Mina uppdrag', action: () => navigate('uppdrag') },
    { icon: '◇', label: 'Mina event', action: () => navigate('events') },
    { icon: '✉', label: 'Meddelanden', action: () => navigate('messages') },
    { icon: '◭', label: 'CRM', action: () => navigate('crm') },
    { icon: '◉', label: 'Digitalt visitkort', action: () => navigate('visitkort') },
    { icon: '◆', label: 'Min Impact', action: () => navigate('impact') },
    { icon: '✦', label: 'Investerarmatchning', action: () => navigate('investerare') },
    { icon: '✕', label: 'Logga ut', action: signOut, danger: true },
  ]

  return (
    <div style={{ background: 'var(--ink)', minHeight: '100%' }}>

      {/* Hero */}
      <div style={{
        height: 280,
        background: 'linear-gradient(160deg, var(--purple-deep) 0%, var(--purple-mid) 50%, #7B3FA0 100%)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '28px 28px 24px',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(212,168,67,0.05)' }} />

        <div className="fade-up">
          <div className="avatar" style={{ width: 68, height: 68, background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(212,168,67,0.4)', fontSize: 26, marginBottom: 14 }}>
            {profile?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'P'}
          </div>
          <div className="display-italic" style={{ fontSize: 30, color: 'var(--white)' }}>
            {profile?.full_name || user?.email}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 300, marginTop: 5 }}>
            {profile?.company_name || profile?.industry || 'Masterminds-medlem'}
          </div>
          <div className="tier-badge" style={{ marginTop: 12 }}>{tier} Medlem</div>
        </div>
      </div>

      <div style={{ padding: '24px 28px' }}>

        {/* Stats */}
        <div className="fade-up-1 stat-row" style={{ marginBottom: 28 }}>
          <div className="stat-item">
            <div className="stat-value">{stats.uppdrag}</div>
            <div className="stat-label">Uppdrag</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.event}</div>
            <div className="stat-label">Event</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.kontakter}</div>
            <div className="stat-label">Nätverket</div>
          </div>
        </div>

        {/* Skills */}
        {SKILLS.length > 0 && (
          <div className="fade-up-2" style={{ marginBottom: 28 }}>
            <div className="section-label">Kompetenser</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {SKILLS.map((s, i) => (
                <div key={i} style={{ padding: '7px 14px', border: '1px solid var(--border-gold)', borderRadius: 20, fontSize: 11, color: 'var(--gold)', fontWeight: 300 }}>
                  {s}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bio */}
        {profile?.bio && (
          <div className="fade-up-2" style={{ marginBottom: 28 }}>
            <div className="section-label">Om mig</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 300, lineHeight: 1.7 }}>
              {profile.bio}
            </div>
          </div>
        )}

        {/* Menu */}
        <div className="fade-up-3" style={{ marginBottom: 24 }}>
          <div className="section-label">Konto</div>
          {MENU.map((item) => (
            <div
              key={item.label}
              onClick={item.action}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 4px', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
            >
              <span style={{ color: item.danger ? '#ff6b6b' : 'var(--gold)', fontSize: 16, width: 20, textAlign: 'center' }}>{item.icon}</span>
              <span style={{ fontSize: 14, color: item.danger ? '#ff6b6b' : 'var(--text-primary)', fontWeight: 300 }}>{item.label}</span>
              {!item.danger && <span style={{ marginLeft: 'auto', color: 'var(--text-tertiary)', fontSize: 12 }}>›</span>}
            </div>
          ))}
        </div>

        {/* Membership card */}
        <div className="fade-up-4" style={{ background: 'var(--plum)', border: '1px solid var(--border-gold)', borderRadius: 20, padding: '20px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 6 }}>Medlemskap</div>
            <div className="display" style={{ fontSize: 22, color: 'var(--gold)' }}>{tier} Medlem</div>
            <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 4, fontWeight: 300 }}>
              {user?.email}
            </div>
          </div>
          <div className="display-italic" style={{ fontSize: 32, color: 'rgba(212,168,67,0.10)' }}>MM</div>
        </div>

      </div>
    </div>
  )
}
