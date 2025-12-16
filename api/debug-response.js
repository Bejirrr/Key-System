import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    // Check env vars
    const url = process.env.SUPABASE_URL?.trim();
    const key = process.env.SUPABASE_SERVICE_KEY?.trim();
    
    if (!url || !key) {
      return res.status(500).json({
        error: 'Missing environment variables',
        hasUrl: !!url,
        hasKey: !!key
      });
    }

    // Try to create client
    const supabase = createClient(url, key);
    
    // Try simple query
    const { data, error } = await supabase
      .from('keys')
      .select('count')
      .limit(1);

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        details: error
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Supabase connected successfully!',
      envVarsOk: true
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}
