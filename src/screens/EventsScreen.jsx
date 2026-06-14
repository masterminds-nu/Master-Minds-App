import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'

const MONTH_COLORS = ['#4A1F6E','#7B4BA0','#C4975A','#4A7B5C','#4A5C8A','#A0607B']

export default function EventsScreen() {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [bookingId, setBookingId] = useState(null)

  useEffect(() => { fetchEvents() }, [])

  async function fetchEvents() {
    const { data } = await supabase
      .from('events')
      .select('*')
      .gte('start_date', new Date().toISOString())
      .order('start_date', { ascending: true })
      .limit(20)
    if (data) setEvents(data)
    setLoading(false)
  }

  async function bookEvent(eventId) {
    setBookingId(eventId)
    try {
      await supabase.from('event_bookings').insert({ event_id: eventId, user_id: user.id })
      alert('Du är nu anmäld!')
    } catch (e) {
      alert('Något gick fel. Försök igen.')
    }
    setBookingId(null)
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return { day: d.getDate(), month: d.toLocaleDateString('sv-SE', { month: 'short' }).replace('.','') }
  }

  const formatTime = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div>
      <div className="fade-up" style={{ padding: '12px 28px 24px' }}>
        <div className="display-italic" style={{ fontSize: 38, lineHeight: 1.1, color: 'var(--white)' }}>
          Event &<br />
          <span className="display" style={{ fontStyle: 'normal', fontWeight: 500 }}>Sessioner</span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 300, marginTop: 6 }}>
          Exklusivt för medlemmar
        </div>
      </div>

      {loading && <div className="loading">Laddar event…</div>}

      {!loading && events.length === 0 && (
        <div className="empty">Inga kommande event just nu</div>
      )}

      <div className="fade-up-1" style={{ padding: '0 28px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {events.map((e, i) => {
          const { day, month } = formatDate(e.start_date)
          return (
            <div key={e.id} className="card" style={{ display: 'flex', gap: 16, alignItems: 'flex-start', padding: 16, borderRadius: 16, flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', width: '100%' }}>
                {/* Date block */}
                <div style={{ flexShrink: 0, width: 46, textAlign: 'center', background: MONTH_COLORS[i % MONTH_COLORS.length], borderRadius: 12, padding: '9px 6px' }}>
                  <div className="display" style={{ fontSize: 24, color: 'var(--white)', lineHeight: 1 }}>{day}</div>
                  <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginTop: 2, fontWeight: 300 }}>{month}</div>
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  {e.event_type && (
                    <div style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 6 }}>
                      {e.event_type}
                      {e.membership_tier_required && ` · ${e.membership_tier_required}`}
                    </div>
                  )}
                  <div className="display" style={{ fontSize: 19, color: 'var(--white)', lineHeight: 1.25, marginBottom: 5 }}>
                    {e.title}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 300 }}>
                    Kl {formatTime(e.start_date)} · {e.location || 'Online'}
                  </div>
                  {e.max_attendees && (
                    <div style={{ fontSize: 10, color: 'var(--gold)', marginTop: 6, opacity: 0.8 }}>
                      ◆ Max {e.max_attendees} platser
                    </div>
                  )}
                </div>
              </div>

              <button
                className="btn-gold"
                style={{ marginTop: 0 }}
                onClick={() => bookEvent(e.id)}
                disabled={bookingId === e.id}
              >
                {bookingId === e.id ? 'Bokar…' : 'Boka plats'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
