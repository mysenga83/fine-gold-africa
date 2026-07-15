import { useEffect } from 'react';
import { supabase } from '@/db/supabase';

/**
 * Pings Supabase every 4 minutes to prevent the backend from sleeping.
 * Uses a lightweight health-check query against a small table.
 */
export default function SupabaseKeepAlive() {
  useEffect(() => {
    // Immediate first ping so the connection is warm on app load
    const ping = () => {
      supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .then(() => {/* keep-alive — result not needed */});
    };

    ping();
    // Ping every 4 minutes (240 000 ms) — well inside the typical 5-min idle timeout
    const interval = setInterval(ping, 4 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return null;
}
