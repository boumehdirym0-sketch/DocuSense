import React, { useState, useEffect } from 'react'
import API from '../services/api'
import { useNavigate } from 'react-router-dom'

const Login = () => {
  const [selectedRole, setSelectedRole] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()


  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await API.post('/auth/login', { email, password })

      if (selectedRole && data.role !== selectedRole) {
        const label = selectedRole === 'developer' ? 'développeur' : 'utilisateur'
        setError(`Ce compte n'est pas un compte ${label}. Vérifiez le portail sélectionné.`)
        setLoading(false)
        return
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('role', data.role)
      localStorage.setItem('name', data.name)
      localStorage.setItem('email', data.email)
      navigate(data.role === 'admin' ? '/admin' : data.role === 'enduser' ? '/enduser' : '/dashboard', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const roleConfig = {
    developer: { label: 'Développeur', icon: '🛠️', color: '#185FA5', bg: '#EFF6FF', border: '#185FA5', desc: 'Créez et gérez des manuels' },
    enduser: { label: 'Utilisateur', icon: '👤', color: '#8E44AD', bg: '#F5F0FF', border: '#8E44AD', desc: 'Consultez les manuels' },
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#E6F1FB', fontFamily: 'Inter, Arial, sans-serif', padding: 20 }}>
      <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', width: '100%', maxWidth: '420px' }}>

        <h1 style={{ textAlign: 'center', fontSize: '28px', fontWeight: 800, color: '#0C447C', marginBottom: 4, marginTop: 0 }}>
          Docu<span style={{ color: '#185FA5' }}>Sense</span>
        </h1>
        <p style={{ textAlign: 'center', fontSize: 13, color: '#94A3B8', marginBottom: 24, marginTop: 0 }}>Connectez-vous à votre espace</p>

        {/* Sélection du rôle */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Je suis :</div>
          <div style={{ display: 'flex', gap: 10 }}>
            {Object.entries(roleConfig).map(([key, cfg]) => (
              <div key={key} onClick={() => setSelectedRole(selectedRole === key ? null : key)}
                style={{ flex: 1, padding: '12px 10px', borderRadius: 10, border: selectedRole === key ? `2px solid ${cfg.border}` : '1.5px solid #E2E8F0', background: selectedRole === key ? cfg.bg : '#fff', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{cfg.icon}</div>
                <div style={{ fontSize: 13, fontWeight: selectedRole === key ? 700 : 500, color: selectedRole === key ? cfg.color : '#64748B' }}>{cfg.label}</div>
                <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>{cfg.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div style={{
            background: error.includes('attente') ? '#FFF7ED' : '#FFF5F5',
            border: `1px solid ${error.includes('attente') ? '#FAD7A0' : '#FECACA'}`,
            borderRadius: 8, padding: '10px 14px', marginBottom: 16,
            color: error.includes('attente') ? '#92400E' : '#E74C3C',
            fontSize: 13
          }}>
            {error.includes('attente') && '⏳ '}{error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            style={{ width: '100%', padding: '12px 14px', marginBottom: 12, borderRadius: 10, border: '1.5px solid #E2EEF9', fontSize: 14, boxSizing: 'border-box', outline: 'none', color: '#334155' }}
            type="email"
            placeholder="Adresse email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            style={{ width: '100%', padding: '12px 14px', marginBottom: 20, borderRadius: 10, border: '1.5px solid #E2EEF9', fontSize: 14, boxSizing: 'border-box', outline: 'none', color: '#334155' }}
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '13px', background: loading ? '#94A3B8' : selectedRole === 'enduser' ? 'linear-gradient(135deg,#8E44AD,#A855F7)' : 'linear-gradient(135deg,#185FA5,#378ADD)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(24,95,165,0.25)', marginBottom: 20 }}>
            {loading ? '⏳ Connexion...' : selectedRole === 'enduser' ? '👤 Se connecter en tant qu\'utilisateur' : selectedRole === 'developer' ? '🛠️ Se connecter en tant que développeur' : 'Se connecter'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#64748B', margin: 0 }}>
          Pas de compte ? <a href="/register" style={{ color: '#185FA5', fontWeight: 600 }}>S'inscrire</a>
        </p>
      </div>
    </div>
  )
}

export default Login
