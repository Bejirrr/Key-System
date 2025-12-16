import crypto from 'crypto';

// In-memory storage (untuk testing, gunakan database untuk production)
const validKeys = global.validKeys || new Map();
global.validKeys = validKeys;

export default async function handler(req, res) {
  // ✅ CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed. Use POST.' 
    });
  }

  try {
    console.log('📥 Received request body:', req.body);

    const { hwid, username, timestamp } = req.body;

    // Validasi input
    if (!hwid) {
      return res.status(400).json({ 
        success: false, 
        message: 'HWID is required' 
      });
    }

    if (!username) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username is required' 
      });
    }

    // Generate unique key
    const key = crypto
      .createHash('sha256')
      .update(`${hwid}-${username}-${Date.now()}-${Math.random()}`)
      .digest('hex')
      .substring(0, 32);

    // Simpan key
    validKeys.set(key, {
      hwid: hwid,
      username: username,
      timestamp: Date.now(),
      createdAt: new Date().toISOString()
    });

    console.log('✅ Key generated successfully:', key);
    console.log('📊 Total keys in storage:', validKeys.size);

    return res.status(200).json({ 
      success: true, 
      key: key,
      message: 'Key generated successfully',
      expiresIn: '1 hour'
    });

  } catch (error) {
    console.error('❌ Key generation error:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error',
      error: error.toString()
    });
  }
}
