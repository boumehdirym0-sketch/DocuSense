import React, { useState, useEffect } from 'react'
import API from '../services/api'
import { useNavigate } from 'react-router-dom'

const ROLE_COLORS = { developer: '#185FA5', enduser: '#8E44AD', admin: '#E67E22' }
const ROLE_BG = { developer: '#EFF6FF', enduser: '#F5F0FF', admin: '#FFF7ED' }

const Admin = () => {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [menuOpen, setMenuOpen] = useState(false)
  const navTo = (section) => { setActiveSection(section); setMenuOpen(false) }
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [manuals, setManuals] = useState([])
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(false)
  const [adminName] = useState(localStorage.getItem('name') || 'Admin')
  const navigate = useNavigate()

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    fetchStats()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (activeSection === 'utilisateurs') fetchUsers()
    if (activeSection === 'manuels') fetchManuals()
  }, [activeSection])

  const fetchStats = async () => {
    try {
      const { data } = await API.get('/admin/stats')
      setStats(data)
    } catch (err) {
      if (err.response?.status === 403) navigate('/login')
    }
  }

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { data } = await API.get('/admin/users')
      setUsers(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchManuals = async () => {
    try {
      setLoading(true)
      const { data } = await API.get('/admin/manuals')
      setManuals(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const changeRole = async (userId, newRole) => {
    try {
      await API.put(`/admin/users/${userId}/role`, { role: newRole })
      showToast('Rôle mis à jour')
      fetchUsers()
      fetchStats()
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur', 'error')
    }
  }

  const deleteManual = async (manual) => {
    if (!window.confirm(`Supprimer définitivement « ${manual.title} » ? Cette action est irréversible.`)) return
    try {
      await API.delete(`/admin/manuals/${manual.id}`)
      showToast('Manuel supprimé', 'error')
      fetchManuals()
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur', 'error')
    }
  }

  const deleteUser = async (user) => {
    if (!window.confirm(`Supprimer l'utilisateur « ${user.name} » ? Cette action est irréversible.`)) return
    try {
      await API.delete(`/admin/users/${user.id}`)
      showToast('Utilisateur supprimé', 'error')
      fetchUsers()
      fetchStats()
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur', 'error')
    }
  }

  const logout = () => {
    localStorage.clear()
    navigate('/', { replace: true })
  }

  const menuItems = [
    { icon: '📊', label: 'Dashboard', section: 'dashboard' },
    { icon: '👥', label: 'Utilisateurs', section: 'utilisateurs' },
    { icon: '📚', label: 'Tous les manuels', section: 'manuels' },
  ]

  const Sidebar = () => (
    <div className={`sidebar${menuOpen ? ' open' : ''}`} style={{ width: 230, background: '#fff', borderRight: '1px solid #EEF2F7', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, padding: '0 8px' }}>
        <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg,#E67E22,#F39C12)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 800, boxShadow: '0 4px 10px rgba(230,126,34,0.3)' }}>DS</div>
        <span style={{ fontSize: 18, fontWeight: 800, color: '#0C447C' }}>Docu<span style={{ color: '#E67E22' }}>Sense</span></span>
      </div>

      <div style={{ background: '#FFF7ED', borderRadius: 10, padding: '10px 12px', marginBottom: 16, border: '1px solid #FAD7A0' }}>
        <div style={{ fontSize: 11, color: '#94A3B8' }}>Connecté en tant que</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#0C2340', marginTop: 2 }}>{adminName}</div>
        <div style={{ fontSize: 11, color: '#E67E22', marginTop: 1, fontWeight: 600 }}>Administrateur</div>
      </div>

      <div style={{ fontSize: 10, fontWeight: 600, color: '#94A3B8', letterSpacing: 1.5, padding: '0 8px', margin: '4px 0' }}>MENU</div>

      {menuItems.map(item => (
        <div key={item.section} onClick={() => navTo(item.section)}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', background: activeSection === item.section ? '#FFF7ED' : 'transparent', color: activeSection === item.section ? '#E67E22' : '#64748B', fontSize: 14, fontWeight: activeSection === item.section ? 600 : 400, transition: 'all 0.15s' }}>
          <span style={{ fontSize: 16 }}>{item.icon}</span>
          {item.label}
        </div>
      ))}

      <div onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', color: '#E74C3C', fontSize: 14, marginTop: 'auto', background: '#FFF5F5' }}>
        <span style={{ fontSize: 16 }}>🚪</span> Déconnexion
      </div>
    </div>
  )

  const SectionDashboard = () => (
    <>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#0C2340' }}>Tableau de bord administrateur</div>
        <div style={{ fontSize: 14, color: '#94A3B8', marginTop: 4 }}>Vue globale de la plateforme DocuSense</div>
      </div>

      {stats && (
        <>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#94A3B8', letterSpacing: 1, marginBottom: 12, textTransform: 'uppercase' }}>Utilisateurs</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
            {[
              { icon: '👥', label: 'Total utilisateurs', value: stats.totalUsers, color: '#185FA5', bg: '#EFF6FF', border: '#185FA5' },
              { icon: '🛠️', label: 'Développeurs', value: stats.developers, color: '#27AE60', bg: '#F0FFF4', border: '#27AE60' },
              { icon: '👤', label: 'Utilisateurs finaux', value: stats.endusers, color: '#8E44AD', bg: '#F5F0FF', border: '#8E44AD' },
              { icon: '🔑', label: 'Administrateurs', value: stats.admins, color: '#E67E22', bg: '#FFF7ED', border: '#E67E22' },
            ].map(m => (
              <div key={m.label} style={{ background: '#fff', border: '1px solid #EEF2F7', borderTop: `3px solid ${m.border}`, borderRadius: 14, padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 34, height: 34, background: m.bg, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{m.icon}</div>
                  <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 500 }}>{m.label}</span>
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#0C2340' }}>{m.value}</div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 13, fontWeight: 600, color: '#94A3B8', letterSpacing: 1, marginBottom: 12, textTransform: 'uppercase' }}>Manuels</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 28 }}>
            {[
              { icon: '📚', label: 'Total manuels', value: stats.totalManuals, border: '#185FA5' },
              { icon: '✅', label: 'Publiés', value: stats.publishedManuals, border: '#27AE60' },
              { icon: '🗂', label: 'Archivés', value: stats.archivedManuals, border: '#E67E22' },
            ].map(m => (
              <div key={m.label} style={{ background: '#fff', border: '1px solid #EEF2F7', borderTop: `3px solid ${m.border}`, borderRadius: 14, padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ fontSize: 22 }}>{m.icon}</div>
                  <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 500 }}>{m.label}</span>
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#0C2340' }}>{m.value}</div>
              </div>
            ))}
          </div>
        </>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div onClick={() => setActiveSection('utilisateurs')} style={{ background: '#fff', border: '1px solid #EEF2F7', borderRadius: 14, padding: 24, cursor: 'pointer', transition: 'box-shadow 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>👥</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0C2340', marginBottom: 4 }}>Gérer les utilisateurs</div>
          <div style={{ fontSize: 13, color: '#94A3B8' }}>Modifier les rôles, supprimer des comptes</div>
        </div>
        <div onClick={() => setActiveSection('manuels')} style={{ background: '#fff', border: '1px solid #EEF2F7', borderRadius: 14, padding: 24, cursor: 'pointer', transition: 'box-shadow 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>📚</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0C2340', marginBottom: 4 }}>Voir tous les manuels</div>
          <div style={{ fontSize: 13, color: '#94A3B8' }}>Tous les manuels de la plateforme</div>
        </div>
      </div>
    </>
  )

  const SectionUtilisateurs = () => (
    <>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#0C2340' }}>Gestion des utilisateurs</div>
        <div style={{ fontSize: 14, color: '#94A3B8', marginTop: 4 }}>{users.length} utilisateur{users.length !== 1 ? 's' : ''} enregistré{users.length !== 1 ? 's' : ''}</div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#94A3B8' }}>⏳ Chargement...</div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #EEF2F7', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFF', borderBottom: '1px solid #EEF2F7' }}>
                {['Utilisateur', 'Email', 'Rôle', 'Inscrit le', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B', letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <tr key={user.id} style={{ borderBottom: i < users.length - 1 ? '1px solid #F0F4F8' : 'none' }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, background: `linear-gradient(135deg,${ROLE_BG[user.role]},${ROLE_BG[user.role]})`, border: `2px solid ${ROLE_COLORS[user.role]}20`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: ROLE_COLORS[user.role] }}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#0C2340' }}>{user.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#64748B' }}>{user.email}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <select
                      value={user.role}
                      onChange={e => changeRole(user.id, e.target.value)}
                      style={{ padding: '6px 10px', borderRadius: 8, border: `1.5px solid ${ROLE_COLORS[user.role]}40`, background: ROLE_BG[user.role], color: ROLE_COLORS[user.role], fontSize: 12, fontWeight: 600, cursor: 'pointer', outline: 'none' }}>
                      <option value="developer">Développeur</option>
                      <option value="enduser">Utilisateur</option>
                      <option value="admin">Administrateur</option>
                    </select>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#94A3B8' }}>
                    {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <button
                      onClick={() => deleteUser(user)}
                      style={{ padding: '6px 14px', background: '#FFF5F5', color: '#E74C3C', border: '1px solid #FECACA', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div style={{ textAlign: 'center', padding: 60, color: '#94A3B8' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>👥</div>
              <div>Aucun utilisateur trouvé</div>
            </div>
          )}
        </div>
      )}
    </>
  )

  const SectionManuels = () => (
    <>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#0C2340' }}>Tous les manuels</div>
        <div style={{ fontSize: 14, color: '#94A3B8', marginTop: 4 }}>{manuals.length} manuel{manuals.length !== 1 ? 's' : ''} au total</div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#94A3B8' }}>⏳ Chargement...</div>
      ) : manuals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#94A3B8', background: '#fff', borderRadius: 14, border: '1px solid #EEF2F7' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
          <div>Aucun manuel sur la plateforme</div>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #EEF2F7', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFF', borderBottom: '1px solid #EEF2F7' }}>
                {['Manuel', 'Auteur', 'Statut', 'Créé le', 'Action'].map(h => (
                  <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B', letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {manuals.map((manual, i) => (
                <tr key={manual.id} style={{ borderBottom: i < manuals.length - 1 ? '1px solid #F0F4F8' : 'none' }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, background: '#EFF6FF', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📄</div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#0C2340' }}>{manual.title}</div>
                        {manual.description && (
                          <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 1 }}>{manual.description.slice(0, 50)}{manual.description.length > 50 ? '…' : ''}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#64748B' }}>
                    {manual.User ? manual.User.name : '—'}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    {manual.isArchived ? (
                      <span style={{ fontSize: 12, background: '#F8FAFC', color: '#94A3B8', padding: '4px 12px', borderRadius: 20, border: '1px solid #E2E8F0', fontWeight: 500 }}>🗂 Archivé</span>
                    ) : manual.isPublished ? (
                      <span style={{ fontSize: 12, background: '#F0FFF4', color: '#166534', padding: '4px 12px', borderRadius: 20, border: '1px solid #BBF7D0', fontWeight: 500 }}>✅ Publié</span>
                    ) : (
                      <span style={{ fontSize: 12, background: '#F8FAFC', color: '#64748B', padding: '4px 12px', borderRadius: 20, border: '1px solid #E2E8F0', fontWeight: 500 }}>📝 Brouillon</span>
                    )}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#94A3B8' }}>
                    {new Date(manual.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <button onClick={() => deleteManual(manual)} style={{ padding: '6px 14px', background: '#FFF5F5', color: '#E74C3C', border: '1px solid #FECACA', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                      🗑 Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )

  return (
    <div className="page-layout" style={{ display: 'flex', height: '100vh', background: '#F8FAFF', fontFamily: 'Inter, Arial, sans-serif' }}>
      <div className="mobile-topbar">
        <button className="hamburger-btn" onClick={() => setMenuOpen(o => !o)}>
          <span /><span /><span />
        </button>
        <span className="logo-text">Docu<span style={{ color: '#E67E22' }}>Sense</span></span>
        <div style={{ width: 34 }} />
      </div>
      <div className={`sidebar-overlay${menuOpen ? ' open' : ''}`} onClick={() => setMenuOpen(false)} />
      <Sidebar />

      <div className="main-content" style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
        {activeSection === 'dashboard' && <SectionDashboard />}
        {activeSection === 'utilisateurs' && <SectionUtilisateurs />}
        {activeSection === 'manuels' && <SectionManuels />}
      </div>

      {toast && (
        <div style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 2000, padding: '14px 22px', background: toast.type === 'error' ? '#E74C3C' : '#27AE60', color: '#fff', borderRadius: 12, fontSize: 14, fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.18)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>{toast.type === 'error' ? '❌' : '✅'}</span> {toast.msg}
        </div>
      )}
    </div>
  )
}

export default Admin
