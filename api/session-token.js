import axios from 'axios'

// CORS headers helper
const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Max-Age', '86400')
}

export default async function handler(req, res) {
  // Set CORS headers on every response
  setCorsHeaders(res)
  
  // Handle OPTIONS preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Only allow POST
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

    return res.status(200).json({ token })
  } catch (err) {
    const status = err.response?.status || 500
    return res.status(status).json({ 
      error: 'Failed to create session token', 
      detail: err.response?.data || err.message 
    })
  }
}
