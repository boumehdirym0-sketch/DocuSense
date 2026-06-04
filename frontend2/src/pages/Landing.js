import React from 'react'
import { useNavigate } from 'react-router-dom'

const Landing = () => {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) {
      const top = el.getBoundingClientRect().top + window.pageYOffset - 70
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  return (
    <div style={{fontFamily:'Inter, Arial, sans-serif', margin:0, padding:0}}>

      {/* NAVBAR */}
      <nav style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 24px', background:'#fff', borderBottom:'1px solid #F0F4F8', position:'sticky', top:0, zIndex:100, flexWrap:'wrap', gap:10}}>
        <div style={{fontSize:22, fontWeight:800, color:'#0C447C'}}>
          Docu<span style={{color:'#185FA5'}}>Sense</span>
        </div>
        <div className="landing-nav-links" style={{display:'flex', gap:28}}>
          {[
            {label:'Fonctionnalités', id:'fonctionnalites'},
            {label:'Tarifs', id:'tarifs'},
            {label:'Documentation', id:'documentation'},
            {label:'À propos', id:'apropos'},
          ].map(l => (
            <span key={l.label} onClick={() => scrollTo(l.id)} style={{color:'#64748B', fontSize:14, cursor:'pointer'}}>
              {l.label}
            </span>
          ))}
        </div>
        <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
          {token ? (
            <button onClick={() => navigate(role === 'enduser' ? '/enduser' : '/dashboard')} style={{padding:'9px 16px', background:'linear-gradient(135deg,#185FA5,#378ADD)', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:600}}>
              Tableau de bord →
            </button>
          ) : (
            <>
              <button onClick={() => navigate('/login')} style={{padding:'9px 16px', background:'#fff', color:'#185FA5', border:'1.5px solid #185FA5', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:500}}>
                Connexion
              </button>
              <button onClick={() => navigate('/register')} style={{padding:'9px 16px', background:'#185FA5', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:600}}>
                Commencer
              </button>
            </>
          )}
        </div>
      </nav>

      {/* HERO */}
      <div style={{background:'linear-gradient(135deg,#0C2340 0%,#185FA5 60%,#8E44AD 100%)', padding:'80px 24px', textAlign:'center'}}>
        <div style={{display:'inline-flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.15)', borderRadius:20, padding:'6px 16px', marginBottom:24}}>
          <span style={{fontSize:13, color:'#fff', fontWeight:500}}>✨ Propulsé par Groq AI</span>
        </div>
        <h1 style={{fontSize:'clamp(28px, 6vw, 52px)', fontWeight:800, color:'#fff', marginBottom:20, lineHeight:1.2}}>
          Documentez vos apps<br/>
          <span style={{color:'#7EC8E3'}}>avec l'intelligence artificielle</span>
        </h1>
        <p style={{color:'rgba(255,255,255,0.8)', fontSize:18, maxWidth:600, margin:'0 auto 40px'}}>
          DocuSense génère automatiquement des manuels utilisateurs interactifs à partir de vos captures d'écran, vidéos ou descriptions.
        </p>
        <div style={{display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap'}}>
          <button onClick={() => navigate('/register')} style={{padding:'16px 40px', background:'#fff', color:'#185FA5', border:'none', borderRadius:10, cursor:'pointer', fontSize:16, fontWeight:700, boxShadow:'0 4px 20px rgba(0,0,0,0.2)'}}>
            Commencer gratuitement →
          </button>
          <button onClick={() => scrollTo('fonctionnalites')} style={{padding:'16px 40px', background:'transparent', color:'#fff', border:'2px solid rgba(255,255,255,0.5)', borderRadius:10, cursor:'pointer', fontSize:16, fontWeight:500}}>
            Voir les fonctionnalités
          </button>
        </div>
        <div style={{display:'flex', justifyContent:'center', gap:48, marginTop:60, flexWrap:'wrap'}}>
          {[
            {value:'3 rôles', label:'Développeur, Utilisateur, Admin'},
            {value:'Groq AI', label:'Génération automatique'},
            {value:'Quiz', label:'Gamification intégrée'},
          ].map(s => (
            <div key={s.label} style={{textAlign:'center'}}>
              <div style={{fontSize:24, fontWeight:700, color:'#fff'}}>{s.value}</div>
              <div style={{fontSize:13, color:'rgba(255,255,255,0.7)', marginTop:4}}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FONCTIONNALITÉS */}
      <div id="fonctionnalites" style={{padding:'60px 24px', background:'#fff'}}>
        <div style={{textAlign:'center', marginBottom:48}}>
          <h2 style={{fontSize:34, fontWeight:700, color:'#0C2340', marginBottom:12}}>Tout ce dont vous avez besoin</h2>
          <p style={{color:'#64748B', fontSize:15, maxWidth:560, margin:'0 auto'}}>
            De la création à la publication, DocuSense couvre tout le cycle de vie de votre documentation.
          </p>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:24}}>
          {[
            {icon:'🤖', title:'IA générative Groq', desc:'Génère des étapes de documentation complètes et structurées à partir d\'une simple description textuelle.'},
            {icon:'📷', title:'Analyse de captures', desc:'Uploadez une capture d\'écran et l\'IA identifie automatiquement les éléments de l\'interface pour créer les étapes.'},
            {icon:'🎥', title:'Analyse vidéo', desc:'Importez une vidéo de démonstration — DocuSense en extrait les étapes clés automatiquement.'},
            {icon:'📸', title:'Mode étape par étape', desc:'Une capture = une étape. Construisez votre manuel progressivement, capture après capture.'},
            {icon:'🧠', title:'Quiz interactifs', desc:'Chaque étape est accompagnée d\'un quiz pour valider la compréhension de l\'utilisateur.'},
            {icon:'🏆', title:'Gamification', desc:'Points, badges et classement pour motiver les utilisateurs à apprendre et progresser.'},
            {icon:'📄', title:'Export PDF', desc:'Exportez votre manuel en PDF professionnel et générez des certificats de complétion.'},
            {icon:'👑', title:'Dashboard Admin', desc:'Gérez les utilisateurs, supervisez les manuels publiés et suivez les statistiques de la plateforme.'},
          ].map(f => (
            <div key={f.title} style={{background:'#F8FAFF', borderRadius:14, padding:24, border:'1px solid #EEF2F7'}}>
              <div style={{fontSize:32, marginBottom:14}}>{f.icon}</div>
              <div style={{fontSize:15, fontWeight:600, color:'#0C2340', marginBottom:8}}>{f.title}</div>
              <div style={{fontSize:13, color:'#64748B', lineHeight:1.6}}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TARIFS */}
      <div id="tarifs" style={{padding:'60px 24px', background:'#F8FAFF', textAlign:'center'}}>
        <h2 style={{fontSize:34, fontWeight:700, color:'#0C2340', marginBottom:12}}>Simple et gratuit</h2>
        <p style={{color:'#64748B', fontSize:15, marginBottom:48}}>DocuSense est un projet académique — accès complet et gratuit.</p>
        <div style={{display:'inline-block', background:'#fff', borderRadius:16, padding:'32px 24px', border:'2px solid #185FA5', boxShadow:'0 8px 32px rgba(24,95,165,0.12)', maxWidth:'100%', width:'100%', boxSizing:'border-box'}}>
          <div style={{fontSize:48, fontWeight:800, color:'#185FA5', marginBottom:8}}>Gratuit</div>
          <div style={{fontSize:14, color:'#64748B', marginBottom:24}}>Accès complet à toutes les fonctionnalités</div>
          {[
            'Création illimitée de manuels',
            'Génération IA par description',
            'Analyse d\'images et vidéos',
            'Quiz et gamification',
            'Export PDF & certificats',
            'Dashboard administrateur',
          ].map(f => (
            <div key={f} style={{display:'flex', alignItems:'center', gap:10, marginBottom:10, textAlign:'left'}}>
              <span style={{color:'#27AE60', fontWeight:700}}>✓</span>
              <span style={{fontSize:14, color:'#334155'}}>{f}</span>
            </div>
          ))}
          <button onClick={() => navigate('/register')} style={{marginTop:24, width:'100%', padding:'13px', background:'linear-gradient(135deg,#185FA5,#378ADD)', color:'#fff', border:'none', borderRadius:10, cursor:'pointer', fontSize:15, fontWeight:700}}>
            Commencer maintenant →
          </button>
        </div>
      </div>

      {/* DOCUMENTATION */}
      <div id="documentation" style={{padding:'60px 24px', background:'#fff'}}>
        <div style={{textAlign:'center', marginBottom:48}}>
          <h2 style={{fontSize:34, fontWeight:700, color:'#0C2340', marginBottom:12}}>Comment ça marche ?</h2>
          <p style={{color:'#64748B', fontSize:15}}>En 3 étapes simples, votre manuel est prêt.</p>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:24, maxWidth:900, margin:'0 auto'}}>
          {[
            {num:'1', title:'Créez un manuel', desc:'Donnez un titre à votre manuel et choisissez votre méthode de génération : description textuelle, image ou vidéo.'},
            {num:'2', title:'L\'IA génère les étapes', desc:'Groq AI analyse votre contenu et génère automatiquement des étapes structurées avec quiz intégrés.'},
            {num:'3', title:'Publiez et partagez', desc:'Publiez votre manuel en un clic. Vos utilisateurs finaux peuvent y accéder, apprendre et gagner des points.'},
          ].map(s => (
            <div key={s.num} style={{textAlign:'center'}}>
              <div style={{width:56, height:56, background:'linear-gradient(135deg,#185FA5,#378ADD)', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:22, fontWeight:800, margin:'0 auto 16px'}}>
                {s.num}
              </div>
              <div style={{fontSize:16, fontWeight:600, color:'#0C2340', marginBottom:8}}>{s.title}</div>
              <div style={{fontSize:13, color:'#64748B', lineHeight:1.6}}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* À PROPOS */}
      <div id="apropos" style={{background:'#F8FAFF', padding:'60px 24px', textAlign:'center'}}>
        <h2 style={{fontSize:34, fontWeight:700, color:'#0C2340', marginBottom:12}}>À propos</h2>
        <p style={{color:'#64748B', fontSize:15, lineHeight:1.8, maxWidth:640, margin:'0 auto 32px'}}>
          DocuSense est un projet PFE réalisé par <strong>Boumehdi Rym</strong>, étudiante en Licence Informatique à l'<strong>IFAG</strong>, sous la direction de <strong>Mr Abbas</strong>.
          Notre mission : rendre la création de documentation logicielle accessible à tous grâce à l'IA générative.
        </p>
        <div style={{display:'flex', justifyContent:'center', gap:40, flexWrap:'wrap'}}>
          {[
            {label:'Étudiante', value:'Boumehdi Rym'},
            {label:'Encadrant', value:'Mr Abbas'},
            {label:'Formation', value:'Licence Informatique — IFAG'},
            {label:'Année', value:'2025–2026'},
            {label:'Technologie', value:'Groq AI'},
          ].map(i => (
            <div key={i.label} style={{textAlign:'center'}}>
              <div style={{fontSize:20, fontWeight:700, color:'#185FA5'}}>{i.value}</div>
              <div style={{fontSize:13, color:'#64748B'}}>{i.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{background:'linear-gradient(135deg,#185FA5,#8E44AD)', padding:'60px 24px', textAlign:'center'}}>
        <h2 style={{fontSize:'clamp(24px, 5vw, 38px)', fontWeight:700, color:'#fff', marginBottom:14}}>Prêt à révolutionner votre documentation ?</h2>
        <p style={{color:'rgba(255,255,255,0.8)', fontSize:15, marginBottom:40}}>Rejoignez les développeurs qui font confiance à DocuSense</p>
        <button onClick={() => navigate('/register')} style={{padding:'16px 48px', background:'#fff', color:'#185FA5', border:'none', borderRadius:10, cursor:'pointer', fontSize:16, fontWeight:700, boxShadow:'0 4px 20px rgba(0,0,0,0.15)'}}>
          Commencer gratuitement →
        </button>
      </div>

    </div>
  )
}

export default Landing
