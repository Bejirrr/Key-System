
const validKeys = new Map(); // Store: key -> {hwid, username, timestamp}

export default async function handler(req, res) {
  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ valid: false, message: 'Method not allowed' });
  }

  try {
    const { key, hwid } = req.body;

    // Validasi input
    if (!key || !hwid) {
      return res.status(400).json({ 
        valid: false, 
        message: 'Missing key or hwid' 
      });
    }


    const storedKey = validKeys.get(key);

    if (!storedKey) {
      return res.status(200).json({ 
        valid: false, 
        message: 'Key not found' 
      });
    }


    if (storedKey.hwid !== hwid) {
      return res.status(200).json({ 
        valid: false, 
        message: 'HWID mismatch' 
      });
    }


    const KEY_EXPIRY = 3600000; // 1 hour in ms
    if (Date.now() - storedKey.timestamp > KEY_EXPIRY) {
      validKeys.delete(key); // Hapus key yang expired
      return res.status(200).json({ 
        valid: false, 
        message: 'Key expired' 
      });
    }


    return res.status(200).json({ 
      valid: true, 
      message: 'Key is valid',
      username: storedKey.username
    });

  } catch (error) {
    console.error('Validation error:', error);
    return res.status(500).json({ 
      valid: false, 
      message: 'Internal server error' 
    });
  }
}
