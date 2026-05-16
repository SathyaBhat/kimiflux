import { useState, useEffect, useCallback } from 'react';
import type { Feed, Category, Entry, FeedCounters } from './types/miniflux';
import { miniflux } from './services/miniflux';
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
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [showAllPosts, setShowAllPosts] = useState(false);

  // Apply the theme colors to CSS variables on mount
  useEffect(() => {
    // Theme is applied via ThemeProvider, but we can add any additional
    // app-specific CSS variables here if needed
  }, [theme]);

  // Load config from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('kimiflux-config');
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

  const handleSaveConfig = (url: string, key: string) => {
    const newConfig = { baseUrl: url, apiKey: key };
    localStorage.setItem('kimiflux-config', JSON.stringify(newConfig));
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
    setShowUnreadOnly(prev => !prev);
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
  const feedsByCategory = categories.map(cat => ({
    category: cat,
    feeds: feeds.filter(f => f.category.id === cat.id),
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
      />

      <ArticleView
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
      />
    </div>
  );
}

export default App;
