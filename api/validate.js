export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'online',
      message: 'Use POST method to validate a key',
      endpoint: '/api/validate',
      method: 'POST'
    });
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { key, hwid } = req.body;
  
  if (!key || !hwid) {
    return res.status(400).json({
      valid: false,
      error: 'Missing key or hwid'
    });
  }
  
  // Validation logic (sesuaikan dengan penyimpanan Anda)
  return res.status(200).json({
    valid: true,
    message: 'Key validation endpoint',
    note: 'Implement your validation logic here'
  });
}
