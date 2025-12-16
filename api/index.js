export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  const baseUrl = `https://${req.headers.host}`;
  
  return res.status(200).json({
    name: 'Roblox Key System API',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      getKey: {
        method: 'POST',
        url: `${baseUrl}/api/getkey`,
        description: 'Generate or retrieve a key for a specific HWID',
        body: {
          hwid: 'string (required)',
          player_id: 'number (required)',
          username: 'string (required)',
          timestamp: 'number (required)'
        },
        response: {
          success: 'boolean',
          key: 'string',
          expires_at: 'ISO date string',
          message: 'string'
        }
      },
      validate: {
        method: 'POST',
        url: `${baseUrl}/api/validate`,
        description: 'Validate an existing key',
        body: {
          key: 'string (required)',
          hwid: 'string (required)'
        },
        response: {
          valid: 'boolean',
          expires_at: 'ISO date string (if valid)',
          error: 'string (if invalid)'
        }
      }
    },
    features: [
      'Rate limiting (5 requests per hour per HWID)',
      'Key expiration (24 hours)',
      'HWID-based authentication',
      'Timestamp verification',
      'CORS enabled'
    ],
    rateLimit: {
      perHwid: 5,
      window: '1 hour'
    },
    keyExpiry: '24 hours'
  });
}
