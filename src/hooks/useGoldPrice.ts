import { useEffect, useRef, useState } from 'react';
import { fetchGoldPrice } from '@/services/api';
import type { GoldPrice } from '@/types/types';

export function useGoldPrice(refreshIntervalMs = 30000) {
  const [goldPrice, setGoldPrice] = useState<GoldPrice | null>(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = async () => {
    const price = await fetchGoldPrice();
    if (price) setGoldPrice(price);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    intervalRef.current = setInterval(refresh, refreshIntervalMs);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [refreshIntervalMs]);

  return { goldPrice, loading, refresh };
}
