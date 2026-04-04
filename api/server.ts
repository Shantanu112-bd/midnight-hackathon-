import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import crypto from 'crypto'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 3001
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2'

// Helper: call Ollama
async function askOllama(prompt: string): Promise<string> {
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
      format: 'json'
    })
  })
  const data = await res.json() as any
  return data.response
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    mockMode: process.env.MOCK_MODE === 'true',
    ollamaModel: OLLAMA_MODEL,
    ollamaUrl: OLLAMA_URL,
    timestamp: new Date().toISOString()
  })
})

// AI Promise Extraction
app.post('/api/extract-promise', async (req, res) => {
  const { transcript } = req.body

  if (!transcript?.trim()) {
    return res.status(400).json({ error: 'Transcript is required' })
  }

  if (process.env.MOCK_MODE === 'true') {
    await new Promise(r => setTimeout(r, 800))
    return res.json({
      hasPromise: true,
      promise: {
        description: '15% salary increment',
        condition: 'Complete Project Atlas',
        deadline: 'September 30, 2025',
        promiserRole: 'manager',
        confidence: 0.94
      },
      rawText: transcript.slice(0, 100)
    })
  }

  try {
    const raw = await askOllama(`
You are a workplace promise extractor.
Analyze this meeting transcript and extract any specific promise made.
Return ONLY valid JSON, no explanation, no markdown.
Be conservative — only extract explicit, specific commitments.
Do NOT extract vague statements like "we'll see" or "maybe".

Return exactly this structure:
{
  "hasPromise": true or false,
  "promise": {
    "description": "what was promised, concise",
    "condition": "under what condition",
    "deadline": "when, specific date or quarter",
    "promiserRole": "manager or employee",
    "confidence": 0.0 to 1.0
  },
  "rawText": "relevant excerpt from transcript"
}

If no clear promise found, return:
{
  "hasPromise": false,
  "promise": null,
  "rawText": "",
  "warningMessage": "reason why no promise was found"
}

Transcript:
${transcript}
    `)

    const result = JSON.parse(raw)
    return res.json(result)

  } catch (error) {
    console.error('Ollama error:', error)
    return res.status(500).json({ error: 'AI extraction failed', details: String(error) })
  }
})

// Create Promise (extract + hash)
app.post('/api/create-promise', async (req, res) => {
  const { transcript, managerAddress, employeeAddress } = req.body

  try {
    const extractResponse = await fetch(`http://localhost:${PORT}/api/extract-promise`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript })
    })
    const extractedData = await extractResponse.json() as any

    if (!extractedData.hasPromise) {
      return res.status(400).json({
        error: 'No clear promise found in transcript',
        warningMessage: extractedData.warningMessage
      })
    }

    const promiseObject = {
      ...extractedData.promise,
      managerAddress,
      employeeAddress,
      timestamp: Date.now()
    }

    const hash = crypto.createHash('sha256').update(JSON.stringify(promiseObject)).digest('hex')
    const promiseHash = `0x${hash.slice(0, 8)}...${hash.slice(-4)}`
    const mockTxId = `0x${crypto.randomBytes(4).toString('hex')}...${crypto.randomBytes(2).toString('hex')}`

    return res.json({
      success: true,
      contractTxId: mockTxId,
      promiseHash,
      extractedData,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Create promise error:', error)
    return res.status(500).json({ error: 'Failed to process promise' })
  }
})

// File Anonymous Complaint
app.post('/api/file-complaint', async (req, res) => {
  const { complaintText, category, targetManagerId, escalate } = req.body

  if (!complaintText?.trim()) {
    return res.status(400).json({ error: 'Complaint description is required' })
  }

  const hash = crypto.createHash('sha256')
    .update(complaintText + targetManagerId + Date.now())
    .digest('hex')
  const complaintHash = `0x${hash.slice(0, 8)}...${hash.slice(-4)}`
  const zkReceiptId = `zk_${crypto.randomBytes(4).toString('hex')}...${crypto.randomBytes(4).toString('hex')}`

  await new Promise(r => setTimeout(r, 1000))

  return res.json({
    success: true,
    txId: zkReceiptId,
    complaintHash,
    count: Math.floor(Math.random() * 2) + 1,
    escalated: escalate || false,
    timestamp: new Date().toISOString()
  })
})

// Reliability score
app.get('/api/reliability/:managerHash', (req, res) => {
  res.json({
    managerHash: req.params.managerHash,
    score: 87,
    promisesCreated: 12,
    promisesFulfilled: 10,
    promisesBroken: 1,
    promisesPending: 1
  })
})

app.listen(PORT, () => {
  console.log(`✅ ProofWork API running on port ${PORT}`)
  console.log(`   Ollama model : ${OLLAMA_MODEL}`)
  console.log(`   Ollama URL   : ${OLLAMA_URL}`)
  console.log(`   Mock mode    : ${process.env.MOCK_MODE === 'true' ? 'ON' : 'OFF'}`)
  console.log(`   Health check : http://localhost:${PORT}/health`)
})
