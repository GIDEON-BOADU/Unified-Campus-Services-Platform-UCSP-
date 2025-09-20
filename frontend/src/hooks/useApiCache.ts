import { useState, useEffect, useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface UseApiCacheOptions {
  ttl?: number; // Default TTL in milliseconds (5 minutes)
  enabled?: boolean; // Whether caching is enabled
}

export function useApiCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: UseApiCacheOptions = {}
) {
  const { ttl = 5 * 60 * 1000, enabled = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map());

  const isExpired = useCallback((entry: CacheEntry<T>) => {
    return Date.now() - entry.timestamp > entry.ttl;
  }, []);

  const getCachedData = useCallback((): T | null => {
    if (!enabled) return null;
    
    const entry = cacheRef.current.get(key);
    if (entry && !isExpired(entry)) {
      return entry.data;
    }
    
    // Remove expired entry
    if (entry) {
      cacheRef.current.delete(key);
    }
    
    return null;
  }, [key, enabled, isExpired]);

  const setCachedData = useCallback((newData: T) => {
    if (!enabled) return;
    
    cacheRef.current.set(key, {
      data: newData,
      timestamp: Date.now(),
      ttl
    });
  }, [key, enabled, ttl]);

  const fetchData = useCallback(async (forceRefresh = false) => {
    // Check cache first if not forcing refresh
    if (!forceRefresh) {
      const cachedData = getCachedData();
      if (cachedData) {
        setData(cachedData);
        return cachedData;
      }
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const result = await fetcher();
      
      setData(result);
      setCachedData(result);
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [fetcher, getCachedData, setCachedData]);

  const invalidate = useCallback(() => {
    cacheRef.current.delete(key);
    setData(null);
  }, [key]);

  const clearAll = useCallback(() => {
    cacheRef.current.clear();
    setData(null);
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
    invalidate,
    clearAll,
    isCached: getCachedData() !== null
  };
}

// Hook for managing multiple cache entries
export function useApiCacheManager() {
  const cacheRef = useRef<Map<string, CacheEntry<any>>>(new Map());

  const get = useCallback(<T>(key: string): T | null => {
    const entry = cacheRef.current.get(key);
    if (entry && Date.now() - entry.timestamp < entry.ttl) {
      return entry.data;
    }
    
    if (entry) {
      cacheRef.current.delete(key);
    }
    
    return null;
  }, []);

  const set = useCallback(<T>(key: string, data: T, ttl: number = 5 * 60 * 1000) => {
    cacheRef.current.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }, []);

  const invalidate = useCallback((key: string) => {
    cacheRef.current.delete(key);
  }, []);

  const invalidatePattern = useCallback((pattern: string) => {
    const regex = new RegExp(pattern);
    for (const key of cacheRef.current.keys()) {
      if (regex.test(key)) {
        cacheRef.current.delete(key);
      }
    }
  }, []);

  const clearAll = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  const getStats = useCallback(() => {
    const entries = Array.from(cacheRef.current.entries());
    const now = Date.now();
    
    return {
      totalEntries: entries.length,
      expiredEntries: entries.filter(([, entry]) => now - entry.timestamp > entry.ttl).length,
      validEntries: entries.filter(([, entry]) => now - entry.timestamp <= entry.ttl).length,
      memoryUsage: JSON.stringify(entries).length
    };
  }, []);

  return {
    get,
    set,
    invalidate,
    invalidatePattern,
    clearAll,
    getStats
  };
}
