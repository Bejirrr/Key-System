const keyStore = new Map();
const rateLimitStore = new Map();

const CONFIG = {
  KEY_LENGTH: 32,
  KEY_EXPIRY_HOURS: 24,
  RATE_LIMIT_PER_HWID: 5,
  SECRET_KEY: process.env.SECRET_KEY || 'default-secret-key-change-this'
};

function generateKey(hwid) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  const combined = `${hwid}-${timestamp}-${random}-${CONFIG.SECRET_KEY}`;
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return Math.abs(hash).toString(36) + random;
}

function checkRateLimit(hwid) {
  const now = Date.now();
  const hourAgo = now - (60 * 60 * 1000);
  
  if (!rateLimitStore.has(hwid)) {
    rateLimitStore.set(hwid, []);
  }
  
  const requests = rateLimitStore.get(hwid).filter(time => time > hourAgo);
  rateLimitStore.set(hwid, requests);
  
  return requests.length < CONFIG.RATE_LIMIT_PER_HWID;
}

function addRateLimit(hwid) {
  if (!rateLimitStore.has(hwid)) {
    rateLimitStore.set(hwid, []);
  }
  rateLimitStore.get(hwid).push(Date.now());
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Allow GET for testing
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'online',
      message: 'Use POST method to get a key',
      endpoint: '/api/getkey',
      method: 'POST'
    });
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }
  
  try {
    const { hwid, player_id, username, timestamp } = req.body;
    
    if (!hwid || !player_id || !username) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: hwid, player_id, username'
      });
    }
    
    // Check rate limit
    if (!checkRateLimit(hwid)) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded. Try again later.'
      });
    }
    
    // Check existing key
    if (keyStore.has(hwid)) {
      const existingKey = keyStore.get(hwid);
      const expiryTime = new Date(existingKey.expires_at);
      
      if (expiryTime > new Date()) {
        return res.status(200).json({
          success: true,
          key: existingKey.key,
          expires_at: existingKey.expires_at,
          message: 'Existing key returned'
        });
      }
    }
    
    // Generate new key
    const newKey = generateKey(hwid);
    const expiresAt = new Date(Date.now() + CONFIG.KEY_EXPIRY_HOURS * 60 * 60 * 1000).toISOString();
    
    const keyData = {
      key: newKey,
      hwid: hwid,
      player_id: player_id,
      username: username,
      created_at: new Date().toISOString(),
      expires_at: expiresAt
    };
    
    keyStore.set(hwid, keyData);
    addRateLimit(hwid);
    
    return res.status(200).json({
      success: true,
      key: newKey,
      expires_at: expiresAt,
      message: 'Key generated successfully'
    });
    
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
