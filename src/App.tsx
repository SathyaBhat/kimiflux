import { useState, useEffect, useCallback } from 'react';
import type { Feed, Category, Entry, FeedCounters } from './types/miniflux';
import { miniflux } from './services/miniflux';
import { faviconService } from './services/favicon';
import { useTheme } from './hooks/useTheme';
import { ThemeSettingsInline } from './components/ThemeSettings';
import SettingsModal from './components/SettingsModal';
import Sidebar from './components/Sidebar';
import ArticleList from './components/ArticleList';
import ArticleView from './components/ArticleView';

interface Config {
  baseUrl: string;
  apiKey: string;
}

function App() {
  const { theme } = useTheme();
  const [config, setConfig] = useState<Config | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showThemeSettings, setShowThemeSettings] = useState(false);
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [feedCounters, setFeedCounters] = useState<FeedCounters | null>(null);
  const [selectedFeedId, setSelectedFeedId] = useState<number | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(false);
  const [totalEntries, setTotalEntries] = useState(0);
  const [activeFeedTitle, setActiveFeedTitle] = useState('All Unread');
  const [showUnreadOnly, setShowUnreadOnly] = useState(() => {
    return localStorage.getItem('fluxpane-show-unread-only') === 'true';
  });
  const [showAllPosts, setShowAllPosts] = useState(false);

  // Apply the theme colors to CSS variables on mount
  useEffect(() => {
    // Theme is applied via ThemeProvider, but we can add any additional
    // app-specific CSS variables here if needed
  }, [theme]);

  // Load config from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('fluxpane-config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig(parsed);
        miniflux.init(parsed);
      } catch {
        setShowSettings(true);
      }
    } else {
      setShowSettings(true);
    }
  }, []);

  // Load feeds, categories, and counters when config is set
  const loadFeeds = useCallback(async () => {
    if (!config) return;
    try {
      const [feedsData, categoriesData, countersData] = await Promise.all([
        miniflux.getFeeds(),
        miniflux.getCategories(),
        miniflux.getFeedCounters(),
      ]);
      setFeeds(feedsData);
      setCategories(categoriesData);
      setFeedCounters(countersData);
    } catch (err) {
      console.error('Failed to load feeds:', err);
    }
  }, [config]);

  // Preload favicons when feeds change
  useEffect(() => {
    if (feeds.length > 0) {
      const siteUrls = feeds.map(f => f.site_url).filter(Boolean);
      faviconService.preloadFavicons(siteUrls).catch(console.error);
    }
  }, [feeds]);

  // Load entries with optional status filter
  const loadEntries = useCallback(async (feedId?: number, status?: 'read' | 'unread') => {
    if (!config) return;
    setLoading(true);
    try {
      const data = await miniflux.getEntries(feedId || undefined, status || 'unread');
      setEntries(data.entries);
      setTotalEntries(data.total);
    } catch (err) {
      console.error('Failed to load entries:', err);
    } finally {
      setLoading(false);
    }
  }, [config]);

  useEffect(() => {
    if (config) {
      loadFeeds();
      // Initial load - show unread only by default
      loadEntries(undefined, 'unread');
    }
  }, [config, loadFeeds, loadEntries]);

  // Refresh counters/feeds on visibility change and every 5 minutes
  useEffect(() => {
    if (!config) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadFeeds();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    const pollId = setInterval(loadFeeds, 5 * 60 * 1000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(pollId);
    };
  }, [config, loadFeeds]);

  const handleSaveConfig = (url: string, key: string) => {
    const newConfig = { baseUrl: url, apiKey: key };
    localStorage.setItem('fluxpane-config', JSON.stringify(newConfig));
    setConfig(newConfig);
    miniflux.init(newConfig);
    setShowSettings(false);
  };

  const handleFeedSelect = (feedId: number | null, feedTitle: string) => {
    setSelectedFeedId(feedId);
    setActiveFeedTitle(feedTitle);
    // Load entries based on showAllPosts toggle
    const status = showAllPosts ? undefined : 'unread';
    loadEntries(feedId || undefined, status);
  };

  const handleEntrySelect = async (entry: Entry) => {
    setSelectedEntry(entry);
    // Mark as read if unread
    if (entry.status === 'unread') {
      try {
        await miniflux.updateEntries([entry.id], 'read');
        // Update local state
        setEntries(entries.map(e => 
          e.id === entry.id ? { ...e, status: 'read' } : e
        ));
        // Refresh counters to update sidebar
        const counters = await miniflux.getFeedCounters();
        setFeedCounters(counters);
      } catch (err) {
        console.error('Failed to mark as read:', err);
      }
    }
  };

  const handleRefresh = () => {
    const status = showAllPosts ? undefined : 'unread';
    loadFeeds();
    loadEntries(selectedFeedId || undefined, status);
  };

  const handleMarkAllRead = async () => {
    if (!selectedFeedId) return;
    try {
      await miniflux.markFeedAsRead(selectedFeedId);
      setEntries(entries.map(e => ({ ...e, status: 'read' })));
      // Refresh counters to update sidebar
      const counters = await miniflux.getFeedCounters();
      setFeedCounters(counters);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  // Toggle to show unread feeds only in sidebar
  const handleToggleUnreadOnly = () => {
    setShowUnreadOnly(prev => {
      const newValue = !prev;
      localStorage.setItem('fluxpane-show-unread-only', String(newValue));
      return newValue;
    });
  };

  // Toggle to show all posts vs unread only
  const handleToggleShowAll = () => {
    setShowAllPosts(prev => {
      const newValue = !prev;
      // Reload entries with new filter
      const status = newValue ? undefined : 'unread';
      loadEntries(selectedFeedId || undefined, status);
      return newValue;
    });
  };

  // Toggle individual entry read/unread status
  const handleToggleEntryRead = async (entryId: number, currentStatus: 'read' | 'unread') => {
    const newStatus = currentStatus === 'unread' ? 'read' : 'unread';
    try {
      await miniflux.updateEntries([entryId], newStatus);
      // Update local state
      setEntries(entries.map(e => 
        e.id === entryId ? { ...e, status: newStatus } : e
      ));
      // Refresh counters to update sidebar
      const counters = await miniflux.getFeedCounters();
      setFeedCounters(counters);
    } catch (err) {
      console.error('Failed to toggle entry status:', err);
    }
  };
  const feedsByCategory = categories.map(cat => ({
    category: cat,
    feeds: feeds.filter(f => f.category.id === cat.id).map(f => ({
      id: f.id,
      title: f.title,
      category: f.category,
      site_url: f.site_url,
    })),
  }));

  // Use feed counters from API for unread counts
  const unreadCounts: Record<number, number> = feedCounters?.unreads || {};
  
  // Calculate total unread from feed counters
  const totalUnread = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="app">
      {showSettings && (
        <SettingsModal
          onSave={handleSaveConfig}
          onClose={() => config && setShowSettings(false)}
          initialUrl={config?.baseUrl || ''}
          initialKey={config?.apiKey || ''}
        />
      )}

      {showThemeSettings && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) setShowThemeSettings(false);
        }}>
          <div className="modal" style={{ maxWidth: '450px' }}>
            <ThemeSettingsInline onClose={() => setShowThemeSettings(false)} />
          </div>
        </div>
      )}

      <Sidebar
        categories={feedsByCategory}
        unreadCounts={unreadCounts}
        totalUnread={totalUnread}
        onFeedSelect={handleFeedSelect}
        onSettings={() => setShowSettings(true)}
        onThemeSettings={() => setShowThemeSettings(true)}
        selectedFeedId={selectedFeedId}
        showUnreadOnly={showUnreadOnly}
        onToggleUnreadOnly={handleToggleUnreadOnly}
      />

      <ArticleList
        entries={entries}
        loading={loading}
        title={activeFeedTitle}
        count={totalEntries}
        onEntrySelect={handleEntrySelect}
        onRefresh={handleRefresh}
        onMarkAllRead={handleMarkAllRead}
        showAllPosts={showAllPosts}
        onToggleShowAll={handleToggleShowAll}
        onToggleEntryRead={handleToggleEntryRead}
      />

      <ArticleView
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
      />
    </div>
  );
}

export default App;
