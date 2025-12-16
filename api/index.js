import crypto from 'crypto';

const validKeys = new Map();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { hwid, username, timestamp } = req.body;

    if (!hwid || !username) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing hwid or username' 
      });
    }

    // Generate unique key
    const key = crypto
      .createHash('sha256')
      .update(`${hwid}-${username}-${Date.now()}-${Math.random()}`)
      .digest('hex')
      .substring(0, 32); // 32 karakter

    // Simpan key dengan info HWID dan user
    validKeys.set(key, {
      hwid: hwid,
      username: username,
      timestamp: Date.now(),
      createdAt: new Date().toISOString()
    });

    console.log(`✅ Key generated for ${username}: ${key}`);

    return res.status(200).json({ 
      success: true, 
      key: key,
      message: 'Key generated successfully'
    });

  } catch (error) {
    console.error('Key generation error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}
