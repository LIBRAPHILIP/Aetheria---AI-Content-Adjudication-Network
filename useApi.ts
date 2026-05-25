import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';

interface UseApiOptions {
  skip?: boolean;
  cacheKey?: string;
  cacheDuration?: number; // ms
}

const cache = new Map<string, { data: unknown; timestamp: number }>();

export function useApi<T>(
  endpoint: string,
  options: UseApiOptions = {}
) {
  const { skip = false, cacheKey, cacheDuration = 60_000 } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState<Error | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (skip) {
      setLoading(false);
      return;
    }

    // Check cache
    if (cacheKey && cache.has(cacheKey)) {
      const cached = cache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < cacheDuration) {
        setData(cached.data as T);
        setLoading(false);
        return;
      }
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    api
      .get<T>(endpoint, { signal: controller.signal, skipErrorToast: true })
      .then((res) => {
        if (!controller.signal.aborted) {
          setData(res);
          if (cacheKey) {
            cache.set(cacheKey, { data: res, timestamp: Date.now() });
          }
          setError(null);
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setError(err as Error);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [endpoint, skip, cacheKey, cacheDuration]);

  const refetch = async () => {
    setLoading(true);
    try {
      const res = await api.get<T>(endpoint);
      setData(res);
      setError(null);
      if (cacheKey) cache.set(cacheKey, { data: res, timestamp: Date.now() });
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
}
