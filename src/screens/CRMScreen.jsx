import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'

const STATUSES = ['Alla', 'Aktiv', 'Varm', 'Kall', 'Kund', 'Partner']
const STATUS_COLORS = {
  Aktiv:   { bg: 'rgba(212,168,67,0.15)',  text: '#D4A843' },
  Varm:    { bg: 'rgba(232,100,100,0.15)', text: '#E86464' },
  Kall:    { bg: 'rgba(100,150,232,0.15)', text: '#6496E8' },
  Kund:    { bg: 'rgba(100,210,130,0.15)', text: '#64D282' },
  Partner: { bg: 'rgba(180,100,220,0.15)', text: '#B464DC' },
}

const GRADIENTS = [
  '135deg, #7B4BA0, #C8AEDE','135deg, #A0607B, #D4849E',
  '135deg, #4A7B9D, #82B4CC','135deg, #7B8A4A, #B0C07B',
  '135deg, #8A4A6B, #C082A0','135deg, #4A5C8A, #7B8EC0',
  '135deg, #6B4A3A, #B08070','135deg, #C4975A, #E8C87A',
]

export default function CRMScreen() {
  const { user } = useAuth()
  const [contacts, setContacts] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeStatus, setActiveStatus] = useState('Alla')
  const [selected, setSelected] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newContact, setNewContact] = useState({ name: '', company: '', email: '', phone: '', status: 'Aktiv', note: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchContacts() }, [])

  useEffect(() => {
    let result = contacts
    if (activeStatus !== 'Alla') result = result.filter(c => c.status === activeStatus)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(c =>
        c.name?.toLowerCase().includes(q) ||
        c.company?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
      )
    }
    setFiltered(result)
  }, [contacts, search, activeStatus])

  async function fetchContacts() {
    const { data } = await supabase
      .from('card_contacts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (data) setContacts(data)
    setLoading(false)
  }

  async function saveContact() {
    if (!newContact.name) return
    setSaving(true)
    const { data, error } = await supabase
      .from('card_contacts')
      .insert({ ...newContact, user_id: user.id })
      .select()
      .single()
    if (!error && data) {
      setContacts(prev => [data, ...prev])
      setNewContact({ name: '', company: '', email: '', phone: '', status: 'Aktiv', note: '' })
      setShowAdd(false)
    }
    setSaving(false)
  }

  async function updateStatus(id, status) {
    await supabase.from('card_contacts').update({ status }).eq('id', id)
    setContacts(prev => prev.map(c => c.id === id ? { ...c, status } : c))
    if (selected?.id === id) setSelected(prev => ({ ...prev, status }))
  }

  async function deleteContact(id) {
    await supabase.from('card_contacts').delete().eq('id', id)
    setContacts(prev => prev.filter(c => c.id !== id))
    setSelected(null)
  }

  const stats = {
    total: contacts.length,
    kunder: contacts.filter(c => c.status === 'Kund').length,
    varma: contacts.filter(c => c.status === 'Varm').length,
  }

  // ── DETAIL VIEW ──
  if (selected) {
    const s = STATUS_COLORS[selected.status] || STATUS_COLORS['Aktiv']
    return (
      <div style={{ background: 'var(--ink)', minHeight: '100%' }}>
        <div style={{ padding: '12px 28px 0', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
          <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: 20, cursor: 'pointer', padding: 0 }}>←</button>
          <div className="display" style={{ fontSize: 18, color: 'var(--white)' }}>Kontakt</div>
        </div>

        {/* Hero */}
        <div style={{ margin: '0 28px 24px', background: 'linear-gradient(135deg, var(--purple-deep), var(--purple-mid))', borderRadius: 20, padding: '28px 24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(212,168,67,0.06)' }} />
          <div className="avatar" style={{ width: 64, height: 64, background: `linear-gradient(${GRADIENTS[selected.name?.charCodeAt(0) % GRADIENTS.length]})`, fontSize: 24, marginBottom: 14 }}>
            {selected.name?.[0] || '?'}
          </div>
          <div className="display" style={{ fontSize: 26, color: 'var(--white)', marginBottom: 4 }}>{selected.name}</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 300, marginBottom: 14 }}>{selected.company}</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', padding: '5px 12px', borderRadius: 20, background: s.bg, color: s.text, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {selected.status}
          </div>
        </div>

        {/* Info */}
        <div style={{ padding: '0 28px', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          {selected.email && (
            <a href={`mailto:${selected.email}`} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ padding: '14px 18px', display: 'flex', gap: 14, alignItems: 'center' }}>
                <span style={{ color: 'var(--gold)', fontSize: 18 }}>✉</span>
                <div>
                  <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 3 }}>E-post</div>
                  <div style={{ fontSize: 13, color: 'var(--white)', fontWeight: 300 }}>{selected.email}</div>
                </div>
              </div>
            </a>
          )}
          {selected.phone && (
            <a href={`tel:${selected.phone}`} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ padding: '14px 18px', display: 'flex', gap: 14, alignItems: 'center' }}>
                <span style={{ color: 'var(--gold)', fontSize: 18 }}>☎</span>
                <div>
                  <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 3 }}>Telefon</div>
                  <div style={{ fontSize: 13, color: 'var(--white)', fontWeight: 300 }}>{selected.phone}</div>
                </div>
              </div>
            </a>
          )}
          {selected.note && (
            <div className="card" style={{ padding: '14px 18px' }}>
              <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 8 }}>Anteckning</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 300, lineHeight: 1.7 }}>{selected.note}</div>
            </div>
          )}
        </div>

        {/* Status change */}
        <div style={{ padding: '0 28px', marginBottom: 24 }}>
          <div className="section-label">Ändra status</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Object.keys(STATUS_COLORS).map(st => (
              <button key={st} onClick={() => updateStatus(selected.id, st)} style={{ padding: '7px 14px', borderRadius: 20, border: `1px solid ${selected.status === st ? STATUS_COLORS[st].text : 'var(--border)'}`, background: selected.status === st ? STATUS_COLORS[st].bg : 'transparent', color: selected.status === st ? STATUS_COLORS[st].text : 'var(--text-secondary)', fontSize: 11, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s' }}>
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Delete */}
        <div style={{ padding: '0 28px' }}>
          <button onClick={() => deleteContact(selected.id)} style={{ width: '100%', padding: 13, background: 'transparent', border: '1px solid rgba(232,100,100,0.3)', borderRadius: 10, color: '#E86464', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
            Ta bort kontakt
          </button>
        </div>
      </div>
    )
  }

  // ── ADD CONTACT VIEW ──
  if (showAdd) {
    return (
      <div style={{ background: 'var(--ink)', minHeight: '100%' }}>
        <div style={{ padding: '12px 28px 28px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: 20, cursor: 'pointer', padding: 0 }}>←</button>
          <div className="display" style={{ fontSize: 18, color: 'var(--white)' }}>Ny kontakt</div>
        </div>

        <div style={{ padding: '0 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { key: 'name', placeholder: 'Namn *', type: 'text' },
            { key: 'company', placeholder: 'Företag', type: 'text' },
            { key: 'email', placeholder: 'E-post', type: 'email' },
            { key: 'phone', placeholder: 'Telefon', type: 'tel' },
          ].map(f => (
            <input key={f.key} type={f.type} placeholder={f.placeholder} value={newContact[f.key]} onChange={e => setNewContact(prev => ({ ...prev, [f.key]: e.target.value }))}
              style={{ width: '100%', padding: '14px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--white)', fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 300, outline: 'none' }} />
          ))}

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Object.keys(STATUS_COLORS).map(st => (
              <button key={st} onClick={() => setNewContact(prev => ({ ...prev, status: st }))} style={{ padding: '7px 14px', borderRadius: 20, border: `1px solid ${newContact.status === st ? STATUS_COLORS[st].text : 'var(--border)'}`, background: newContact.status === st ? STATUS_COLORS[st].bg : 'transparent', color: newContact.status === st ? STATUS_COLORS[st].text : 'var(--text-secondary)', fontSize: 11, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                {st}
              </button>
            ))}
          </div>

          <textarea placeholder="Anteckning…" value={newContact.note} onChange={e => setNewContact(prev => ({ ...prev, note: e.target.value }))}
            style={{ width: '100%', padding: '14px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--white)', fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 300, outline: 'none', minHeight: 100, resize: 'none' }} />

          <button className="btn-gold" onClick={saveContact} disabled={saving || !newContact.name}>
            {saving ? 'Sparar…' : 'Spara kontakt'}
          </button>
        </div>
      </div>
    )
  }

  // ── MAIN LIST VIEW ──
  return (
    <div style={{ background: 'var(--ink)', minHeight: '100%' }}>

      <div className="fade-up" style={{ padding: '12px 28px 20px' }}>
        <div className="display-italic" style={{ fontSize: 38, lineHeight: 1.1, color: 'var(--white)' }}>
          Ditt
          <span className="display" style={{ display: 'block', fontStyle: 'normal', fontWeight: 500 }}>CRM</span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 300, marginTop: 5 }}>
          Dina kontakter · Privat & säkert
        </div>
      </div>

      {/* Stats */}
      <div className="fade-up-1 stat-row" style={{ margin: '0 28px 20px' }}>
        <div className="stat-item">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Kontakter</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{stats.varma}</div>
          <div className="stat-label">Varma</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{stats.kunder}</div>
          <div className="stat-label">Kunder</div>
        </div>
      </div>

      {/* Search */}
      <div className="fade-up-2" style={{ margin: '0 28px 16px' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 16, opacity: 0.35 }}>⌕</span>
          <input type="text" placeholder="Sök namn, företag, e-post…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--white)', fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 300, width: '100%' }} />
        </div>
      </div>

      {/* Status filter */}
      <div className="fade-up-2" style={{ display: 'flex', gap: 8, padding: '0 28px', marginBottom: 20, overflowX: 'auto', scrollbarWidth: 'none' }}>
        {STATUSES.map(s => (
          <button key={s} onClick={() => setActiveStatus(s)} style={{ flexShrink: 0, padding: '6px 14px', borderRadius: 20, border: `1px solid ${activeStatus === s ? 'var(--border-gold)' : 'var(--border)'}`, background: activeStatus === s ? 'rgba(212,168,67,0.12)' : 'transparent', color: activeStatus === s ? 'var(--gold)' : 'var(--text-secondary)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif', transition: 'all 0.2s" }}>
            {s}
          </button>
        ))}
      </div>

      {loading && <div className="loading">Laddar kontakter…</div>}

      {!loading && contacts.length === 0 && (
        <div className="empty">
          <div style={{ fontSize: 32, marginBottom: 16, opacity: 0.2 }}>◎</div>
          Inga kontakter ännu.<br />
          <span style={{ fontSize: 11, marginTop: 8, display: 'block' }}>Lägg till din första kontakt nedan.</span>
        </div>
      )}

      {/* Contact list */}
      <div style={{ padding: '0 28px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map((c, i) => {
          const s = STATUS_COLORS[c.status] || STATUS_COLORS['Aktiv']
          return (
            <div key={c.id} className="card" onClick={() => setSelected(c)} style={{ padding: '14px 16px', display: 'flex', gap: 14, alignItems: 'center' }}>
              <div className="avatar" style={{ width: 44, height: 44, background: `linear-gradient(${GRADIENTS[i % GRADIENTS.length]})`, fontSize: 16, flexShrink: 0 }}>
                {c.name?.[0] || '?'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="display" style={{ fontSize: 16, color: 'var(--white)', marginBottom: 2 }}>{c.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.company || c.email || 'Ingen info'}
                </div>
              </div>
              <div style={{ padding: '4px 10px', borderRadius: 12, background: s.bg, color: s.text, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', flexShrink: 0 }}>
                {c.status}
              </div>
            </div>
          )
        })}
      </div>

      {/* Add button */}
      <div style={{ padding: '20px 28px 8px' }}>
        <button className="btn-gold" onClick={() => setShowAdd(true)}>+ Lägg till kontakt</button>
      </div>

    </div>
  )
}
