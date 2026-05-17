import { useState, useEffect, useCallback, useRef } from 'react';
import { faviconService } from '../services/favicon';

interface UseFaviconOptions {
  preload?: boolean;
}

export function useFavicon(siteUrl: string | undefined, options: UseFaviconOptions = {}) {
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  const fetchFavicon = useCallback(async () => {
    if (!siteUrl) {
      setFaviconUrl(null);
      return;
    }

    // Check if already cached
    const cached = faviconService.getCachedFavicon(siteUrl);
    if (cached) {
      setFaviconUrl(cached);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = await faviconService.getFavicon(siteUrl);
      if (mountedRef.current) {
        setFaviconUrl(url);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err : new Error('Failed to fetch favicon'));
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [siteUrl]);

  useEffect(() => {
    mountedRef.current = true;
    
    if (options.preload) {
      fetchFavicon();
    } else {
      // Check cache first without fetching
      const cached = siteUrl ? faviconService.getCachedFavicon(siteUrl) : null;
      setFaviconUrl(cached);
    }

    return () => {
      mountedRef.current = false;
    };
  }, [siteUrl, options.preload, fetchFavicon]);

  const refresh = useCallback(() => {
    fetchFavicon();
  }, [fetchFavicon]);

  return { faviconUrl, loading, error, refresh };
}

// Hook for preloading multiple favicons
export function usePreloadFavicons() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const preload = useCallback(async (siteUrls: string[]) => {
    setLoading(true);
    setProgress(0);

    try {
      await faviconService.preloadFavicons(siteUrls);
    } finally {
      setLoading(false);
      setProgress(100);
    }
  }, []);

  return { preload, loading, progress };
}