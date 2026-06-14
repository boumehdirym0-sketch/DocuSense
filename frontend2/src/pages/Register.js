import React, { useState, useEffect } from 'react'
import API from '../services/api'
import { useNavigate } from 'react-router-dom'

const Register = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('developer')
  const [error, setError] = useState('')
  const [registered, setRegistered] = useState(false)
  const [approved, setApproved] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedRole = localStorage.getItem('role')
    if (token) {
      navigate(savedRole === 'admin' ? '/admin' : savedRole === 'enduser' ? '/enduser' : '/dashboard', { replace: true })
    }
  }, [navigate])

  useEffect(() => {
    if (!registered || approved) return
    const interval = setInterval(async () => {
      try {
        const { data } = await API.get(`/auth/status?email=${encodeURIComponent(registeredEmail)}`)
        if (data.status === 'active') {
          setApproved(true)
          clearInterval(interval)
          setTimeout(() => navigate('/login', { replace: true }), 3000)
        }
      } catch (e) {}
    }, 4000)
    return () => clearInterval(interval)
  }, [registered, approved, registeredEmail, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await API.post('/auth/register', { name, email, password, role })
      setRegisteredEmail(email)
      setRegistered(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription')
    }
  }

  if (registered) {
    if (approved) {
      return (
        <div style={styles.container}>
          <div style={styles.card}>
            <h1 style={styles.logo}>Docu<span style={styles.logoBlue}>Sense</span></h1>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>🎉</div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#166534', marginBottom: 12 }}>Inscription validée !</h2>
              <div style={{ background: '#F0FFF4', border: '1px solid #BBF7D0', borderRadius: 12, padding: '16px 20px', marginBottom: 20, color: '#166534', fontSize: 14, lineHeight: 1.6 }}>
                Votre inscription a été approuvée. Bienvenu(e) sur DocuSense !<br />
                Redirection vers la page de connexion...
              </div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.logo}>Docu<span style={styles.logoBlue}>Sense</span></h1>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>⏳</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0C2340', marginBottom: 12 }}>Inscription envoyée !</h2>
            <div style={{ background: '#FFF7ED', border: '1px solid #FAD7A0', borderRadius: 12, padding: '16px 20px', marginBottom: 20, color: '#92400E', fontSize: 14, lineHeight: 1.6 }}>
              Votre compte est en attente de validation par un administrateur.<br />
              Vous serez automatiquement redirigé(e) dès l'approbation.
            </div>
            <a href="/login" style={{ color: '#185FA5', fontWeight: 600, fontSize: 14 }}>Retour à la connexion</a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.logo}>Docu<span style={styles.logoBlue}>Sense</span></h1>
        <h2 style={styles.title}>Créer un compte</h2>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            style={styles.input}
            type="text"
            placeholder="Nom complet"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            style={styles.input}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div style={{marginBottom:16}}>
            <div style={{fontSize:13, color:'#64748B', marginBottom:8}}>Je suis :</div>
            <div style={{display:'flex', gap:10}}>
              <div onClick={() => setRole('developer')} style={{flex:1, padding:'10px', borderRadius:8, border: role==='developer' ? '2px solid #185FA5' : '1px solid #B5D4F4', background: role==='developer' ? '#EFF6FF' : '#fff', cursor:'pointer', textAlign:'center', fontSize:13, fontWeight: role==='developer' ? 600 : 400, color: role==='developer' ? '#185FA5' : '#64748B'}}>
                🛠️ Développeur
              </div>
              <div onClick={() => setRole('enduser')} style={{flex:1, padding:'10px', borderRadius:8, border: role==='enduser' ? '2px solid #8E44AD' : '1px solid #B5D4F4', background: role==='enduser' ? '#F5F0FF' : '#fff', cursor:'pointer', textAlign:'center', fontSize:13, fontWeight: role==='enduser' ? 600 : 400, color: role==='enduser' ? '#8E44AD' : '#64748B'}}>
                👤 Utilisateur
              </div>
            </div>
          </div>
          <button style={styles.button} type="submit">
            S'inscrire
          </button>
        </form>
        <p style={styles.link}>
          Déjà un compte ? <a href="/login">Se connecter</a>
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#E6F1FB',
  },
  card: {
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    width: '380px',
  },
  logo: {
    textAlign: 'center',
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#0C447C',
    marginBottom: '8px',
  },
  logoBlue: {
    color: '#185FA5',
  },
  title: {
    textAlign: 'center',
    color: '#2C3E50',
    marginBottom: '24px',
    fontSize: '20px',
  },
  input: {
    width: '100%',
    padding: '12px',
    marginBottom: '16px',
    borderRadius: '8px',
    border: '1px solid #B5D4F4',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#185FA5',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: '12px',
  },
  link: {
    textAlign: 'center',
    marginTop: '16px',
    fontSize: '14px',
  }
}

export default Register