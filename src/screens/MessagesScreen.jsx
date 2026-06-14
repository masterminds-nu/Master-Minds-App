import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'

export default function MessagesScreen() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchConversations() }, [])

  async function fetchConversations() {
    const { data } = await supabase
      .from('conversations')
      .select('*')
      .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
      .order('updated_at', { ascending: false })
      .limit(20)
    if (data) setConversations(data)
    setLoading(false)
  }

  return (
    <div style={{ background: 'var(--ink)', minHeight: '100%' }}>
      <div className="fade-up" style={{ padding: '12px 28px 28px' }}>
        <div className="display-italic" style={{ fontSize: 38, lineHeight: 1.1, color: 'var(--white)' }}>
          Meddelanden
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 300, marginTop: 5 }}>
          Dina konversationer
        </div>
      </div>

      {loading && <div className="loading">Laddar meddelanden…</div>}

      {!loading && conversations.length === 0 && (
        <div className="empty">
          <div style={{ fontSize: 32, marginBottom: 16, opacity: 0.3 }}>✉</div>
          Inga meddelanden ännu.<br />
          <span style={{ fontSize: 11, marginTop: 8, display: 'block' }}>
            Kontakta en medlem via Nätverket.
          </span>
        </div>
      )}

      <div style={{ padding: '0 28px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {conversations.map((c, i) => (
          <div key={c.id} className="card" style={{ padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'center' }}>
            <div className="avatar" style={{ width: 44, height: 44, background: 'linear-gradient(135deg, var(--purple-mid), var(--purple-light))', fontSize: 16, flexShrink: 0 }}>
              ?
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="display" style={{ fontSize: 15, color: 'var(--white)', marginBottom: 3 }}>
                Konversation
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {new Date(c.updated_at).toLocaleDateString('sv-SE')}
              </div>
            </div>
            <span style={{ color: 'var(--text-tertiary)', fontSize: 16 }}>›</span>
          </div>
        ))}
      </div>
    </div>
  )
}
