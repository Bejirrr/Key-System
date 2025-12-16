// Gunakan global storage yang sama
const validKeys = global.validKeys || new Map();
global.validKeys = validKeys;

export default async function handler(req, res) {
  // ✅ CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      valid: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    console.log('📥 Validation request:', req.body);

    const { key, hwid } = req.body;

    if (!key || !hwid) {
      return res.status(400).json({ 
        valid: false, 
        message: 'Missing key or hwid' 
      });
    }

    // Cek key di storage
    const storedKey = validKeys.get(key);

    if (!storedKey) {
      console.log('❌ Key not found:', key);
      console.log('📊 Available keys:', Array.from(validKeys.keys()));
      return res.status(200).json({ 
        valid: false, 
        message: 'Key not found' 
      });
    }

    // Cek HWID match
    if (storedKey.hwid !== hwid) {
      console.log('❌ HWID mismatch');
      return res.status(200).json({ 
        valid: false, 
        message: 'HWID mismatch' 
      });
    }

    // Cek expiry (1 jam)
    const KEY_EXPIRY = 3600000; // 1 hour in ms
    const age = Date.now() - storedKey.timestamp;
    
    if (age > KEY_EXPIRY) {
      validKeys.delete(key);
      console.log('❌ Key expired');
      return res.status(200).json({ 
        valid: false, 
        message: 'Key expired' 
      });
    }

    console.log('✅ Key validated successfully');

    return res.status(200).json({ 
      valid: true, 
      message: 'Key is valid',
      username: storedKey.username,
      timeRemaining: Math.floor((KEY_EXPIRY - age) / 1000) + 's'
    });

  } catch (error) {
    console.error('❌ Validation error:', error);
    return res.status(500).json({ 
      valid: false, 
      message: 'Internal server error',
      error: error.toString()
    });
  }
}
