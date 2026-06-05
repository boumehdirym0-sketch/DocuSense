import React, { useState, useEffect } from 'react'
import API from '../services/api'
import { useNavigate } from 'react-router-dom'
import { generateCertificate } from '../services/pdfUtils'

const renderDescription = (text) => {
  if (!text) return null
  return text.split('\n').map((line, i) => {
    if (!line.trim()) return <div key={i} style={{ height: 8 }} />

    // Ligne ⚠️ ou ✅
    const isNote = line.startsWith('⚠️')
    const isResult = line.startsWith('✅')

    // Remplace **texte** par <strong>
    const parts = line.split(/\*\*(.*?)\*\*/g).map((part, j) =>
      j % 2 === 1 ? <strong key={j}>{part}</strong> : part
    )

    if (isNote) return (
      <div key={i} style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 8, padding: '8px 12px', margin: '8px 0', fontSize: 13, color: '#92400E' }}>{parts}</div>
    )
    if (isResult) return (
      <div key={i} style={{ background: '#F0FFF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '8px 12px', margin: '8px 0', fontSize: 13, color: '#166534' }}>{parts}</div>
    )
    // Ligne numérotée 1. 2. 3.
    if (/^\d+\./.test(line)) return (
      <div key={i} style={{ display: 'flex', gap: 10, padding: '4px 0', fontSize: 14, color: '#334155' }}>
        <span style={{ color: '#185FA5', fontWeight: 700, minWidth: 20 }}>{line.match(/^\d+/)[0]}.</span>
        <span>{parts}</span>
      </div>
    )
    // Titre de section (Comment faire :, Description :)
    if (line.endsWith(':') || line.includes('faire :') || line.includes('Description')) return (
      <div key={i} style={{ fontWeight: 700, color: '#0C2340', marginTop: 12, marginBottom: 4, fontSize: 14 }}>{parts}</div>
    )
    return <div key={i} style={{ fontSize: 14, color: '#334155', lineHeight: 1.7 }}>{parts}</div>
  })
}

const EndUser = () => {
  const [manuals, setManuals] = useState([])
  const [selected, setSelected] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [sortOrder, setSortOrder] = useState('recent')
  const [currentStep, setCurrentStep] = useState(0)
  const [quizAnswer, setQuizAnswer] = useState('')
  const [quizResult, setQuizResult] = useState(null)
  const [score, setScore] = useState(0)
  const [badges, setBadges] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [userName, setUserName] = useState(localStorage.getItem('name') || '')
  const navigate = useNavigate()

  useEffect(() => {
    fetchManuals()
    fetchLeaderboard()
    if (!localStorage.getItem('name')) {
      API.get('/auth/me').then(({ data }) => {
        localStorage.setItem('name', data.name)
        localStorage.setItem('role', data.role)
        setUserName(data.name)
      }).catch(() => {})
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchManuals = async () => {
    try {
      const { data } = await API.get('/manuals/published')
      setManuals(data)
    } catch (err) {
      if (err.response?.status === 401) navigate('/login')
    }
  }

  const fetchLeaderboard = async () => {
    try {
      const { data } = await API.get('/quiz/leaderboard')
      setLeaderboard(data)
    } catch (err) {}
  }

  const openManual = (manual) => {
    setSelected(manual)
    setCurrentStep(0)
    setQuizAnswer('')
    setQuizResult(null)
  }

  const submitQuiz = async (quiz) => {
    try {
      const { data } = await API.post('/quiz/submit', {
        quizId: quiz.id,
        answer: quizAnswer,
        manualId: selected.id
      })
      setQuizResult(data)
      setScore(data.totalScore)
      setBadges(data.badges)
      fetchLeaderboard()
    } catch (err) { console.error(err) }
  }

  const logout = () => {
    localStorage.clear()
    navigate('/', { replace: true })
  }

  const badgeColor = { bronze: '#CD7F32', silver: '#A8A9AD', gold: '#FFD700' }
  const badgeIcon = { bronze: '🥉', silver: '🥈', gold: '🥇' }

  const steps = selected?.Steps || []
  const currentQuiz = steps[currentStep]?.Quiz || null
  const quizOptions = currentQuiz
    ? (Array.isArray(currentQuiz.options) ? currentQuiz.options : (() => { try { return JSON.parse(currentQuiz.options) } catch { return [] } })())
    : []

  return (
    <div className="page-layout" style={{display:'flex', height:'100vh', fontFamily:'Inter, Arial, sans-serif', background:'#F8FAFF'}}>
      <div className="mobile-topbar">
        <button className="hamburger-btn" onClick={() => setMenuOpen(o => !o)}>
          <span /><span /><span />
        </button>
        <span className="logo-text">Docu<span style={{color:'#185FA5'}}>Sense</span></span>
        <div style={{width:34}} />
      </div>
      <div className={`sidebar-overlay${menuOpen ? ' open' : ''}`} onClick={() => setMenuOpen(false)} />

      {/* SIDEBAR */}
      <div className={`sidebar${menuOpen ? ' open' : ''}`} style={{width:230, background:'#fff', borderRight:'1px solid #EEF2F7', padding:'24px 16px', display:'flex', flexDirection:'column', gap:4}}>
        <div onClick={() => { setSelected(null); setMenuOpen(false) }} style={{display:'flex', alignItems:'center', gap:10, marginBottom:16, cursor:'pointer'}}>
          <div style={{width:34, height:34, background:'linear-gradient(135deg,#185FA5,#378ADD)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:14, fontWeight:800}}>DS</div>
          <span style={{fontSize:18, fontWeight:800, color:'#0C447C'}}>Docu<span style={{color:'#185FA5'}}>Sense</span></span>
        </div>
        <div style={{padding:'10px 12px', background:'#F8FAFF', borderRadius:10, marginBottom:16}}>
          <div style={{fontSize:11, color:'#94A3B8'}}>Connecté en tant que</div>
          <div style={{fontSize:13, fontWeight:600, color:'#0C2340', marginTop:2}}>{userName || 'Utilisateur'}</div>
        </div>

        <div style={{fontSize:10, fontWeight:600, color:'#94A3B8', letterSpacing:1.5, padding:'0 8px', margin:'8px 0 4px'}}>MENU</div>

        <div onClick={() => setSelected(null)} style={{display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10, cursor:'pointer', background: !selected ? '#EFF6FF' : 'transparent', color: !selected ? '#185FA5' : '#64748B', fontSize:14, fontWeight: !selected ? 600 : 400}}>
          <span>📚</span> Manuels disponibles
        </div>
        <div style={{display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10, color:'#64748B', fontSize:14}}>
          <span>🏆</span> Score : <strong style={{color:'#185FA5'}}>{score} pts</strong>
        </div>

        {badges.length > 0 && (
          <div style={{padding:'10px 12px'}}>
            <div style={{fontSize:11, color:'#94A3B8', marginBottom:6}}>MES BADGES</div>
            <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
              {badges.map(b => (
                <span key={b} style={{fontSize:18}}>{badgeIcon[b]}</span>
              ))}
            </div>
          </div>
        )}

        <div onClick={logout} style={{display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10, cursor:'pointer', color:'#E74C3C', fontSize:14, marginTop:'auto', background:'#FFF5F5'}}>
          <span>🚪</span> Déconnexion
        </div>
      </div>

      {/* MAIN */}
      <div className="main-content" style={{flex:1, padding:'28px 32px', overflowY:'auto'}}>

        {/* LISTE DES MANUELS */}
        {!selected && (
          <>
            <div style={{fontSize:24, fontWeight:700, color:'#0C2340', marginBottom:4}}>Manuels disponibles</div>
            <div style={{fontSize:14, color:'#94A3B8', marginBottom:20}}>Sélectionne un manuel pour commencer l'apprentissage</div>

            {/* BARRE DE RECHERCHE ET FILTRES */}
            <div style={{display:'flex', gap:10, marginBottom:24, flexWrap:'wrap', background:'#fff', borderRadius:12, padding:16, border:'1px solid #E2E8F0', boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}}>
              <input
                type="text"
                placeholder="🔍 Rechercher par nom..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoComplete="new-password"
                name="search-manual"
                style={{flex:1, minWidth:180, padding:'10px 14px', borderRadius:8, border:'1.5px solid #CBD5E1', fontSize:14, outline:'none', background:'#F8FAFF', color:'#0C2340'}}
              />
              <select
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value)}
                style={{padding:'10px 14px', borderRadius:8, border:'1.5px solid #CBD5E1', fontSize:14, background:'#F8FAFF', color:'#0C2340', cursor:'pointer', outline:'none', fontWeight:500}}
              >
                <option value="recent">📅 Plus récent</option>
                <option value="oldest">📅 Plus ancien</option>
                <option value="az">🔤 A → Z</option>
                <option value="za">🔤 Z → A</option>
              </select>
            </div>

            {(() => {
              const filtered = manuals
                .filter(m => m.title.toLowerCase().includes(search.toLowerCase()))
                .sort((a, b) => {
                  if (sortOrder === 'az') return a.title.localeCompare(b.title)
                  if (sortOrder === 'za') return b.title.localeCompare(a.title)
                  if (sortOrder === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt)
                  return new Date(b.createdAt) - new Date(a.createdAt)
                })

              return filtered.length === 0 ? (
              <div style={{textAlign:'center', padding:'60px', color:'#94A3B8', background:'#fff', borderRadius:14, border:'1px solid #EEF2F7'}}>
                <div style={{fontSize:40, marginBottom:12}}>📭</div>
                <div style={{fontSize:15}}>{manuals.length === 0 ? 'Aucun manuel publié pour l\'instant' : 'Aucun résultat pour cette recherche'}</div>
              </div>
            ) : (
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:16}}>
                {filtered.map(m => (
                  <div key={m.id} onClick={() => openManual(m)} style={{background:'#fff', borderRadius:14, padding:24, cursor:'pointer', border:'1px solid #EEF2F7', boxShadow:'0 2px 8px rgba(0,0,0,0.04)', transition:'all 0.2s'}}>
                    <div style={{width:44, height:44, background:'linear-gradient(135deg,#EFF6FF,#E0EEFF)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, marginBottom:14}}>📖</div>
                    <div style={{fontSize:15, fontWeight:600, color:'#0C2340', marginBottom:6}}>{m.title}</div>
                    <div style={{fontSize:13, color:'#94A3B8', marginBottom:14, lineHeight:1.5}}>{m.description}</div>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                      <span style={{fontSize:12, color:'#64748B'}}>{(m.Steps || []).length} étapes</span>
                      <span style={{fontSize:12, background:'#F0FFF4', color:'#27AE60', padding:'4px 10px', borderRadius:20, fontWeight:500}}>✅ Publié</span>
                    </div>
                  </div>
                ))}
              </div>
            )
            })()}

            {/* LEADERBOARD */}
            {leaderboard.length > 0 && (
              <div style={{marginTop:32, background:'#fff', borderRadius:14, padding:24, border:'1px solid #EEF2F7'}}>
                <div style={{fontSize:16, fontWeight:600, color:'#0C2340', marginBottom:16}}>🏆 Classement</div>
                {leaderboard.map((e, i) => (
                  <div key={i} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 12px', background: i===0 ? '#FAEEDA' : '#F8FAFF', borderRadius:8, marginBottom:6}}>
                    <span style={{color:'#0C2340', fontWeight:600}}>{i===0?'🥇':i===1?'🥈':i===2?'🥉':'#'+(i+1)} {e.User?.name || 'Utilisateur'}</span>
                    <span style={{color:'#185FA5', fontWeight:700}}>{e.score} pts</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* VUE MANUEL */}
        {selected && (
          <>
            <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:24}}>
              <button onClick={() => setSelected(null)} style={{padding:'8px 16px', background:'#EFF6FF', color:'#185FA5', border:'none', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:600}}>
                ← Retour
              </button>
              <div>
                <div style={{fontSize:20, fontWeight:700, color:'#0C2340'}}>{selected.title}</div>
                <div style={{fontSize:13, color:'#94A3B8'}}>{selected.description}</div>
              </div>
            </div>

            {/* PROGRESSION */}
            {steps.length > 0 && (
              <div style={{background:'#fff', borderRadius:10, padding:'12px 16px', marginBottom:20, border:'1px solid #EEF2F7', display:'flex', alignItems:'center', gap:12}}>
                <div style={{flex:1, height:8, background:'#EEF2F7', borderRadius:4, overflow:'hidden'}}>
                  <div style={{height:'100%', width:`${((currentStep+1)/steps.length)*100}%`, background:'linear-gradient(90deg,#185FA5,#378ADD)', borderRadius:4, transition:'width 0.3s'}} />
                </div>
                <span style={{fontSize:12, color:'#64748B', whiteSpace:'nowrap'}}>{currentStep+1} / {steps.length}</span>
              </div>
            )}

            {/* ETAPES */}
            {steps.length === 0 ? (
              <div style={{textAlign:'center', padding:40, color:'#94A3B8', background:'#fff', borderRadius:14}}>
                Ce manuel n'a pas encore d'étapes.
              </div>
            ) : (
              <div style={{background:'#fff', borderRadius:14, padding:28, border:'1px solid #EEF2F7', marginBottom:20}}>
                <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:16}}>
                  <div style={{width:32, height:32, borderRadius:8, background:'#185FA5', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:14, fontWeight:700}}>{currentStep+1}</div>
                  <div style={{fontSize:16, fontWeight:600, color:'#0C2340'}}>{steps[currentStep]?.title}</div>
                </div>
                <div style={{fontSize:14, color:'#334155', lineHeight:1.9}}>{renderDescription(steps[currentStep]?.description)}</div>

                <div style={{display:'flex', gap:10, marginTop:24}}>
                  <button onClick={() => { setCurrentStep(s => s-1); setQuizAnswer(''); setQuizResult(null) }} disabled={currentStep===0} style={{padding:'10px 20px', background: currentStep===0 ? '#F8FAFC' : '#EFF6FF', color: currentStep===0 ? '#94A3B8' : '#185FA5', border:'none', borderRadius:8, cursor: currentStep===0 ? 'not-allowed' : 'pointer', fontSize:13, fontWeight:600}}>
                    ← Précédent
                  </button>
                  <button onClick={() => { setCurrentStep(s => s+1); setQuizAnswer(''); setQuizResult(null) }} disabled={currentStep===steps.length-1} style={{padding:'10px 20px', background: currentStep===steps.length-1 ? '#F8FAFC' : '#185FA5', color: currentStep===steps.length-1 ? '#94A3B8' : '#fff', border:'none', borderRadius:8, cursor: currentStep===steps.length-1 ? 'not-allowed' : 'pointer', fontSize:13, fontWeight:600}}>
                    Suivant →
                  </button>
                </div>

                {currentStep === steps.length - 1 && (
                  <div style={{marginTop:20, padding:20, background:'linear-gradient(135deg,#F0FFF4,#DCFCE7)', borderRadius:12, border:'1px solid #BBF7D0', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12}}>
                    <div>
                      <div style={{fontSize:15, fontWeight:700, color:'#166534'}}>🎉 Manuel terminé !</div>
                      <div style={{fontSize:13, color:'#15803D', marginTop:2}}>Tu as parcouru toutes les étapes. Score : <strong>{score} pts</strong></div>
                    </div>
                    <button onClick={() => generateCertificate(userName || 'Utilisateur', selected.title, score, badges)} style={{padding:'10px 22px', background:'linear-gradient(135deg,#185FA5,#378ADD)', color:'#fff', border:'none', borderRadius:10, cursor:'pointer', fontSize:13, fontWeight:700, boxShadow:'0 4px 12px rgba(24,95,165,0.35)', whiteSpace:'nowrap'}}>
                      🏆 Télécharger mon certificat
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* QUIZ DE L'ETAPE */}
            {currentQuiz ? (
              <div style={{background:'#F5F0FF', borderRadius:14, padding:24, border:'1px solid #C39BD3', marginTop:4}}>
                <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:16}}>
                  <div style={{background:'#8E44AD', color:'#fff', borderRadius:8, padding:'4px 12px', fontSize:12, fontWeight:700}}>🧠 QUIZ</div>
                  <div style={{fontSize:13, color:'#8E44AD', fontWeight:600}}>Validez votre compréhension pour gagner des points</div>
                </div>

                <div style={{fontSize:15, fontWeight:600, color:'#0C2340', marginBottom:16, lineHeight:1.5}}>{currentQuiz.question}</div>

                <div style={{display:'flex', flexDirection:'column', gap:10, marginBottom:16}}>
                  {quizOptions.map((opt, i) => {
                    const letters = ['A', 'B', 'C', 'D']
                    const isSelected = quizAnswer === opt
                    const isCorrectRevealed = quizResult && opt === currentQuiz.correctAnswer
                    const isWrongSelected = quizResult && isSelected && !quizResult.isCorrect
                    return (
                      <button
                        key={i}
                        onClick={() => { if (!quizResult) setQuizAnswer(opt) }}
                        style={{
                          display:'flex', alignItems:'center', gap:12,
                          padding:'12px 16px', borderRadius:10, textAlign:'left',
                          cursor: quizResult ? 'default' : 'pointer',
                          border: isCorrectRevealed ? '2px solid #27AE60' : isWrongSelected ? '2px solid #E74C3C' : isSelected ? '2px solid #8E44AD' : '1.5px solid #E2EEF9',
                          background: isCorrectRevealed ? '#F0FFF4' : isWrongSelected ? '#FFF5F5' : isSelected ? '#F5F0FF' : '#fff',
                          color: isCorrectRevealed ? '#166534' : isWrongSelected ? '#E74C3C' : isSelected ? '#8E44AD' : '#334155',
                          fontWeight: isSelected || isCorrectRevealed ? 600 : 400,
                          fontSize:13, transition:'all 0.15s'
                        }}
                      >
                        <span style={{width:26, height:26, borderRadius:6, background: isCorrectRevealed ? '#27AE60' : isWrongSelected ? '#E74C3C' : isSelected ? '#8E44AD' : '#E2E8F0', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, flexShrink:0}}>
                          {letters[i]}
                        </span>
                        <span style={{flex:1}}>{opt}</span>
                        {isCorrectRevealed && <span>✅</span>}
                        {isWrongSelected && <span>❌</span>}
                      </button>
                    )
                  })}
                </div>

                {!quizResult && (
                  <button
                    onClick={() => submitQuiz(currentQuiz)}
                    disabled={!quizAnswer}
                    style={{padding:'11px 32px', background: quizAnswer ? 'linear-gradient(135deg,#8E44AD,#A855F7)' : '#E2E8F0', color: quizAnswer ? '#fff' : '#94A3B8', border:'none', borderRadius:10, cursor: quizAnswer ? 'pointer' : 'not-allowed', fontSize:14, fontWeight:700, boxShadow: quizAnswer ? '0 4px 12px rgba(142,68,173,0.35)' : 'none', transition:'all 0.2s'}}
                  >
                    Valider ma réponse →
                  </button>
                )}

                {quizResult && (
                  <div style={{marginTop:12, padding:16, borderRadius:10, background: quizResult.isCorrect ? '#F0FFF4' : '#FFF5F5', border:`1px solid ${quizResult.isCorrect ? '#BBF7D0' : '#FECACA'}`}}>
                    <div style={{fontSize:16, fontWeight:700, color: quizResult.isCorrect ? '#27AE60' : '#E74C3C', marginBottom:6}}>
                      {quizResult.isCorrect ? '🎯 Bonne réponse !' : '❌ Mauvaise réponse'}
                    </div>
                    {!quizResult.isCorrect && (
                      <div style={{fontSize:13, color:'#64748B', marginBottom:6}}>La bonne réponse était : <strong style={{color:'#27AE60'}}>{currentQuiz.correctAnswer}</strong></div>
                    )}
                    <div style={{fontSize:13, color:'#334155', marginBottom:12}}>+{quizResult.pointsEarned} pts — Score total : <strong style={{color:'#185FA5'}}>{quizResult.totalScore} pts</strong></div>
                    {quizResult.badges?.map(b => (
                      <span key={b} style={{display:'inline-block', marginBottom:12, padding:'5px 14px', background:badgeColor[b], color:'#fff', borderRadius:20, fontSize:12, fontWeight:700, marginRight:6}}>
                        {badgeIcon[b]} Badge {b.charAt(0).toUpperCase()+b.slice(1)} débloqué !
                      </span>
                    ))}
                    <div style={{display:'flex', gap:10, marginTop:4}}>
                      <button onClick={() => { setCurrentStep(s => s-1); setQuizAnswer(''); setQuizResult(null) }} disabled={currentStep===0} style={{padding:'10px 20px', background: currentStep===0 ? '#F8FAFC' : '#EFF6FF', color: currentStep===0 ? '#94A3B8' : '#185FA5', border:'none', borderRadius:8, cursor: currentStep===0 ? 'not-allowed' : 'pointer', fontSize:13, fontWeight:600}}>
                        ← Précédent
                      </button>
                      <button onClick={() => { setCurrentStep(s => s+1); setQuizAnswer(''); setQuizResult(null) }} disabled={currentStep===steps.length-1} style={{padding:'10px 20px', background: currentStep===steps.length-1 ? '#F8FAFC' : '#185FA5', color: currentStep===steps.length-1 ? '#94A3B8' : '#fff', border:'none', borderRadius:8, cursor: currentStep===steps.length-1 ? 'not-allowed' : 'pointer', fontSize:13, fontWeight:600}}>
                        Suivant →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : steps.length > 0 && (
              <div style={{padding:'14px 18px', background:'#FFFBEB', borderRadius:10, border:'1px solid #FDE68A', color:'#92400E', fontSize:13}}>
                ⚠️ Ce manuel a été créé avant la génération automatique de quiz. Régénérez et sauvegardez les étapes depuis le dashboard pour activer les quiz.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default EndUser
