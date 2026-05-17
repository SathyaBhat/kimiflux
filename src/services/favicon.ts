// Favicon service for fetching and caching feed favicons

const FAVICON_CACHE_KEY = 'fluxpane-favicon-cache';
const FAVICON_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

interface FaviconCacheEntry {
  url: string;
  timestamp: number;
}

interface FaviconCache {
  [siteUrl: string]: FaviconCacheEntry;
}

class FaviconService {
  private cache: FaviconCache = {};
  private pendingRequests: Map<string, Promise<string | null>> = new Map();

  constructor() {
    this.loadCache();
  }

  private loadCache(): void {
    try {
      const cached = localStorage.getItem(FAVICON_CACHE_KEY);
      if (cached) {
        this.cache = JSON.parse(cached);
      }
    } catch {
      this.cache = {};
    }
  }

  private saveCache(): void {
    try {
      localStorage.setItem(FAVICON_CACHE_KEY, JSON.stringify(this.cache));
    } catch {
      // Ignore storage errors
    }
  }

  private isCacheValid(entry: FaviconCacheEntry): boolean {
    return Date.now() - entry.timestamp < FAVICON_CACHE_DURATION;
  }

  private extractDomain(siteUrl: string): string {
    try {
      const url = new URL(siteUrl);
      return url.hostname;
    } catch {
      return siteUrl;
    }
  }

  private async fetchFaviconFromGoogle(domain: string): Promise<string> {
    // Use Google's favicon service
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32`;
  }

  async getFavicon(siteUrl: string): Promise<string | null> {
    if (!siteUrl) return null;

    const domain = this.extractDomain(siteUrl);
    
    // Check cache first
    const cached = this.cache[siteUrl];
    if (cached && this.isCacheValid(cached)) {
      return cached.url;
    }

    // Check if there's already a pending request for this site
    if (this.pendingRequests.has(siteUrl)) {
      return this.pendingRequests.get(siteUrl)!;
    }

    // Start a new request
    const request = this.fetchFavicon(siteUrl, domain);
    this.pendingRequests.set(siteUrl, request);

    try {
      const result = await request;
      this.pendingRequests.delete(siteUrl);
      return result;
    } catch {
      this.pendingRequests.delete(siteUrl);
      return null;
    }
  }

  private async fetchFavicon(siteUrl: string, domain: string): Promise<string> {
    // Try Google favicon service first (most reliable)
    const googleUrl = await this.fetchFaviconFromGoogle(domain);
    
    // Cache the result
    this.cache[siteUrl] = {
      url: googleUrl,
      timestamp: Date.now(),
    };
    this.saveCache();
    
    return googleUrl;
  }

  getCachedFavicon(siteUrl: string): string | null {
    const cached = this.cache[siteUrl];
    if (cached && this.isCacheValid(cached)) {
      return cached.url;
    }
    return null;
  }

  clearCache(): void {
    this.cache = {};
    localStorage.removeItem(FAVICON_CACHE_KEY);
  }

  // Preload favicons for multiple feeds
  async preloadFavicons(siteUrls: string[]): Promise<void> {
    const uncachedUrls = siteUrls.filter(url => {
      const cached = this.cache[url];
      return !cached || !this.isCacheValid(cached);
    });

    // Fetch favicons in parallel, but limit concurrency
    const batchSize = 5;
    for (let i = 0; i < uncachedUrls.length; i += batchSize) {
      const batch = uncachedUrls.slice(i, i + batchSize);
      await Promise.all(batch.map(url => this.getFavicon(url)));
    }
  }
}

export const faviconService = new FaviconService();