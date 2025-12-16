import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  try {
    const { data, error } = await supabase
      .from('keys')
      .delete()
      .lt('expires_at', new Date().toISOString());

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: 'Cleanup completed',
      deletedCount: data?.length || 0
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
