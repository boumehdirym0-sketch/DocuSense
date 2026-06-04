import React, { useState, useEffect } from 'react'
import API from '../services/api'
import { useNavigate } from 'react-router-dom'

const SAMPLE_QUIZ = {
  id: null,
  question: 'Quel est le rôle principal de DocuSense ?',
  options: [
    'Gérer des projets',
    'Générer automatiquement des manuels interactifs',
    'Envoyer des emails',
    'Créer des présentations'
  ],
  correctAnswer: 'Générer automatiquement des manuels interactifs',
  points: 10
}

const Quiz = () => {
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [question, setQuestion] = useState(SAMPLE_QUIZ.question)
  const [options, setOptions] = useState(SAMPLE_QUIZ.options)
  const [correctAnswer, setCorrectAnswer] = useState(SAMPLE_QUIZ.correctAnswer)
  const [points, setPoints] = useState(10)
  const [manualId, setManualId] = useState(1)
  const [, setManuals] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [quizId, setQuizId] = useState(null)
  const navigate = useNavigate()

  useEffect(() => { fetchLeaderboard(); fetchManuals() }, [])

  const fetchManuals = async () => {
    try {
      const { data } = await API.get('/manuals')
      setManuals(data)
      if (data.length > 0) setManualId(data[0].id)
    } catch (err) {}
  }

  const fetchLeaderboard = async () => {
    try {
      const { data } = await API.get('/quiz/leaderboard')
      setLeaderboard(data)
    } catch (err) {}
  }

  const createAndPlayQuiz = async () => {
    try {
      const opts = options.filter(o => o.trim() !== '')
      const { data } = await API.post('/quiz/create', {
        question, options: opts, correctAnswer, points,
        stepId: null
      })
      setQuizId(data.id)
      setShowCreate(false)
      setResult(null)
      setAnswer('')
    } catch (err) { console.error(err) }
  }

  const submitAnswer = async () => {
    if (!answer || !quizId) return
    try {
      const { data } = await API.post('/quiz/submit', {
        quizId, answer, manualId
      })
      setResult(data)
      fetchLeaderboard()
    } catch (err) { console.error(err) }
  }

  const badgeColor = { bronze: '#CD7F32', silver: '#C0C0C0', gold: '#FFD700' }
  const badgeIcon = { bronze: '🥉', silver: '🥈', gold: '🥇' }
  const badgePoints = { bronze: 50, silver: 100, gold: 200 }

  return (
    <div className="page-layout" style={{display:'flex', height:'100vh', fontFamily:'Inter, Arial, sans-serif'}}>

      {/* SIDEBAR */}
      <div className="sidebar" style={{width:230, background:'#fff', borderRight:'1px solid #EEF2F7', padding:'24px 16px', display:'flex', flexDirection:'column', gap:4}}>
        <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:32, padding:'0 8px'}}>
          <div style={{width:34, height:34, background:'linear-gradient(135deg,#185FA5,#378ADD)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:14, fontWeight:800}}>DS</div>
          <span style={{fontSize:18, fontWeight:800, color:'#0C447C'}}>Docu<span style={{color:'#185FA5'}}>Sense</span></span>
        </div>
        <div onClick={() => navigate('/dashboard')} style={{display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10, cursor:'pointer', color:'#64748B', fontSize:14}}>
          <span>📊</span> Dashboard
        </div>
        <div style={{display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10, background:'#EFF6FF', color:'#185FA5', fontSize:14, fontWeight:600}}>
          <span>🏆</span> Gamification
        </div>
        <div onClick={() => { localStorage.clear(); navigate('/', { replace: true }) }} style={{display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10, cursor:'pointer', color:'#E74C3C', fontSize:14, marginTop:'auto', background:'#FFF5F5'}}>
          <span>🚪</span> Déconnexion
        </div>
      </div>

      {/* MAIN */}
      <div className="main-content" style={{flex:1, padding:'28px 32px', background:'#F8FAFF', overflowY:'auto'}}>
        <div style={{fontSize:24, fontWeight:700, color:'#0C2340', marginBottom:4}}>Gamification</div>
        <div style={{fontSize:14, color:'#94A3B8', marginBottom:28}}>Quiz, badges et classement</div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20}}>

          {/* BADGES */}
          <div style={{background:'#fff', borderRadius:14, padding:24, border:'1px solid #EEF2F7'}}>
            <div style={{fontSize:16, fontWeight:600, color:'#0C2340', marginBottom:16}}>🎖️ Badges disponibles</div>
            <div style={{display:'flex', gap:16}}>
              {['bronze','silver','gold'].map(b => (
                <div key={b} style={{textAlign:'center', padding:'16px 20px', background:badgeColor[b], borderRadius:12, color:'#fff', flex:1}}>
                  <div style={{fontSize:32}}>{badgeIcon[b]}</div>
                  <div style={{fontSize:13, fontWeight:600, marginTop:8, textTransform:'capitalize'}}>{b}</div>
                  <div style={{fontSize:11, opacity:0.9}}>{badgePoints[b]} pts</div>
                </div>
              ))}
            </div>
          </div>

          {/* CLASSEMENT */}
          <div style={{background:'#fff', borderRadius:14, padding:24, border:'1px solid #EEF2F7'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
              <div style={{fontSize:16, fontWeight:600, color:'#0C2340'}}>🏆 Classement</div>
              <button onClick={fetchLeaderboard} style={{padding:'6px 14px', background:'#EFF6FF', color:'#185FA5', border:'none', borderRadius:8, cursor:'pointer', fontSize:12, fontWeight:600}}>Actualiser</button>
            </div>
            {leaderboard.length === 0 ? (
              <div style={{color:'#94A3B8', fontSize:13, textAlign:'center', padding:20}}>Aucun score pour l'instant</div>
            ) : leaderboard.map((e, i) => (
              <div key={i} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 12px', background:i===0?'#FAEEDA':'#F8FAFF', borderRadius:8, marginBottom:6, border:'1px solid #F0F4F8'}}>
                <span style={{color:'#0C2340', fontWeight:600}}>{i===0?'🥇':i===1?'🥈':i===2?'🥉':'#'+(i+1)} {e.User?.name || 'Utilisateur'}</span>
                <span style={{color:'#185FA5', fontWeight:700}}>{e.score} pts</span>
              </div>
            ))}
          </div>
        </div>

        {/* QUIZ */}
        <div style={{background:'#fff', borderRadius:14, padding:24, border:'1px solid #EEF2F7'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20}}>
            <div style={{fontSize:16, fontWeight:600, color:'#0C2340'}}>🧠 Quiz interactif</div>
            <button onClick={() => { setShowCreate(!showCreate); setResult(null); setQuizId(null) }} style={{padding:'8px 18px', background:'linear-gradient(135deg,#185FA5,#378ADD)', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:600}}>
              {showCreate ? 'Annuler' : '+ Créer un quiz'}
            </button>
          </div>

          {showCreate && (
            <div style={{background:'#F8FAFF', borderRadius:12, padding:20, marginBottom:20, border:'1px solid #E2EEF9'}}>
              <div style={{fontSize:14, fontWeight:600, color:'#0C2340', marginBottom:12}}>Nouvelle question</div>
              <input value={question} onChange={e => setQuestion(e.target.value)} placeholder="Question..."
                style={{width:'100%', padding:'10px 12px', borderRadius:8, border:'1.5px solid #E2EEF9', fontSize:13, marginBottom:10, boxSizing:'border-box'}} />
              {options.map((opt, i) => (
                <input key={i} value={opt} onChange={e => { const o=[...options]; o[i]=e.target.value; setOptions(o) }} placeholder={`Option ${i+1}`}
                  style={{width:'100%', padding:'9px 12px', borderRadius:8, border:'1.5px solid #E2EEF9', fontSize:13, marginBottom:8, boxSizing:'border-box'}} />
              ))}
              <input value={correctAnswer} onChange={e => setCorrectAnswer(e.target.value)} placeholder="Bonne réponse (exactement comme ci-dessus)"
                style={{width:'100%', padding:'9px 12px', borderRadius:8, border:'1.5px solid #27AE60', fontSize:13, marginBottom:10, boxSizing:'border-box'}} />
              <div style={{display:'flex', gap:10, alignItems:'center', marginBottom:10}}>
                <span style={{fontSize:13, color:'#64748B'}}>Points :</span>
                <input type="number" value={points} onChange={e => setPoints(Number(e.target.value))} style={{width:80, padding:'8px', borderRadius:8, border:'1.5px solid #E2EEF9', fontSize:13}} />
              </div>
              <button onClick={createAndPlayQuiz} style={{padding:'10px 24px', background:'#185FA5', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:600}}>
                Valider le quiz
              </button>
            </div>
          )}

          {quizId && !result && (
            <div style={{background:'#F5F0FF', borderRadius:12, padding:20, border:'1px solid #C39BD3'}}>
              <div style={{fontSize:15, fontWeight:600, color:'#0C2340', marginBottom:16}}>{question}</div>
              <div style={{display:'flex', flexDirection:'column', gap:8, marginBottom:16}}>
                {options.filter(o => o.trim()).map((opt, i) => (
                  <button key={i} onClick={() => setAnswer(opt)} style={{padding:'12px 16px', borderRadius:8, border: answer===opt ? '2px solid #8E44AD' : '1.5px solid #E2EEF9', background: answer===opt ? '#F5F0FF' : '#fff', color: answer===opt ? '#8E44AD' : '#334155', fontSize:14, cursor:'pointer', textAlign:'left', fontWeight: answer===opt ? 600 : 400}}>
                    {opt}
                  </button>
                ))}
              </div>
              <button onClick={submitAnswer} disabled={!answer} style={{padding:'11px 32px', background: answer ? '#8E44AD' : '#E2E8F0', color: answer ? '#fff' : '#94A3B8', border:'none', borderRadius:8, cursor: answer ? 'pointer' : 'not-allowed', fontSize:14, fontWeight:600}}>
                Valider ma réponse
              </button>
            </div>
          )}

          {result && (
            <div style={{background: result.isCorrect ? '#F0FFF4' : '#FFF5F5', borderRadius:12, padding:24, border: `1px solid ${result.isCorrect ? '#BBF7D0' : '#FECACA'}`}}>
              <div style={{fontSize:20, fontWeight:700, color: result.isCorrect ? '#27AE60' : '#E74C3C', marginBottom:8}}>
                {result.isCorrect ? '✅ Bonne réponse !' : '❌ Mauvaise réponse'}
              </div>
              <div style={{fontSize:14, color:'#334155', marginBottom:4}}>Points gagnés : <strong style={{color:'#185FA5'}}>{result.pointsEarned} pts</strong></div>
              <div style={{fontSize:14, color:'#334155', marginBottom: result.badges?.length ? 12 : 0}}>Score total : <strong style={{color:'#185FA5'}}>{result.totalScore} pts</strong></div>
              {result.badges?.length > 0 && (
                <div style={{display:'flex', gap:8, flexWrap:'wrap', marginTop:8}}>
                  {result.badges.map(b => (
                    <span key={b} style={{padding:'6px 14px', background:badgeColor[b], color:'#fff', borderRadius:20, fontSize:13, fontWeight:600}}>
                      {badgeIcon[b]} {b.charAt(0).toUpperCase()+b.slice(1)} débloqué !
                    </span>
                  ))}
                </div>
              )}
              <button onClick={() => { setResult(null); setQuizId(null); setAnswer('') }} style={{marginTop:16, padding:'9px 20px', background:'#185FA5', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:600}}>
                Nouveau quiz
              </button>
            </div>
          )}

          {!showCreate && !quizId && !result && (
            <div style={{textAlign:'center', padding:'32px', color:'#94A3B8', fontSize:14}}>
              Crée un quiz pour tester tes connaissances et gagner des points
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Quiz
