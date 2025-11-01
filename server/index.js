import express from 'express'
import cors from 'cors'
import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
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

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`)
})
