import axios from 'axios'

export default async function handler(req, res) {
  // Handle CORS preflight
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

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

    res.status(200).json({ token })
  } catch (err) {
    const status = err.response?.status || 500
    res.status(status).json({ 
      error: 'Failed to create session token', 
      detail: err.response?.data || err.message 
    })
  }
}
