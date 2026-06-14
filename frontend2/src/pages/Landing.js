import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Landing = () => {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })
  const [contactSent, setContactSent] = useState(false)

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) {
      const top = el.getBoundingClientRect().top + window.pageYOffset - 70
      window.scrollTo({ top, behavior: 'smooth' })
    }
    setMobileNavOpen(false)
  }

  const handleContact = (e) => {
    e.preventDefault()
    const subject = encodeURIComponent(`Message de ${contactForm.name} via DocuSense`)
    const body = encodeURIComponent(`Nom : ${contactForm.name}\nEmail : ${contactForm.email}\n\nMessage :\n${contactForm.message}`)
    window.open(`mailto:docusense9@gmail.com?subject=${subject}&body=${body}`)
    setContactSent(true)
    setContactForm({ name: '', email: '', message: '' })
    setTimeout(() => setContactSent(false), 4000)
  }

  const navLinks = [
    {label:'Fonctionnalités', id:'fonctionnalites'},
    {label:'Documentation', id:'documentation'},
    {label:'À propos', id:'apropos'},
    {label:'Contact', id:'contact'},
  ]

  return (
    <div style={{fontFamily:'Inter, Arial, sans-serif', margin:0, padding:0}}>

      {/* NAVBAR */}
      <nav style={{background:'#fff', borderBottom:'1px solid #F0F4F8', position:'sticky', top:0, zIndex:100}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 24px'}}>
          <div style={{fontSize:22, fontWeight:800, color:'#0C447C'}}>
            Docu<span style={{color:'#185FA5'}}>Sense</span>
          </div>

          {/* Liens desktop */}
          <div className="landing-nav-links" style={{display:'flex', gap:28}}>
            {navLinks.map(l => (
              <span key={l.label} onClick={() => scrollTo(l.id)} style={{color:'#64748B', fontSize:14, cursor:'pointer'}}>
                {l.label}
              </span>
            ))}
          </div>

          <div style={{display:'flex', alignItems:'center', gap:8}}>
            {token ? (
              <button onClick={() => navigate(role === 'enduser' ? '/enduser' : '/dashboard')} style={{padding:'9px 16px', background:'linear-gradient(135deg,#185FA5,#378ADD)', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:600}}>
                Tableau de bord →
              </button>
            ) : (
              <>
                <button onClick={() => navigate('/login')} style={{padding:'9px 14px', background:'#fff', color:'#185FA5', border:'1.5px solid #185FA5', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:500}}>
                  Connexion
                </button>
                <button onClick={() => navigate('/register')} style={{padding:'9px 14px', background:'#185FA5', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:600}}>
                  Commencer
                </button>
              </>
            )}
            {/* Hamburger mobile */}
            <button className="hamburger-btn" onClick={() => setMobileNavOpen(o => !o)} style={{marginLeft:4}}>
              <span /><span /><span />
            </button>
          </div>
        </div>

        {/* Menu mobile déroulant */}
        {mobileNavOpen && (
          <div style={{borderTop:'1px solid #F0F4F8', background:'#fff', padding:'8px 0'}}>
            {navLinks.map(l => (
              <div key={l.label} onClick={() => scrollTo(l.id)}
                style={{padding:'12px 24px', fontSize:15, color:'#334155', cursor:'pointer', fontWeight:500}}>
                {l.label}
              </div>
            ))}
          </div>
        )}
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
        <h2 style={{fontSize:34, fontWeight:700, color:'#0C2340', marginBottom:12}}>100% Gratuit</h2>
        <p style={{color:'#64748B', fontSize:15, marginBottom:48}}>DocuSense vous offre un accès complet à toutes ses fonctionnalités, sans frais.</p>
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
        <h2 style={{fontSize:34, fontWeight:700, color:'#0C2340', marginBottom:12}}>À propos de DocuSense</h2>
        <p style={{color:'#64748B', fontSize:15, lineHeight:1.8, maxWidth:640, margin:'0 auto 48px'}}>
          DocuSense est une solution intelligente de génération de documentation logicielle propulsée par l'IA générative.
          Notre mission : permettre à chaque développeur de créer des manuels utilisateurs professionnels en quelques secondes,
          sans effort de rédaction.
        </p>

        {/* Partenaires */}
        <div style={{marginBottom:48}}>
          <div style={{fontSize:13, fontWeight:600, color:'#94A3B8', letterSpacing:2, marginBottom:24}}>NOS PARTENAIRES</div>
          <div style={{display:'flex', justifyContent:'center', gap:48, flexWrap:'wrap', alignItems:'center'}}>
            <div style={{background:'#fff', borderRadius:14, padding:'20px 32px', border:'1px solid #EEF2F7', boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
              <div style={{fontSize:20, fontWeight:800, color:'#185FA5'}}>IFAG</div>
              <div style={{fontSize:12, color:'#64748B', marginTop:4}}>Institut de Formation en<br/>Administration et Gestion</div>
            </div>
            <div style={{background:'#fff', borderRadius:14, padding:'20px 32px', border:'1px solid #EEF2F7', boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
              <div style={{fontSize:20, fontWeight:800, color:'#8E44AD'}}>ESI</div>
              <div style={{fontSize:12, color:'#64748B', marginTop:4}}>École Supérieure<br/>d'Informatique</div>
            </div>
            <div style={{background:'#fff', borderRadius:14, padding:'20px 32px', border:'1px solid #EEF2F7', boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
              <div style={{fontSize:20, fontWeight:800, color:'#27AE60'}}>Groq AI</div>
              <div style={{fontSize:12, color:'#64748B', marginTop:4}}>Moteur d'inférence<br/>LLaMA</div>
            </div>
          </div>
        </div>

        <div style={{display:'flex', justifyContent:'center', gap:40, flexWrap:'wrap'}}>
          {[
            {label:'Technologie IA', value:'Groq + LLaMA'},
            {label:'Disponibilité', value:'100% en ligne'},
            {label:'Langues', value:'Français'},
            {label:'Accès', value:'Gratuit'},
          ].map(i => (
            <div key={i.label} style={{textAlign:'center'}}>
              <div style={{fontSize:20, fontWeight:700, color:'#185FA5'}}>{i.value}</div>
              <div style={{fontSize:13, color:'#64748B'}}>{i.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CONTACT */}
      <div id="contact" style={{padding:'60px 24px', background:'#fff'}}>
        <div style={{textAlign:'center', marginBottom:40}}>
          <h2 style={{fontSize:34, fontWeight:700, color:'#0C2340', marginBottom:12}}>Nous contacter</h2>
          <p style={{color:'#64748B', fontSize:15}}>Une question, une suggestion ? Écrivez-nous.</p>
        </div>
        {/* Coordonnées */}
        <div style={{display:'flex', justifyContent:'center', gap:24, flexWrap:'wrap', marginBottom:40}}>
          <a href="mailto:docusense9@gmail.com" style={{display:'flex', alignItems:'center', gap:12, background:'#F8FAFF', borderRadius:12, padding:'16px 24px', border:'1px solid #EEF2F7', textDecoration:'none'}}>
            <div style={{width:40, height:40, background:'linear-gradient(135deg,#185FA5,#378ADD)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18}}>📧</div>
            <div>
              <div style={{fontSize:11, color:'#94A3B8', fontWeight:600}}>EMAIL</div>
              <div style={{fontSize:14, fontWeight:600, color:'#0C2340'}}>docusense9@gmail.com</div>
            </div>
          </a>
          <a href="tel:0791244909" style={{display:'flex', alignItems:'center', gap:12, background:'#F8FAFF', borderRadius:12, padding:'16px 24px', border:'1px solid #EEF2F7', textDecoration:'none'}}>
            <div style={{width:40, height:40, background:'linear-gradient(135deg,#27AE60,#2ECC71)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18}}>📞</div>
            <div>
              <div style={{fontSize:11, color:'#94A3B8', fontWeight:600}}>TÉLÉPHONE</div>
              <div style={{fontSize:14, fontWeight:600, color:'#0C2340'}}>07 91 24 49 09</div>
            </div>
          </a>
        </div>

        <div style={{maxWidth:560, margin:'0 auto', background:'#F8FAFF', borderRadius:16, padding:32, border:'1px solid #EEF2F7'}}>
          {contactSent ? (
            <div style={{textAlign:'center', padding:'32px 0'}}>
              <div style={{fontSize:40, marginBottom:12}}>✅</div>
              <div style={{fontSize:16, fontWeight:600, color:'#27AE60'}}>Message envoyé !</div>
              <div style={{fontSize:13, color:'#64748B', marginTop:8}}>Nous vous répondrons dans les plus brefs délais.</div>
            </div>
          ) : (
            <form onSubmit={handleContact} style={{display:'flex', flexDirection:'column', gap:16}}>
              <input
                type="text" required placeholder="Votre nom"
                value={contactForm.name}
                onChange={e => setContactForm(f => ({...f, name: e.target.value}))}
                style={{padding:'12px 16px', borderRadius:8, border:'1.5px solid #E2E8F0', fontSize:14, outline:'none', background:'#fff'}}
              />
              <input
                type="email" required placeholder="Votre email"
                value={contactForm.email}
                onChange={e => setContactForm(f => ({...f, email: e.target.value}))}
                style={{padding:'12px 16px', borderRadius:8, border:'1.5px solid #E2E8F0', fontSize:14, outline:'none', background:'#fff'}}
              />
              <textarea
                required placeholder="Votre message..." rows={5}
                value={contactForm.message}
                onChange={e => setContactForm(f => ({...f, message: e.target.value}))}
                style={{padding:'12px 16px', borderRadius:8, border:'1.5px solid #E2E8F0', fontSize:14, outline:'none', resize:'vertical', background:'#fff', fontFamily:'inherit'}}
              />
              <button type="submit" style={{padding:'13px', background:'linear-gradient(135deg,#185FA5,#378ADD)', color:'#fff', border:'none', borderRadius:10, cursor:'pointer', fontSize:15, fontWeight:700}}>
                Envoyer le message →
              </button>
            </form>
          )}
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
