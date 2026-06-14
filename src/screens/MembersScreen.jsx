import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const GRADIENTS = [
  '135deg, #7B4BA0, #C8AEDE','135deg, #A0607B, #D4849E',
  '135deg, #4A7B9D, #82B4CC','135deg, #7B8A4A, #B0C07B',
  '135deg, #8A4A6B, #C082A0','135deg, #4A5C8A, #7B8EC0',
  '135deg, #6B4A3A, #B08070','135deg, #4A7B5C, #82B4A0',
]

export default function MembersScreen() {
  const [members, setMembers] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchMembers() }, [])

  useEffect(() => {
    if (!search) { setFiltered(members); return }
    const q = search.toLowerCase()
    setFiltered(members.filter(m =>
      m.full_name?.toLowerCase().includes(q) ||
      m.company_name?.toLowerCase().includes(q) ||
      m.bio?.toLowerCase().includes(q) ||
      m.industry?.toLowerCase().includes(q)
    ))
  }, [search, members])

  async function fetchMembers() {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, company_name, membership_tier, bio, industry, avatar_url')
      .not('full_name', 'is', null)
      .order('created_at', { ascending: false })
      .limit(50)
    if (data) { setMembers(data); setFiltered(data) }
    setLoading(false)
  }

  return (
    <div style={{ background: 'var(--ink)', minHeight: '100%' }}>

      <div className="fade-up" style={{ padding: '12px 28px 20px' }}>
        <div className="display-italic" style={{ fontSize: 38, lineHeight: 1.1, color: 'var(--white)' }}>
          Nätverket
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 300, marginTop: 5 }}>
          {members.length} aktiva medlemmar
        </div>
      </div>

      {/* Search */}
      <div className="fade-up-1" style={{ margin: '0 28px 24px' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 16, opacity: 0.35 }}>⌕</span>
          <input
            type="text"
            placeholder="Sök namn, företag eller kompetens…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--white)', fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 300, width: '100%' }}
          />
        </div>
      </div>

      {loading && <div className="loading">Laddar medlemmar…</div>}

      {/* Grid */}
      <div className="fade-up-2" style={{ padding: '0 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {filtered.map((m, i) => (
          <div key={m.id} className="card" style={{ borderRadius: 18, overflow: 'hidden' }}>
            {/* Avatar */}
            <div style={{ height: 96, background: `linear-gradient(${GRADIENTS[i % GRADIENTS.length]})`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <div className="display-italic" style={{ fontSize: 34, color: 'rgba(255,255,255,0.4)' }}>
                {m.full_name?.[0] || '?'}
              </div>
              {m.membership_tier === 'VIP' && (
                <div style={{ position: 'absolute', bottom: 8, left: 10, fontSize: 8, color: 'var(--gold)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                  ◆ VIP
                </div>
              )}
            </div>
            {/* Info */}
            <div style={{ padding: '12px 12px 14px' }}>
              <div className="display" style={{ fontSize: 15, color: 'var(--white)', fontWeight: 500, marginBottom: 3 }}>
                {m.full_name}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 300, lineHeight: 1.4 }}>
                {m.company_name || m.industry || 'Entreprenör'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="empty">Inga medlemmar hittades för "{search}"</div>
      )}
    </div>
  )
}
