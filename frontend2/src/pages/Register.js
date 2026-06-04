import React, { useState, useEffect } from 'react'
import API from '../services/api'
import { useNavigate } from 'react-router-dom'

const Register = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('developer')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedRole = localStorage.getItem('role')
    if (token) {
      navigate(savedRole === 'admin' ? '/admin' : savedRole === 'enduser' ? '/enduser' : '/dashboard', { replace: true })
    }
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const { data } = await API.post('/auth/register', { name, email, password, role })
      localStorage.setItem('token', data.token)
      localStorage.setItem('role', data.role)
      localStorage.setItem('name', data.name)
      localStorage.setItem('email', data.email)
      navigate(data.role === 'enduser' ? '/enduser' : '/dashboard', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription')
    }
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