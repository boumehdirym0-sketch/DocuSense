const Groq = require('groq-sdk')
const fs = require('fs')
const sharp = require('sharp')

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const STEP_SCHEMA = `{
  "steps": [
    {
      "title": "Titre de l'étape (orienté action, spécifique)",
      "description": "Paragraphe d'introduction expliquant l'importance de cette étape et son contexte dans l'utilisation de l'application. Deuxième phrase décrivant exactement où se trouve l'élément dans l'interface (nom du menu, section, bouton). Troisième phrase expliquant comment interagir avec cet élément pas à pas. Quatrième phrase décrivant les options disponibles ou les variantes possibles. Cinquième phrase indiquant le résultat attendu et comment l'utilisateur sait que l'étape est réussie.",
      "quiz": {
        "question": "Question précise sur un élément concret de cette étape ?",
        "options": ["Option A spécifique", "Option B spécifique", "Option C spécifique", "Option D spécifique"],
        "correctAnswer": "Option A spécifique",
        "points": 10
      }
    }
  ]
}`

const extractJSON = (text) => {
  const clean = text.replace(/```json|```/g, '').trim()
  const match = clean.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('Aucun JSON trouvé dans la réponse IA')
  // Sanitize literal control characters inside JSON string values
  const sanitized = match[0].replace(/"((?:[^"\\]|\\.)*)"/g, (_, inner) => {
    return '"' + inner
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t')
    + '"'
  })
  return JSON.parse(sanitized)
}


const suggestSteps = async (req, res) => {
  try {
    const { appDescription } = req.body
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{
        role: 'user',
        content: `You are a senior technical writer specializing in professional software documentation.
A developer has described their application as follows: "${appDescription}".

Generate exactly 8 complete and professional documentation steps for the user manual of THIS application.

ABSOLUTE RULES — read carefully:
1. ONLY generate steps for features that are EXPLICITLY mentioned in the description above. DO NOT invent any feature, button, menu, dropdown, tab, or UI element that was not described. If the description does not mention a "settings" page, do not write a step about it.
2. Base UI element names on what a developer would logically name them given the described features (e.g. if they described "creating a manual", the button is likely "Créer un manuel" or "Nouveau manuel").
3. Every step must correspond to a real, described workflow — no hallucinated features.

Per step requirements:
- Title: action-oriented verb + object based ONLY on described features (in French, max 8 words)
- Description: Write a DETAILED description in French following this EXACT structure (minimum 120 words):
  • Paragraph 1 (2 sentences): What this feature is and why it matters for the user, based strictly on the description provided.
  • "Comment procéder :" followed by a numbered list of 5 concrete steps. Use plausible UI element names consistent with the described application. Use "vous" (formal).
  • "⚠️ Points d'attention :" followed by 2 important notes or constraints relevant to this feature.
  • "✅ Résultat attendu :" one precise sentence describing what the user sees when the action succeeds.
- Quiz: a question about a real concept from this step, with 4 plausible options (in French).

Reply ONLY with valid JSON, no text before or after:
${STEP_SCHEMA}`
      }],
      temperature: 0.7,
      max_tokens: 8192,
    })
    const text = response.choices[0].message.content
    const parsed = extractJSON(text)
    res.json(parsed)
  } catch (err) {
    console.error('Erreur Groq suggestSteps:', err.message)
    res.status(500).json({ message: err.message })
  }
}


const analyzeImage = async (req, res) => {
  try {
    console.log('analyzeImage appelé !')
    if (!req.file) return res.status(400).json({ message: 'Aucune image fournie' })

    const compressedPath = req.file.path + '_compressed.jpg'
    await sharp(req.file.path)
      .resize(1280, 720, { fit: 'inside' })
      .jpeg({ quality: 70 })
      .toFile(compressedPath)

    const imageData = fs.readFileSync(compressedPath)
    const base64Image = imageData.toString('base64')
    console.log('Taille compressée:', imageData.length)

    const response = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: `data:image/jpeg;base64,${base64Image}` }
          },
          {
            type: 'text',
            text: `You are a senior technical writer specializing in professional UX documentation for enterprise software.
Carefully analyze this screenshot. Identify the EXACT type of interface and ALL visible UI elements with their precise labels (menu names, button texts, input fields, section titles, icons, colors, layout, etc.).

Generate exactly 8 detailed, rigorous documentation steps based ONLY on what is ACTUALLY VISIBLE in this image.

STRICT requirements per step:
- Title: action-oriented verb + specific object referencing a VISIBLE element (in French, max 8 words)
- Description: Write a RICH, DETAILED description in French following this EXACT structure (minimum 120 words total):
  • Paragraph 1 (2-3 sentences): What this specific feature/section is and its purpose — using the EXACT visible label name from the screenshot.
  • "Comment procéder :" followed by a numbered list of AT LEAST 5 precise, concrete steps. Each step MUST reference an exact visible UI element (button label, field name, icon position, menu name as seen on screen). Use "vous" (formal address).
  • "⚠️ Points d'attention :" followed by 2 important notes, constraints, or common mistakes visible or implied by this interface.
  • "✅ Résultat attendu :" one precise sentence describing what the user sees or obtains when the action is completed.
- FORBIDDEN: steps about "opening the app", "logging in", "navigating to". Every step must describe a specific VISIBLE action.
- Quiz: a question about a concrete UI detail visible in this step, with 4 plausible options (in French).

Reply ONLY with valid JSON, no text before or after:
${STEP_SCHEMA}`
          }
        ]
      }],
      temperature: 0.7,
      max_tokens: 4096,
    })

    const text = response.choices[0].message.content
    const parsed = extractJSON(text)

    fs.unlinkSync(req.file.path)
    fs.unlinkSync(compressedPath)
    res.json(parsed)
  } catch (err) {
    console.error('Erreur Groq Vision:', err.message)
    res.status(500).json({ message: err.message })
  }
}

const analyzeVideo = async (req, res) => {
  try {
    console.log('analyzeVideo appelé !')
    if (!req.file) return res.status(400).json({ message: 'Aucune vidéo fournie' })

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{
        role: 'user',
        content: `Tu es un rédacteur technique senior spécialisé dans la documentation professionnelle de logiciels.
Une vidéo de démonstration d'une interface logicielle a été fournie.
Génère exactement 5 étapes de documentation complètes, rigoureuses et professionnelles pour le manuel utilisateur.

Exigences OBLIGATOIRES pour chaque étape :
- Titre : verbe d'action + objet spécifique (en français, maximum 8 mots)
- Description : Rédigez une description RICHE et DÉTAILLÉE en français suivant cette structure EXACTE (minimum 120 mots) :
  • Paragraphe 1 (2-3 phrases) : Ce qu'est cette fonctionnalité, son rôle dans l'application et pourquoi elle est essentielle pour l'utilisateur.
  • "Comment procéder :" suivi d'une liste numérotée d'AU MOINS 5 étapes concrètes et précises. Chaque étape doit désigner un élément d'interface précis (nom du bouton, du champ, de la section, position dans l'écran). Utiliser "vous" (vouvoiement).
  • "⚠️ Points d'attention :" suivi de 2 avertissements ou notes importantes (limites, erreurs fréquentes, contraintes à respecter).
  • "✅ Résultat attendu :" une phrase précise décrivant ce que l'utilisateur voit ou obtient lorsque l'action est réussie.
- Quiz : une question précise sur un concept clé de cette étape, avec 4 options plausibles en français.

Réponds UNIQUEMENT en JSON valide, sans texte avant ou après :
${STEP_SCHEMA}`
      }],
      temperature: 0.7,
      max_tokens: 6144,
    })

    const text = response.choices[0].message.content
    const parsed = extractJSON(text)

    fs.unlinkSync(req.file.path)
    res.json(parsed)
  } catch (err) {
    console.error('Erreur Groq Video:', err.message)
    res.status(500).json({ message: err.message })
  }
}

const analyzeImageStep = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Aucune image fournie' })

    const compressedPath = req.file.path + '_compressed.jpg'
    await sharp(req.file.path)
      .resize(1280, 720, { fit: 'inside' })
      .jpeg({ quality: 70 })
      .toFile(compressedPath)

    const imageData = fs.readFileSync(compressedPath)
    const base64Image = imageData.toString('base64')

    const SINGLE_STEP_SCHEMA = `{
  "step": {
    "title": "Titre de l'étape (orienté action, spécifique à ce qui est visible)",
    "description": "Paragraphe de 4 à 5 phrases en français décrivant précisément cette capture : ce qu'on voit, où se trouvent les éléments, comment les utiliser, et le résultat attendu.",
    "quiz": {
      "question": "Question précise sur un élément visible dans cette capture ?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "points": 10
    }
  }
}`

    const response = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: `data:image/jpeg;base64,${base64Image}` }
          },
          {
            type: 'text',
            text: `Tu es un rédacteur technique expert en documentation UX professionnelle. Analyse attentivement ce screenshot et génère une étape de manuel utilisateur rigoureuse, détaillée et structurée.

Réponds UNIQUEMENT en JSON valide avec cette structure exacte :
{
  "step": {
    "title": "Verbe d'action + objet spécifique VISIBLE dans le screenshot (ex: 'Créer un nouveau manuel', 'Configurer les paramètres du compte') — max 8 mots, en français",
    "description": "Paragraphe introductif (2-3 phrases) : ce que l'utilisateur voit dans cette interface, l'objectif de cette fonctionnalité et pourquoi elle est importante.\\n\\nComment procéder :\\n1. [action concrète et précise référençant un élément VISIBLE : bouton, champ, icône, menu avec son nom exact]\\n2. [action concrète]\\n3. [action concrète]\\n4. [action concrète]\\n5. [action concrète]\\n\\n⚠️ Points d'attention :\\n- [contrainte ou erreur fréquente visible ou impliquée par l'interface]\\n- [deuxième point d'attention important]\\n\\n✅ Résultat attendu : [ce que l'utilisateur voit ou obtient précisément quand l'action est réussie]",
    "quiz": {
      "question": "Question précise sur un élément UI concret visible dans ce screenshot ?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "points": 10
    }
  }
}

RÈGLES STRICTES :
- Titre = verbe d'action (jamais "Interface de..." ou "Page de...")
- Utiliser "vous" (vouvoiement formel)
- Description minimum 150 mots — chaque section est obligatoire
- Chaque action numérotée doit nommer un élément VISIBLE dans le screenshot (label exact, position, couleur si pertinente)
- Zéro remplissage générique — chaque phrase doit apporter une information concrète
- Réponds UNIQUEMENT en JSON valide, sans texte avant ou après`
          }
        ]
      }],
      temperature: 0.7,
      max_tokens: 2048,
    })

    const text = response.choices[0].message.content
    const parsed = extractJSON(text)

    fs.unlinkSync(req.file.path)
    fs.unlinkSync(compressedPath)
    res.json(parsed.step)
  } catch (err) {
    console.error('Erreur analyzeImageStep:', err.message)
    res.status(500).json({ message: err.message })
  }
}

module.exports = { suggestSteps, analyzeImage, analyzeVideo, analyzeImageStep }
