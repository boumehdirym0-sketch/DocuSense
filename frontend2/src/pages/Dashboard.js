import React, { useState, useEffect } from 'react'
import API from '../services/api'
import { useNavigate } from 'react-router-dom'
import { exportManualToPDF } from '../services/pdfUtils'

const Dashboard = () => {
  const [manuals, setManuals] = useState([])
  const [archivedManuals, setArchivedManuals] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [selectedManual, setSelectedManual] = useState(null)
  const [appDescription, setAppDescription] = useState('')
  const [stepByStepMode, setStepByStepMode] = useState({})
  const [stepByStepSteps, setStepByStepSteps] = useState({})
  const [stepByStepLoading, setStepByStepLoading] = useState({})
  const [savedSteps, setSavedSteps] = useState({})
  const [showSavedSteps, setShowSavedSteps] = useState({})
  const [loading, setLoading] = useState(false)
  const [loadingArchive, setLoadingArchive] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [error, setError] = useState('')
  const [activeSection, setActiveSection] = useState('dashboard')
  const [toast, setToast] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [userInfo, setUserInfo] = useState({
    name: sessionStorage.getItem('name') || '',
    email: sessionStorage.getItem('email') || '',
    role: sessionStorage.getItem('role') || '',
  })
  const navigate = useNavigate()

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    fetchManuals()
    API.get('/auth/me').then(({ data }) => {
      sessionStorage.setItem('name', data.name)
      sessionStorage.setItem('role', data.role)
      setUserInfo(u => ({ ...u, name: data.name, role: data.role }))
    }).catch(() => {})
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (activeSection === 'archives') fetchArchivedManuals()
  }, [activeSection])

  const fetchManuals = async () => {
    try {
      const { data } = await API.get('/manuals')
      setManuals(data)
    } catch (err) {
      navigate('/login')
    }
  }

  const fetchArchivedManuals = async () => {
    try {
      setLoadingArchive(true)
      const { data } = await API.get('/manuals/archived')
      setArchivedManuals(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingArchive(false)
    }
  }

  const createManual = async () => {
    if (!title.trim()) return
    try {
      const { data } = await API.post('/manuals', { title, description })
      setTitle('')
      setDescription('')
      setShowCreate(false)
      showToast('Manuel créé !')
      fetchManuals()
      return data
    } catch (err) {
      console.error(err)
    }
  }

  const suggestSteps = async (manualId) => {
    try {
      setLoading(true)
      setSelectedManual(manualId)
      setError('')
      setSuggestions([])
      setStepByStepMode(s => ({ ...s, [manualId]: false }))
      const { data } = await API.post('/ai/suggest', { appDescription })
      setSuggestions(data.steps)
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur IA')
    } finally {
      setLoading(false)
    }
  }

  const analyzeImage = async (manualId, file) => {
    try {
      setLoading(true)
      setError('')
      setSuggestions([])
      setStepByStepMode(s => ({ ...s, [manualId]: false }))
      setSelectedManual(manualId)
      const formData = new FormData()
      formData.append('image', file)
      const { data } = await API.post('/ai/analyze-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setSuggestions(data.steps)
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur analyse image')
    } finally {
      setLoading(false)
    }
  }

  const extractVideoFrame = (file) => new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const url = URL.createObjectURL(file)
    video.addEventListener('loadedmetadata', () => { video.currentTime = Math.min(video.duration * 0.15, 3) })
    video.addEventListener('seeked', () => {
      canvas.width = video.videoWidth || 1280
      canvas.height = video.videoHeight || 720
      canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url)
        if (!blob || blob.size < 2000) { reject(new Error('Frame vide — utilisez plutôt le bouton "Analyser image"')); return }
        resolve(new File([blob], 'frame.jpg', { type: 'image/jpeg' }))
      }, 'image/jpeg', 0.92)
    })
    video.addEventListener('error', () => { URL.revokeObjectURL(url); reject(new Error('Format vidéo non supporté')) })
    video.muted = true; video.src = url; video.load()
  })

  const analyzeVideo = async (manualId, file) => {
    try {
      setLoading(true)
      setError('')
      setSuggestions([])
      setStepByStepMode(s => ({ ...s, [manualId]: false }))
      setSelectedManual(manualId)
      const frame = await extractVideoFrame(file)
      const formData = new FormData()
      formData.append('image', frame)
      const { data } = await API.post('/ai/analyze-image', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      setSuggestions(data.steps)
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur analyse vidéo')
    } finally {
      setLoading(false)
    }
  }

  const toStr = (v) => {
    if (v === null || v === undefined) return ''
    if (Array.isArray(v)) return v.join(' ')
    if (typeof v === 'object') return Object.values(v).join(' ')
    return String(v)
  }

  const analyzeImageSingleStep = async (manualId, file) => {
    try {
      setStepByStepLoading(s => ({ ...s, [manualId]: true }))
      const formData = new FormData()
      formData.append('image', file)
      const { data } = await API.post('/ai/analyze-image-step', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const cleanStep = {
        title: toStr(data.title),
        description: toStr(data.description),
        quiz: data.quiz ? {
          question: toStr(data.quiz.question),
          options: Array.isArray(data.quiz.options) ? data.quiz.options.map(toStr) : [],
          correctAnswer: toStr(data.quiz.correctAnswer),
          points: parseInt(data.quiz.points) || 10
        } : null
      }
      setStepByStepSteps(s => ({
        ...s,
        [manualId]: [...(s[manualId] || []), cleanStep]
      }))
      showToast('Étape ajoutée !')
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur analyse image')
    } finally {
      setStepByStepLoading(s => ({ ...s, [manualId]: false }))
    }
  }

  const removeStepByStep = (manualId, index) => {
    setStepByStepSteps(s => ({
      ...s,
      [manualId]: (s[manualId] || []).filter((_, i) => i !== index)
    }))
  }

  const loadSavedSteps = async (manualId) => {
    try {
      const { data } = await API.get(`/manuals/${manualId}`)
      setSavedSteps(s => ({ ...s, [manualId]: data.Steps || [] }))
      setShowSavedSteps(s => ({ ...s, [manualId]: true }))
    } catch (err) {
      console.error(err)
    }
  }

  const saveStepByStepSteps = async (manualId) => {
    try {
      const steps = stepByStepSteps[manualId] || []
      if (steps.length === 0) return
      await API.post(`/manuals/${manualId}/steps`, { steps })
      showToast(`${steps.length} étape(s) sauvegardée(s) !`)
      setStepByStepSteps(s => ({ ...s, [manualId]: [] }))
      setStepByStepMode(s => ({ ...s, [manualId]: false }))
      loadSavedSteps(manualId)
    } catch (err) {
      console.error(err)
    }
  }

  const saveSteps = async (manualId) => {
    try {
      await API.post(`/manuals/${manualId}/steps`, { steps: suggestions })
      showToast('Étapes sauvegardées !')
      setSuggestions([])
      setSelectedManual(null)
      await loadSavedSteps(manualId)
      setShowSavedSteps(s => ({ ...s, [manualId]: true }))
    } catch (err) {
      console.error(err)
    }
  }

  const archiveManual = async (manual) => {
    if (!window.confirm(`Archiver « ${manual.title} » ?`)) return
    try {
      await API.delete(`/manuals/${manual.id}`)
      showToast('Manuel archivé')
      fetchManuals()
    } catch (err) { console.error(err) }
  }

  const restoreManual = async (id) => {
    try {
      await API.post(`/manuals/${id}/restore`)
      showToast('Manuel restauré !')
      fetchArchivedManuals()
      fetchManuals()
    } catch (err) { console.error(err) }
  }

  const permanentDelete = async (manual) => {
    if (!window.confirm(`Supprimer définitivement « ${manual.title} » ? Cette action est irréversible.`)) return
    try {
      await API.delete(`/manuals/${manual.id}/permanent`)
      showToast('Manuel supprimé définitivement', 'error')
      fetchArchivedManuals()
    } catch (err) { console.error(err) }
  }

  const handleExportPDF = async (manual) => {
    try {
      const { data } = await API.get(`/manuals/${manual.id}`)
      exportManualToPDF(data, data.Steps || [])
    } catch (err) { console.error(err) }
  }

  const togglePublish = async (manual) => {
    try {
      await API.put(`/manuals/${manual.id}`, { isPublished: !manual.isPublished })
      showToast(manual.isPublished ? 'Manuel dépublié' : 'Manuel publié !')
      fetchManuals()
    } catch (err) { console.error(err) }
  }

  const logout = () => {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('role')
    sessionStorage.removeItem('name')
    sessionStorage.removeItem('email')
    navigate('/', { replace: true })
  }

  const nav = (section) => {
    setActiveSection(section)
    setSuggestions([])
    setSelectedManual(null)
    setError('')
    setMenuOpen(false)
  }

  // ── SIDEBAR ─────────────────────────────────────────────────────────
  const menuItems = [
    { icon: '📊', label: 'Dashboard', section: 'dashboard' },
    { icon: '📚', label: 'Mes manuels', section: 'manuels' },
    { icon: '🗂', label: 'Mes archives', section: 'archives' },
    { icon: '🎮', label: 'Gamification', section: 'gamification' },
  ]

  const Sidebar = () => (
    <div className={`sidebar${menuOpen ? ' open' : ''}`} style={{ width: 230, background: '#fff', borderRight: '1px solid #EEF2F7', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, padding: '0 8px' }}>
        <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg,#185FA5,#378ADD)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 800, boxShadow: '0 4px 10px rgba(24,95,165,0.3)' }}>DS</div>
        <span style={{ fontSize: 18, fontWeight: 800, color: '#0C447C' }}>Docu<span style={{ color: '#185FA5' }}>Sense</span></span>
      </div>

      <div style={{ background: '#F8FAFF', borderRadius: 10, padding: '10px 12px', marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: '#94A3B8' }}>Connecté en tant que</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#0C2340', marginTop: 2 }}>{userInfo.name || '—'}</div>
        <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 1 }}>{userInfo.role === 'developer' ? 'Développeur' : 'Utilisateur'}</div>
      </div>

      <div style={{ fontSize: 10, fontWeight: 600, color: '#94A3B8', letterSpacing: 1.5, padding: '0 8px', margin: '4px 0' }}>MENU</div>

      {menuItems.map(item => (
        <div key={item.section} onClick={() => item.section === 'gamification' ? navigate('/quiz') : nav(item.section)}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', background: activeSection === item.section ? '#EFF6FF' : 'transparent', color: activeSection === item.section ? '#185FA5' : '#64748B', fontSize: 14, fontWeight: activeSection === item.section ? 600 : 400, transition: 'all 0.15s' }}>
          <span style={{ fontSize: 16 }}>{item.icon}</span>
          {item.label}
          {item.section === 'archives' && archivedManuals.length > 0 && (
            <span style={{ marginLeft: 'auto', background: '#E74C3C', color: '#fff', borderRadius: 10, fontSize: 10, fontWeight: 700, padding: '2px 7px' }}>{archivedManuals.length}</span>
          )}
        </div>
      ))}

      <div style={{ fontSize: 10, fontWeight: 600, color: '#94A3B8', letterSpacing: 1.5, padding: '0 8px', margin: '8px 0 4px' }}>COMPTE</div>

      <div onClick={() => nav('compte')} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', background: activeSection === 'compte' ? '#EFF6FF' : 'transparent', color: activeSection === 'compte' ? '#185FA5' : '#64748B', fontSize: 14, fontWeight: activeSection === 'compte' ? 600 : 400 }}>
        <span style={{ fontSize: 16 }}>👤</span> Mon compte
      </div>

      <div onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', color: '#E74C3C', fontSize: 14, marginTop: 'auto', background: '#FFF5F5' }}>
        <span style={{ fontSize: 16 }}>🚪</span> Déconnexion
      </div>
    </div>
  )

  // ── SECTION DASHBOARD (overview) ────────────────────────────────────
  const SectionDashboard = () => (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#0C2340' }}>Tableau de bord</div>
          <div style={{ fontSize: 14, color: '#94A3B8', marginTop: 4 }}>Bienvenue, <strong style={{ color: '#185FA5' }}>{userInfo.name || 'Développeur'}</strong> 👋</div>
        </div>
        <button onClick={() => { nav('manuels'); setShowCreate(true) }} style={{ padding: '11px 22px', background: 'linear-gradient(135deg,#185FA5,#378ADD)', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 600, boxShadow: '0 4px 12px rgba(24,95,165,0.3)' }}>
          + Nouveau manuel
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { icon: '📚', bg: '#EFF6FF', color: '#185FA5', border: '#185FA5', label: 'Total manuels', value: manuals.length },
          { icon: '✅', bg: '#F0FFF4', color: '#166534', border: '#27AE60', label: 'Publiés', value: manuals.filter(m => m.isPublished).length },
          { icon: '🗂', bg: '#FFF7ED', color: '#854F0B', border: '#E67E22', label: 'Archives', value: archivedManuals.length },
        ].map(m => (
          <div key={m.label} style={{ background: '#fff', border: '1px solid #EEF2F7', borderTop: `3px solid ${m.border}`, borderRadius: 14, padding: '20px 20px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 38, height: 38, background: m.bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{m.icon}</div>
              <span style={{ fontSize: 13, color: '#94A3B8', fontWeight: 500 }}>{m.label}</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#0C2340' }}>{m.value}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 16, fontWeight: 600, color: '#0C2340', marginBottom: 16 }}>Manuels récents</div>

      {manuals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#94A3B8', background: '#fff', borderRadius: 14, border: '1px solid #EEF2F7' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
          <div style={{ fontSize: 15, marginBottom: 16 }}>Aucun manuel pour l'instant</div>
          <button onClick={() => { nav('manuels'); setShowCreate(true) }} style={{ padding: '10px 24px', background: '#185FA5', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
            Créer mon premier manuel
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {manuals.slice(0, 4).map(manual => (
            <div key={manual.id} style={{ background: '#fff', border: '1px solid #EEF2F7', borderRadius: 14, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                <div style={{ width: 42, height: 42, background: 'linear-gradient(135deg,#EFF6FF,#E0EEFF)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📄</div>
                <span style={{ fontSize: 12, background: manual.isPublished ? '#F0FFF4' : '#F8FAFC', color: manual.isPublished ? '#166534' : '#64748B', padding: '4px 12px', borderRadius: 20, fontWeight: 500, border: manual.isPublished ? '1px solid #BBF7D0' : '1px solid #E2E8F0' }}>
                  {manual.isPublished ? '✅ Publié' : '📝 Brouillon'}
                </span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#0C2340', marginBottom: 4 }}>{manual.title}</div>
              <div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.5 }}>{manual.description}</div>
            </div>
          ))}
          {manuals.length > 4 && (
            <div onClick={() => nav('manuels')} style={{ background: '#F8FAFF', border: '2px dashed #B5D4F4', borderRadius: 14, padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#185FA5', fontSize: 14, fontWeight: 600 }}>
              Voir tous les manuels ({manuals.length}) →
            </div>
          )}
        </div>
      )}
    </>
  )

  // ── SECTION MANUELS ──────────────────────────────────────────────────
  const ManualCard = ({ manual }) => (
    <div style={{ background: '#fff', border: '1px solid #EEF2F7', borderRadius: 14, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 14 }}>
        <div style={{ width: 42, height: 42, background: 'linear-gradient(135deg,#EFF6FF,#E0EEFF)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📄</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, background: manual.isPublished ? '#F0FFF4' : '#F8FAFC', color: manual.isPublished ? '#166534' : '#64748B', padding: '4px 12px', borderRadius: 20, fontWeight: 500, border: manual.isPublished ? '1px solid #BBF7D0' : '1px solid #E2E8F0' }}>
            {manual.isPublished ? '✅ Publié' : '📝 Brouillon'}
          </span>
          <button onClick={() => archiveManual(manual)} title="Archiver" style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: '#FFF5F5', color: '#E74C3C', cursor: 'pointer', fontSize: 14 }}>🗑</button>
        </div>
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, color: '#0C2340', marginBottom: 4 }}>{manual.title}</div>
      <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 12, lineHeight: 1.5 }}>{manual.description}</div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button onClick={() => togglePublish(manual)} style={{ flex: 1, padding: '8px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, border: 'none', background: manual.isPublished ? '#FFF5F5' : '#F0FFF4', color: manual.isPublished ? '#E74C3C' : '#27AE60' }}>
          {manual.isPublished ? '📴 Dépublier' : '🚀 Publier'}
        </button>
        <button onClick={() => handleExportPDF(manual)} style={{ flex: 1, padding: '8px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, border: 'none', background: '#EFF6FF', color: '#185FA5' }}>
          📄 PDF
        </button>
      </div>

      {/* Bouton voir les étapes sauvegardées */}
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => showSavedSteps[manual.id] ? setShowSavedSteps(s => ({ ...s, [manual.id]: false })) : loadSavedSteps(manual.id)}
          style={{ width: '100%', padding: '9px', background: '#F8FAFF', color: '#185FA5', border: '1px solid #B5D4F4', borderRadius: 10, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
          📋 {showSavedSteps[manual.id] ? 'Masquer les étapes' : 'Voir les étapes sauvegardées'}
        </button>

        {showSavedSteps[manual.id] && (
          <div style={{ marginTop: 8, background: '#F8FAFF', borderRadius: 10, padding: 12, border: '1px solid #E2EEF9' }}>
            {(savedSteps[manual.id] || []).length === 0 ? (
              <div style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center' }}>Aucune étape sauvegardée</div>
            ) : (
              <>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#185FA5', marginBottom: 8 }}>
                  {(savedSteps[manual.id] || []).length} étape(s) sauvegardée(s)
                </div>
                {(savedSteps[manual.id] || []).map((step, i) => (
                  <div key={i} style={{ background: '#fff', borderRadius: 8, padding: '12px 14px', marginBottom: 8, border: '1px solid #E2EEF9', borderLeft: '3px solid #185FA5' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#185FA5', marginBottom: 6 }}>Étape {i + 1} — {step.title}</div>
                    <div style={{ fontSize: 12, color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{step.description}</div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      <div style={{ borderTop: '1px solid #F0F4F8', paddingTop: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#185FA5', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>✨</span> Générer avec IA
        </div>

        {/* Description */}
        <textarea
          style={{ width: '100%', padding: '9px 12px', marginBottom: 8, borderRadius: 10, border: '1.5px solid #E2EEF9', fontSize: 13, boxSizing: 'border-box', outline: 'none', color: '#334155', resize: 'vertical', minHeight: 72, fontFamily: 'inherit', lineHeight: 1.6 }}
          placeholder="Décrivez votre application..."
          value={selectedManual === manual.id ? appDescription : ''}
          onChange={e => { setSelectedManual(manual.id); setAppDescription(e.target.value) }}
        />
        <div style={{ fontSize: 11, color: '#B45309', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, padding: '7px 10px', marginBottom: 8, lineHeight: 1.5 }}>
          ⚠️ <strong>L'IA génère à partir de votre texte uniquement.</strong> Décrivez précisément les fonctionnalités, boutons et sections qui existent réellement dans votre application pour éviter les étapes inventées.
        </div>
        <button onClick={() => suggestSteps(manual.id)} style={{ width: '100%', padding: '9px', background: 'linear-gradient(135deg,#F5F0FF,#EDE8FF)', color: '#8E44AD', border: '1px solid #C39BD3', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
          ✨ Par description
        </button>

        {/* Image / Vidéo */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <label style={{ flex: 1, padding: '9px', background: 'linear-gradient(135deg,#EFF6FF,#E0EEFF)', color: '#185FA5', borderRadius: 10, cursor: 'pointer', fontSize: 12, textAlign: 'center', fontWeight: 600, border: '1px solid #B5D4F4' }}>
            📷 Image (auto)
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => analyzeImage(manual.id, e.target.files[0])} />
          </label>
          <label style={{ flex: 1, padding: '9px', background: 'linear-gradient(135deg,#FFF7ED,#FFEEDD)', color: '#E67E22', borderRadius: 10, cursor: 'pointer', fontSize: 12, textAlign: 'center', fontWeight: 600, border: '1px solid #FAC775' }}>
            🎥 Vidéo
            <input type="file" accept="video/*" style={{ display: 'none' }} onChange={e => analyzeVideo(manual.id, e.target.files[0])} />
          </label>
        </div>

        {/* Bouton mode étape par étape */}
        <button
          onClick={() => {
            const newMode = !stepByStepMode[manual.id]
            setStepByStepMode(s => ({ ...s, [manual.id]: newMode }))
            if (newMode) {
              setSuggestions([])
              setSelectedManual(null)
              setStepByStepSteps(s => ({ ...s, [manual.id]: [] }))
            }
          }}
          style={{ width: '100%', padding: '9px', background: stepByStepMode[manual.id] ? 'linear-gradient(135deg,#E8F5E9,#C8E6C9)' : 'linear-gradient(135deg,#F3E5F5,#E1BEE7)', color: stepByStepMode[manual.id] ? '#2E7D32' : '#6A1B9A', border: stepByStepMode[manual.id] ? '1px solid #A5D6A7' : '1px solid #CE93D8', borderRadius: 10, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
          📸 {stepByStepMode[manual.id] ? '✅ Mode étape par étape actif' : 'Étape par étape (capture → étape)'}
        </button>
      </div>

      {/* Interface mode étape par étape */}
      {stepByStepMode[manual.id] && (
        <div style={{ marginTop: 12, background: '#F3E5F5', borderRadius: 12, padding: 14, border: '1.5px solid #CE93D8' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#6A1B9A', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            📸 Mode étape par étape
            <span style={{ marginLeft: 'auto', background: '#6A1B9A', color: '#fff', borderRadius: 10, fontSize: 11, padding: '2px 8px' }}>
              {(stepByStepSteps[manual.id] || []).length} étape(s)
            </span>
          </div>

          {/* Liste des étapes accumulées */}
          {(stepByStepSteps[manual.id] || []).map((step, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 10, padding: '12px 14px', marginBottom: 8, border: '1px solid #E1BEE7', borderLeft: '3px solid #6A1B9A' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 6 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#6A1B9A' }}>Étape {i + 1} — {step.title}</div>
                <button onClick={() => removeStepByStep(manual.id, i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E74C3C', fontSize: 14, flexShrink: 0, marginLeft: 8 }}>✕</button>
              </div>
              <div style={{ fontSize: 12, color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{step.description}</div>
            </div>
          ))}

          {/* Loader IA */}
          {stepByStepLoading[manual.id] && (
            <div style={{ textAlign: 'center', padding: '10px', color: '#6A1B9A', fontSize: 12, background: '#EDE7F6', borderRadius: 8, marginBottom: 8 }}>
              ⏳ L'IA analyse la capture…
            </div>
          )}

          {/* Bouton ajouter une capture */}
          <label style={{ display: 'block', width: '100%', padding: '10px', background: '#fff', color: '#6A1B9A', border: '2px dashed #CE93D8', borderRadius: 10, cursor: 'pointer', fontSize: 12, textAlign: 'center', fontWeight: 600, marginBottom: 8, boxSizing: 'border-box' }}>
            📷 Ajouter une capture → une étape
            <input type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => { if (e.target.files[0]) analyzeImageSingleStep(manual.id, e.target.files[0]); e.target.value = '' }} />
          </label>

          {/* Sauvegarder */}
          {(stepByStepSteps[manual.id] || []).length > 0 && (
            <button onClick={() => saveStepByStepSteps(manual.id)}
              style={{ width: '100%', padding: '10px', background: '#2E7D32', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
              💾 Sauvegarder les {(stepByStepSteps[manual.id] || []).length} étapes
            </button>
          )}
        </div>
      )}

      {selectedManual === manual.id && loading && (
        <div style={{ textAlign: 'center', padding: '14px', color: '#8E44AD', fontSize: 13, marginTop: 8, background: '#F5F0FF', borderRadius: 10 }}>⏳ L'IA génère les étapes...</div>
      )}
      {selectedManual === manual.id && error && (
        <div style={{ padding: '12px', color: '#E74C3C', fontSize: 13, marginTop: 8, background: '#FFF5F5', borderRadius: 10, border: '1px solid #FECACA' }}>❌ {error}</div>
      )}
      {selectedManual === manual.id && suggestions.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#0C2340' }}>📋 {suggestions.length} étapes générées :</div>
            <button onClick={() => saveSteps(manual.id)} style={{ padding: '6px 14px', background: '#27AE60', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
              💾 Sauvegarder
            </button>
          </div>
          {suggestions.map((step, i) => (
            <div key={i} style={{ background: '#F8FAFF', padding: '14px 16px', borderRadius: 10, marginBottom: 10, border: '1px solid #E2EEF9', borderLeft: '3px solid #185FA5' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#185FA5', marginBottom: 8 }}>{i + 1}. {step.title}</div>
              <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.8, marginBottom: step.quiz ? 10 : 0, whiteSpace: 'pre-wrap' }}>{step.description}</div>
              {step.quiz && (
                <div style={{ background: '#F5F0FF', borderRadius: 8, padding: '8px 12px', marginTop: 6, border: '1px solid #E0D4F7', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#8E44AD' }}>🧠 {step.quiz.question}</div>
                  <span style={{ fontSize: 10, background: '#8E44AD', color: '#fff', borderRadius: 10, padding: '2px 8px', marginLeft: 8, flexShrink: 0 }}>{step.quiz.points} pts</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const SectionManuels = () => (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#0C2340' }}>Mes manuels</div>
          <div style={{ fontSize: 14, color: '#94A3B8', marginTop: 4 }}>{manuals.length} manuel{manuals.length !== 1 ? 's' : ''} au total</div>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} style={{ padding: '11px 22px', background: 'linear-gradient(135deg,#185FA5,#378ADD)', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 600, boxShadow: '0 4px 12px rgba(24,95,165,0.3)' }}>
          + Nouveau manuel
        </button>
      </div>

      {showCreate && (
        <div style={{ background: '#fff', border: '1px solid #EEF2F7', borderRadius: 14, padding: 24, marginBottom: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0C2340', marginBottom: 16 }}>Créer un nouveau manuel</h3>

          <input
            style={{ width: '100%', padding: '11px 14px', marginBottom: 12, borderRadius: 10, border: '1.5px solid #E2EEF9', fontSize: 14, boxSizing: 'border-box', outline: 'none', color: '#334155' }}
            placeholder="Titre du manuel"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <textarea
            style={{ width: '100%', padding: '11px 14px', marginBottom: 12, borderRadius: 10, border: '1.5px solid #E2EEF9', fontSize: 14, boxSizing: 'border-box', outline: 'none', color: '#334155', resize: 'vertical', minHeight: 80, fontFamily: 'inherit', lineHeight: 1.6 }}
            placeholder="Description (optionnel)"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={createManual}
              disabled={loading}
              style={{ padding: '10px 24px', background: loading ? '#94A3B8' : 'linear-gradient(135deg,#185FA5,#378ADD)', color: '#fff', border: 'none', borderRadius: 10, cursor: loading ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 600 }}>
              {loading ? '⏳ Chargement...' : 'Créer'}
            </button>
            <button onClick={() => setShowCreate(false)} style={{ padding: '10px 24px', background: '#F8FAFC', color: '#64748B', border: '1.5px solid #E2E8F0', borderRadius: 10, cursor: 'pointer', fontSize: 14 }}>
              Annuler
            </button>
          </div>
        </div>
      )}

      {manuals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#94A3B8', background: '#fff', borderRadius: 14, border: '1px solid #EEF2F7' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
          <div style={{ fontSize: 15 }}>Aucun manuel — créez-en un !</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {manuals.map(manual => <React.Fragment key={manual.id}>{ManualCard({ manual })}</React.Fragment>)}
        </div>
      )}
    </>
  )

  // ── SECTION ARCHIVES ─────────────────────────────────────────────────
  const SectionArchives = () => (
    <>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#0C2340' }}>Mes archives</div>
        <div style={{ fontSize: 14, color: '#94A3B8', marginTop: 4 }}>Les manuels supprimés sont conservés ici. Restaurez-les ou supprimez-les définitivement.</div>
      </div>

      {loadingArchive ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#94A3B8' }}>⏳ Chargement...</div>
      ) : archivedManuals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#94A3B8', background: '#fff', borderRadius: 14, border: '1px solid #EEF2F7' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🗂</div>
          <div style={{ fontSize: 15 }}>Aucune archive pour le moment</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {archivedManuals.map(manual => (
            <div key={manual.id} style={{ background: '#fff', border: '1px solid #EEF2F7', borderRadius: 14, padding: 20, display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ width: 44, height: 44, background: '#F8FAFC', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>📄</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#64748B', marginBottom: 2 }}>{manual.title}</div>
                <div style={{ fontSize: 13, color: '#94A3B8' }}>{manual.description || 'Aucune description'}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button onClick={() => restoreManual(manual.id)} style={{ padding: '8px 16px', background: '#F0FFF4', color: '#27AE60', border: '1px solid #BBF7D0', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                  ↩ Restaurer
                </button>
                <button onClick={() => permanentDelete(manual)} style={{ padding: '8px 16px', background: '#FFF5F5', color: '#E74C3C', border: '1px solid #FECACA', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                  🗑 Supprimer définitivement
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )

  // ── SECTION COMPTE ───────────────────────────────────────────────────
  const SectionCompte = () => (
    <>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#0C2340' }}>Mon compte</div>
        <div style={{ fontSize: 14, color: '#94A3B8', marginTop: 4 }}>Informations de votre profil DocuSense</div>
      </div>

      <div style={{ background: '#fff', borderRadius: 14, padding: 28, border: '1px solid #EEF2F7', maxWidth: 600 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid #F0F4F8' }}>
          <div style={{ width: 60, height: 60, background: 'linear-gradient(135deg,#185FA5,#378ADD)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 24, fontWeight: 800 }}>
            {(userInfo.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#0C2340' }}>{userInfo.name || '—'}</div>
            <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 2 }}>{userInfo.role === 'developer' ? '🛠️ Développeur' : '👤 Utilisateur final'}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {[
            { label: 'Nom complet', value: userInfo.name || '—', icon: '👤' },
            { label: 'Email', value: userInfo.email || sessionStorage.getItem('email') || '—', icon: '📧' },
            { label: 'Rôle', value: userInfo.role === 'developer' ? 'Développeur' : 'Utilisateur final', icon: '🏷' },
            { label: 'Plateforme', value: 'DocuSense v1.0', icon: '🚀' },
            { label: 'Manuels créés', value: manuals.length, icon: '📚' },
            { label: 'Manuels publiés', value: manuals.filter(m => m.isPublished).length, icon: '✅' },
          ].map(item => (
            <div key={item.label} style={{ background: '#F8FAFF', borderRadius: 10, padding: 16 }}>
              <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 4 }}>{item.icon} {item.label}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#185FA5' }}>{item.value}</div>
            </div>
          ))}
        </div>

        <button onClick={logout} style={{ marginTop: 24, padding: '10px 24px', background: '#FFF5F5', color: '#E74C3C', border: '1px solid #FECACA', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
          🚪 Se déconnecter
        </button>
      </div>
    </>
  )

  return (
    <div className="page-layout" style={{ display: 'flex', height: '100vh', background: '#F8FAFF', fontFamily: 'Inter, Arial, sans-serif' }}>
      <div className="mobile-topbar">
        <button className="hamburger-btn" onClick={() => setMenuOpen(o => !o)}>
          <span /><span /><span />
        </button>
        <span className="logo-text">Docu<span style={{ color: '#185FA5' }}>Sense</span></span>
        <div style={{ width: 34 }} />
      </div>
      <div className={`sidebar-overlay${menuOpen ? ' open' : ''}`} onClick={() => setMenuOpen(false)} />
      {Sidebar()}

      <div className="main-content" style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
        {activeSection === 'dashboard' && SectionDashboard()}
        {activeSection === 'manuels' && SectionManuels()}
        {activeSection === 'archives' && SectionArchives()}
        {activeSection === 'compte' && SectionCompte()}
      </div>

      {toast && (
        <div style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 2000, padding: '14px 22px', background: toast.type === 'error' ? '#E74C3C' : '#27AE60', color: '#fff', borderRadius: 12, fontSize: 14, fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.18)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>{toast.type === 'error' ? '❌' : '✅'}</span> {toast.msg}
        </div>
      )}
    </div>
  )
}

export default Dashboard
