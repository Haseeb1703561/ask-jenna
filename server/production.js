import express from 'express'
import cors from 'cors'
import axios from 'axios'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 4000

// Configure CORS to allow requests from your frontend domain
const corsOptions = {
  origin: ['https://store.bbrewtech.com', 'http://store.bbrewtech.com', 'http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions))
app.use(express.json())

// API Routes
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'Server is running' })
})

app.post('/api/session-token', async (_req, res) => {
  try {
    const apiKey = process.env.HEYGEN_API_KEY
    if (!apiKey) {
      return res.status(500).json({ error: 'HEYGEN_API_KEY missing in server environment' })
    }

    const response = await axios.post(
      'https://api.heygen.com/v1/streaming.create_token',
      {},
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const data = response.data
    const token = data?.data?.session_token || data?.data?.token || data?.session_token
    if (!token) {
      return res.status(502).json({ error: 'Failed to retrieve session token from HeyGen', raw: data })
    }

    res.json({ token })
  } catch (err) {
    const status = err.response?.status || 500
    res.status(status).json({ error: 'Failed to create session token', detail: err.response?.data || err.message })
  }
})

// Serve static files from the React build folder
app.use(express.static(path.join(__dirname, '../dist')))

// All other routes serve the React app (for client-side routing)
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'))
})

app.listen(PORT, () => {
  console.log(`Production server running on port ${PORT}`)
  console.log(`API available at http://localhost:${PORT}/api`)
})
