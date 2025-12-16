export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }
  
  const { key, hwid } = req.body;
  
  if (!key || !hwid) {
    return res.status(400).json({
      valid: false,
      error: 'Missing required fields'
    });
  }
  
  // Implementasi validasi key
  // Sesuaikan dengan sistem penyimpanan Anda
  
  return res.status(200).json({
    valid: true,
    message: 'Key is valid',
    expires_at: '2024-12-17T12:00:00.000Z'
  });
}
