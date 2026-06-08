import jsPDF from 'jspdf'

const BLUE_DARK  = [12, 35, 64]
const BLUE_MID   = [24, 95, 165]
const BLUE_LIGHT = [56, 122, 221]
const PURPLE     = [142, 68, 173]
const GRAY_TEXT  = [51, 65, 85]
const GRAY_LIGHT = [148, 163, 184]
const WHITE      = [255, 255, 255]
const BG         = [248, 250, 255]

const rgb = (doc, color) => doc.setFillColor(...color)
const textColor = (doc, color) => doc.setTextColor(...color)
const drawColor = (doc, color) => doc.setDrawColor(...color)

const addHeader = (doc, W, manualTitle, stepIndex, totalSteps) => {
  rgb(doc, BLUE_DARK); doc.rect(0, 0, W, 20, 'F')
  rgb(doc, BLUE_MID);  doc.rect(0, 0, 4, 20, 'F')
  textColor(doc, WHITE)
  doc.setFontSize(8); doc.setFont('helvetica', 'bold')
  doc.text('DocuSense', 12, 13)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  const shortened = manualTitle.length > 55 ? manualTitle.substring(0, 55) + '...' : manualTitle
  doc.text('— ' + shortened, 38, 13)
  doc.text(`Étape ${stepIndex + 1} / ${totalSteps}`, W - 14, 13, { align: 'right' })
}

const addFooter = (doc, W, H, pageNum) => {
  rgb(doc, BG); doc.rect(0, H - 14, W, 14, 'F')
  drawColor(doc, [226, 232, 240]); doc.setLineWidth(0.3)
  doc.line(14, H - 14, W - 14, H - 14)
  textColor(doc, GRAY_LIGHT)
  doc.setFontSize(7.5); doc.setFont('helvetica', 'normal')
  doc.text('DocuSense © 2026 — Plateforme de documentation intelligente', 14, H - 5)
  doc.text(`Page ${pageNum}`, W - 14, H - 5, { align: 'right' })
}

export const exportManualToPDF = (manual, steps) => {
  const doc = new jsPDF()
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()

  // ── COVER PAGE ──────────────────────────────────────────────────
  rgb(doc, BLUE_DARK); doc.rect(0, 0, W, H, 'F')

  // Accent stripe
  rgb(doc, BLUE_MID); doc.rect(0, H * 0.58, W, H * 0.42, 'F')
  rgb(doc, PURPLE);   doc.rect(0, H * 0.58, 6, H * 0.42, 'F')

  // Decorative circles
  doc.setFillColor(255, 255, 255, 0.04)
  doc.circle(W - 20, 30, 50, 'F')
  doc.circle(15, H * 0.55, 30, 'F')

  // DS logo
  rgb(doc, BLUE_MID)
  doc.roundedRect(W / 2 - 20, 24, 40, 40, 5, 5, 'F')
  textColor(doc, WHITE)
  doc.setFontSize(20); doc.setFont('helvetica', 'bold')
  doc.text('DS', W / 2, 50, { align: 'center' })

  // Platform name
  doc.setFontSize(30); doc.setFont('helvetica', 'bold')
  textColor(doc, WHITE)
  doc.text('DocuSense', W / 2, 84, { align: 'center' })
  doc.setFontSize(11); doc.setFont('helvetica', 'normal')
  doc.setTextColor(180, 210, 255)
  doc.text('Plateforme de documentation intelligente', W / 2, 94, { align: 'center' })

  // Divider
  doc.setDrawColor(255, 255, 255, 0.2); doc.setLineWidth(0.3)
  doc.line(W / 2 - 45, 102, W / 2 + 45, 102)

  // Manual title
  doc.setFontSize(22); doc.setFont('helvetica', 'bold')
  textColor(doc, WHITE)
  const titleLines = doc.splitTextToSize(manual.title, W - 44)
  doc.text(titleLines, W / 2, 116, { align: 'center' })

  // Description
  if (manual.description) {
    const descLines = doc.splitTextToSize(manual.description, W - 60)
    doc.setFontSize(11); doc.setFont('helvetica', 'normal')
    doc.setTextColor(180, 210, 255)
    doc.text(descLines, W / 2, 116 + titleLines.length * 10 + 8, { align: 'center' })
  }

  // Stats band
  const statsY = H * 0.58 + 18
  const stats = [
    { value: String(steps.length), label: 'étapes' },
    { value: 'IA', label: 'généré par' },
    { value: '2026', label: 'DocuSense' },
  ]
  const colW = W / 3
  stats.forEach((s, i) => {
    const cx = colW * i + colW / 2
    doc.setFontSize(20); doc.setFont('helvetica', 'bold')
    textColor(doc, WHITE)
    doc.text(s.value, cx, statsY, { align: 'center' })
    doc.setFontSize(9); doc.setFont('helvetica', 'normal')
    doc.setTextColor(180, 210, 255)
    doc.text(s.label, cx, statsY + 8, { align: 'center' })
    if (i < 2) {
      doc.setDrawColor(255, 255, 255, 0.15); doc.setLineWidth(0.3)
      doc.line(colW * (i + 1), statsY - 12, colW * (i + 1), statsY + 14)
    }
  })

  // Date
  const date = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  doc.setFontSize(9); doc.setFont('helvetica', 'normal')
  doc.setTextColor(180, 210, 255)
  doc.text(`Généré le ${date}`, W / 2, H - 12, { align: 'center' })

  // ── TABLE OF CONTENTS ───────────────────────────────────────────
  doc.addPage()
  rgb(doc, BG); doc.rect(0, 0, W, H, 'F')
  addHeader(doc, W, manual.title, -1, steps.length)
  addFooter(doc, W, H, 2)

  textColor(doc, BLUE_DARK)
  doc.setFontSize(18); doc.setFont('helvetica', 'bold')
  doc.text('Table des matières', 14, 38)
  drawColor(doc, BLUE_MID); doc.setLineWidth(2)
  doc.line(14, 42, 60, 42)

  steps.forEach((step, i) => {
    const yToc = 56 + i * 16
    // Row bg
    rgb(doc, i % 2 === 0 ? WHITE : [240, 247, 255])
    doc.roundedRect(14, yToc - 7, W - 28, 15, 2, 2, 'F')
    // Number bubble
    rgb(doc, BLUE_MID)
    doc.circle(23, yToc + 0.5, 6, 'F')
    textColor(doc, WHITE)
    doc.setFontSize(8); doc.setFont('helvetica', 'bold')
    doc.text(String(i + 1), 23, yToc + 3.5, { align: 'center' })
    // Title
    textColor(doc, GRAY_TEXT)
    doc.setFontSize(10); doc.setFont('helvetica', 'normal')
    const tocTitle = step.title.length > 70 ? step.title.substring(0, 70) + '...' : step.title
    doc.text(tocTitle, 34, yToc + 3)
    // Page ref
    textColor(doc, BLUE_MID)
    doc.setFont('helvetica', 'bold')
    doc.text(`p.${i + 3}`, W - 18, yToc + 3, { align: 'right' })
  })

  // ── STEP PAGES ───────────────────────────────────────────────────
  steps.forEach((step, index) => {
    doc.addPage()
    rgb(doc, BG); doc.rect(0, 0, W, H, 'F')
    addHeader(doc, W, manual.title, index, steps.length)
    addFooter(doc, W, H, index + 3)

    const MARGIN = 14
    const CONTENT_W = W - MARGIN * 2
    let y = 30

    // Step number badge
    rgb(doc, BLUE_MID)
    doc.roundedRect(MARGIN, y, 28, 12, 3, 3, 'F')
    textColor(doc, WHITE)
    doc.setFontSize(8); doc.setFont('helvetica', 'bold')
    doc.text(`ÉTAPE ${index + 1}`, MARGIN + 14, y + 8.5, { align: 'center' })

    y += 18

    // Step title
    textColor(doc, BLUE_DARK)
    doc.setFontSize(15); doc.setFont('helvetica', 'bold')
    const titleLines2 = doc.splitTextToSize(step.title, CONTENT_W)
    doc.text(titleLines2, MARGIN, y)
    y += titleLines2.length * 7 + 6

    // Blue separator
    rgb(doc, BLUE_MID); doc.rect(MARGIN, y, 40, 2, 'F')
    rgb(doc, PURPLE);   doc.rect(MARGIN + 40, y, 14, 2, 'F')
    y += 8

    // Nettoie la description pour le PDF
    const cleanDesc = (text) => (text || '')
      .replace(/⚠️/g, '[!]')
      .replace(/✅/g, '[OK]')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/📷|📸|🎥|🌐|✨|📄|🚀|📋|💾/g, '')

    const rawDesc = cleanDesc(step.description)
    const rawLines = rawDesc.split('\n').filter(l => l.trim() !== '')
    const lineH = 5.5
    const maxDescH = H - y - 14 - (step.quiz ? 46 : 10) - 8
    const maxLines = Math.floor(maxDescH / lineH)

    // Calcule la hauteur réelle
    let allRendered = []
    for (const line of rawLines) {
      const isSection = line.endsWith(':') && line.length < 50
      const isNote = line.startsWith('[!]')
      const isResult = line.startsWith('[OK]')
      const font = isSection ? 'bold' : 'normal'
      doc.setFontSize(isSection ? 9.5 : 10)
      doc.setFont('helvetica', font)
      const wrapped = doc.splitTextToSize(line, CONTENT_W - 12)
      allRendered.push({ lines: wrapped, isSection, isNote, isResult })
    }
    const totalLines = allRendered.reduce((a, b) => a + b.lines.length, 0)
    const blockH = Math.min(totalLines * lineH + 14, maxDescH)

    rgb(doc, WHITE)
    doc.roundedRect(MARGIN, y, CONTENT_W, blockH + 4, 4, 4, 'F')
    drawColor(doc, [226, 232, 240]); doc.setLineWidth(0.3)
    doc.roundedRect(MARGIN, y, CONTENT_W, blockH + 4, 4, 4, 'S')
    rgb(doc, BLUE_LIGHT)
    doc.rect(MARGIN, y, 3, blockH + 4, 'F')

    y += 8
    let linesUsed = 0
    for (const block of allRendered) {
      if (linesUsed + block.lines.length > maxLines) break
      if (block.isNote) {
        textColor(doc, [146, 64, 14])
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9.5)
      } else if (block.isResult) {
        textColor(doc, [22, 101, 52])
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9.5)
      } else if (block.isSection) {
        textColor(doc, BLUE_DARK)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9.5)
      } else {
        textColor(doc, GRAY_TEXT)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
      }
      doc.text(block.lines, MARGIN + 7, y, { lineHeightFactor: 1.5 })
      y += block.lines.length * lineH
      linesUsed += block.lines.length
    }
    y += 10

    // Quiz section (only if there's space)
    if (step.quiz && step.quiz.question) {
      const quizY = H - 14 - 44
      if (y < quizY - 5) {
        rgb(doc, [245, 240, 255])
        doc.roundedRect(MARGIN, quizY - 6, CONTENT_W, 44, 4, 4, 'F')
        drawColor(doc, [195, 155, 211]); doc.setLineWidth(0.3)
        doc.roundedRect(MARGIN, quizY - 6, CONTENT_W, 44, 4, 4, 'S')

        // Quiz icon + label
        rgb(doc, PURPLE)
        doc.roundedRect(MARGIN + 3, quizY - 2, 20, 8, 2, 2, 'F')
        textColor(doc, WHITE)
        doc.setFontSize(7); doc.setFont('helvetica', 'bold')
        doc.text('QUIZ', MARGIN + 13, quizY + 4.5, { align: 'center' })

        textColor(doc, [80, 40, 120])
        doc.setFontSize(9); doc.setFont('helvetica', 'bold')
        const qLines = doc.splitTextToSize(step.quiz.question, CONTENT_W - 30)
        doc.text(qLines, MARGIN + 28, quizY + 4)

        // Options in 2 columns
        const opts = step.quiz.options || []
        textColor(doc, GRAY_TEXT)
        doc.setFontSize(8); doc.setFont('helvetica', 'normal')
        opts.slice(0, 4).forEach((opt, oi) => {
          const col = oi % 2
          const row = Math.floor(oi / 2)
          const ox = MARGIN + 6 + col * (CONTENT_W / 2)
          const oy = quizY + 16 + row * 9
          const isCorrect = opt === step.quiz.correctAnswer
          if (isCorrect) { rgb(doc, [230, 255, 235]); doc.roundedRect(ox - 2, oy - 5, CONTENT_W / 2 - 4, 7, 1, 1, 'F') }
          textColor(doc, isCorrect ? [22, 101, 52] : GRAY_TEXT)
          doc.setFont('helvetica', isCorrect ? 'bold' : 'normal')
          const label = ['A', 'B', 'C', 'D'][oi]
          doc.text(`${label}. ${opt.length > 30 ? opt.substring(0, 28) + '..' : opt}`, ox, oy)
        })
      }
    }
  })

  doc.save(`${manual.title.replace(/\s+/g, '_')}_manuel.pdf`)
}

export const generateCertificate = (userName, manualTitle, score, badges) => {
  const doc = new jsPDF({ orientation: 'landscape' })
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()

  // Background
  rgb(doc, BG); doc.rect(0, 0, W, H, 'F')

  // Outer border
  drawColor(doc, BLUE_MID); doc.setLineWidth(3)
  doc.rect(8, 8, W - 16, H - 16)

  // Inner border
  drawColor(doc, PURPLE); doc.setLineWidth(0.8)
  doc.rect(13, 13, W - 26, H - 26)

  // Top band
  rgb(doc, BLUE_DARK); doc.rect(13, 13, W - 26, 30, 'F')
  rgb(doc, BLUE_MID);  doc.rect(13, 13, 5, 30, 'F')

  // DS logo in band
  rgb(doc, BLUE_LIGHT)
  doc.roundedRect(W / 2 - 12, 16, 24, 22, 3, 3, 'F')
  textColor(doc, WHITE)
  doc.setFontSize(13); doc.setFont('helvetica', 'bold')
  doc.text('DS', W / 2, 31, { align: 'center' })
  doc.setFontSize(9); doc.setFont('helvetica', 'normal')
  doc.setTextColor(180, 210, 255)
  doc.text('DocuSense', W / 2, 39, { align: 'center' })

  // Title
  doc.setFontSize(26); doc.setFont('helvetica', 'bold')
  textColor(doc, BLUE_DARK)
  doc.text('CERTIFICAT DE RÉUSSITE', W / 2, 68, { align: 'center' })

  // Decorative lines
  rgb(doc, BLUE_MID); doc.rect(W / 2 - 50, 73, 100, 2, 'F')
  rgb(doc, PURPLE);   doc.rect(W / 2 - 20, 76, 40, 1, 'F')

  doc.setFontSize(11); doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 116, 139)
  doc.text('Ce certificat est décerné à', W / 2, 90, { align: 'center' })

  // User name
  doc.setFontSize(28); doc.setFont('helvetica', 'bold')
  textColor(doc, BLUE_MID)
  doc.text(userName || 'Utilisateur', W / 2, 108, { align: 'center' })

  // Underline name
  drawColor(doc, BLUE_MID); doc.setLineWidth(0.5)
  const nameW = doc.getTextWidth(userName || 'Utilisateur')
  doc.line(W / 2 - nameW / 2 - 5, 112, W / 2 + nameW / 2 + 5, 112)

  doc.setFontSize(11); doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 116, 139)
  doc.text('pour avoir complété avec succès le manuel', W / 2, 124, { align: 'center' })

  doc.setFontSize(15); doc.setFont('helvetica', 'bold')
  textColor(doc, BLUE_DARK)
  const tLines = doc.splitTextToSize(`« ${manualTitle} »`, W - 80)
  doc.text(tLines, W / 2, 136, { align: 'center' })

  // Score box
  rgb(doc, [239, 246, 255])
  doc.roundedRect(W / 2 - 40, 148, 80, 18, 4, 4, 'F')
  drawColor(doc, BLUE_MID); doc.setLineWidth(0.5)
  doc.roundedRect(W / 2 - 40, 148, 80, 18, 4, 4, 'S')
  doc.setFontSize(11); doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 116, 139)
  doc.text('Score obtenu :', W / 2 - 5, 160, { align: 'right' })
  doc.setFontSize(13); doc.setFont('helvetica', 'bold')
  textColor(doc, BLUE_MID)
  doc.text(`${score} pts`, W / 2 + 2, 160)

  // Badges
  if (badges && badges.length > 0) {
    const badgeMap = { gold: '🥇 Gold', silver: '🥈 Silver', bronze: '🥉 Bronze' }
    const badgeText = badges.map(b => badgeMap[b] || b).join('   ')
    doc.setFontSize(10); doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 116, 139)
    doc.text(`Badges : ${badgeText}`, W / 2, 174, { align: 'center' })
  }

  // Date
  const date = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  doc.setFontSize(9); doc.setTextColor(100, 116, 139)
  doc.text(`Délivré le ${date}`, W / 2, H - 20, { align: 'center' })

  // Seal
  drawColor(doc, BLUE_MID); doc.setLineWidth(1.5)
  doc.circle(W - 42, H - 38, 20)
  rgb(doc, [240, 247, 255]); doc.circle(W - 42, H - 38, 20, 'F')
  drawColor(doc, BLUE_MID); doc.circle(W - 42, H - 38, 20)
  drawColor(doc, BLUE_LIGHT); doc.setLineWidth(0.5)
  doc.circle(W - 42, H - 38, 17)
  textColor(doc, BLUE_MID)
  doc.setFontSize(7); doc.setFont('helvetica', 'bold')
  doc.text('CERTIFIÉ', W - 42, H - 41, { align: 'center' })
  doc.text('DocuSense', W - 42, H - 35, { align: 'center' })
  doc.setFontSize(11)
  doc.text('✓', W - 42, H - 29, { align: 'center' })

  doc.save(`Certificat_${(userName || 'user').replace(/\s+/g, '_')}.pdf`)
}
