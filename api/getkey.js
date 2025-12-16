import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

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
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
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

    console.log('📥 Generate key request:', { hwid, username });

    // Check if user already has a valid key
    const { data: existingKeys, error: checkError } = await supabase
      .from('keys')
      .select('key, expires_at')
      .eq('hwid', hwid)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (checkError) {
      console.error('❌ Error checking existing keys:', checkError);
    }

    // If user already has valid key, return it
    if (existingKeys && existingKeys.length > 0) {
      const existingKey = existingKeys[0];
      const timeRemaining = Math.floor(
        (new Date(existingKey.expires_at) - new Date()) / 1000
      );

      console.log('ℹ️ Returning existing valid key');

      return res.status(200).json({
        success: true,
        key: existingKey.key,
        message: 'Using existing valid key',
        expiresIn: `${Math.floor(timeRemaining / 60)} minutes`,
        isNew: false
      });
    }

    // Generate new key
    const key = crypto
      .createHash('sha256')
      .update(`${hwid}-${username}-${Date.now()}-${Math.random()}`)
      .digest('hex')
      .substring(0, 32);

    // Calculate expiry time (1 hour from now)
    const expiresAt = new Date(Date.now() + 3600000).toISOString();

    // Insert key into Supabase
    const { data, error } = await supabase
      .from('keys')
      .insert([{
        key: key,
        hwid: hwid,
        username: username,
        expires_at: expiresAt
      }])
      .select();

    if (error) {
      console.error('❌ Supabase insert error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to save key to database',
        error: error.message
      });
    }

    console.log('✅ New key generated and saved:', key);

    return res.status(200).json({
      success: true,
      key: key,
      message: 'Key generated successfully',
      expiresIn: '1 hour',
      isNew: true
    });

  } catch (error) {
    console.error('❌ Server error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}
