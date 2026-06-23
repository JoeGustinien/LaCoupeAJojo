import { useState, useEffect, useRef } from 'react';

export function useApi(fetchFn, interval = null) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fnRef = useRef(fetchFn);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const result = await fnRef.current();
        if (!cancelled) { setData(result); setError(null); setLoading(false); }
      } catch (e) {
        if (!cancelled) { setError(e.message); setLoading(false); }
      }
    };

    load();
    if (!interval) return () => { cancelled = true; };
    const id = setInterval(load, interval);
    return () => { cancelled = true; clearInterval(id); };
  }, [interval]);

  return { data, loading, error };
}
