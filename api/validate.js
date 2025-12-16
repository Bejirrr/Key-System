import { createClient } from '@supabase/supabase-js';

// Validate environment variables
const SUPABASE_URL = process.env.SUPABASE_URL?.trim();
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY?.trim();

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing environment variables:', {
    hasUrl: !!SUPABASE_URL,
    hasKey: !!SUPABASE_KEY
  });
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default async function handler(req, res) {
  // CORS Headers
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
    const { key, hwid } = req.body;

    // Validasi input
    if (!key || !hwid) {
      return res.status(400).json({ 
        valid: false, 
        message: 'Missing key or hwid' 
      });
    }

    console.log('📥 Validation request:', { key: key.substring(0, 8) + '...', hwid });

    // Query key from Supabase
    const { data: keyData, error } = await supabase
      .from('keys')
      .select('*')
      .eq('key', key)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned (key not found)
        console.log('❌ Key not found in database');
        return res.status(200).json({ 
          valid: false, 
          message: 'Key not found' 
        });
      }

      console.error('❌ Database error:', error);
      return res.status(500).json({ 
        valid: false, 
        message: 'Database error',
        error: error.message
      });
    }

    // Check if key exists
    if (!keyData) {
      console.log('❌ Key not found');
      return res.status(200).json({ 
        valid: false, 
        message: 'Key not found' 
      });
    }

    // Check HWID match
    if (keyData.hwid !== hwid) {
      console.log('❌ HWID mismatch:', {
        expected: keyData.hwid,
        received: hwid
      });
      return res.status(200).json({ 
        valid: false, 
        message: 'HWID mismatch - This key belongs to another device' 
      });
    }

    // Check if key expired
    const now = new Date();
    const expiresAt = new Date(keyData.expires_at);
    
    if (now > expiresAt) {
      console.log('❌ Key expired');
      
      // Optional: Delete expired key
      await supabase
        .from('keys')
        .delete()
        .eq('key', key);

      return res.status(200).json({ 
        valid: false, 
        message: 'Key expired' 
      });
    }

    // Calculate time remaining
    const timeRemaining = Math.floor((expiresAt - now) / 1000);

    // Update last_validated_at and mark as used
    await supabase
      .from('keys')
      .update({ 
        last_validated_at: new Date().toISOString(),
        is_used: true
      })
      .eq('key', key);

    console.log('✅ Key validated successfully');

    return res.status(200).json({ 
      valid: true, 
      message: 'Key is valid',
      username: keyData.username,
      timeRemaining: `${Math.floor(timeRemaining / 60)} minutes`,
      expiresAt: keyData.expires_at
    });

  } catch (error) {
    console.error('❌ Server error:', error);
    return res.status(500).json({ 
      valid: false, 
      message: 'Internal server error',
      error: error.message
    });
  }
}
