import { useState } from 'react';
import { useFavicon } from '../hooks/useFavicon';

interface CategoryGroup {
  category: { id: number; title: string };
  feeds: { id: number; title: string; category: { id: number }; site_url: string }[];
}

interface Props {
  categories: CategoryGroup[];
  unreadCounts: Record<number, number>;
  totalUnread: number;
  onFeedSelect: (feedId: number | null, feedTitle: string) => void;
  onSettings: () => void;
  onThemeSettings?: () => void;
  selectedFeedId: number | null;
  showUnreadOnly: boolean;
  onToggleUnreadOnly: () => void;
}

function FeedIcon({ siteUrl, title }: { siteUrl: string; title: string }) {
  const { faviconUrl } = useFavicon(siteUrl);
  const [error, setError] = useState(false);

  if (faviconUrl && !error) {
    return (
      <img
        src={faviconUrl}
        alt=""
        className="feed-favicon"
        onError={() => setError(true)}
      />
    );
  }

  return <span className="feed-favicon-fallback">{title.charAt(0).toUpperCase()}</span>;
}

export default function Sidebar({ 
  categories, 
  unreadCounts, 
  totalUnread,
  onFeedSelect, 
  onSettings, 
  onThemeSettings,
  selectedFeedId,
  showUnreadOnly,
  onToggleUnreadOnly,
}: Props) {
  const [collapsedCategories, setCollapsedCategories] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem('fluxpane-collapsed-categories');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const toggleCategory = (categoryId: number) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      localStorage.setItem('fluxpane-collapsed-categories', JSON.stringify([...next]));
      return next;
    });
  };

  // Filter feeds based on showUnreadOnly setting
  const filteredCategories = showUnreadOnly
    ? categories
        .map(({ category, feeds }) => ({
          category,
          feeds: feeds.filter(feed => (unreadCounts[feed.id] || 0) > 0),
        }))
        .filter(({ feeds }) => feeds.length > 0)
    : categories;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>🗞️ FluxPane</h1>
        <div className="feed-item active" onClick={() => onFeedSelect(null, 'All Unread')}>
          <span className="feed-icon">📥</span>
          <span className="feed-name">All Unread</span>
          {totalUnread > 0 && <span className="feed-count">{totalUnread}</span>}
        </div>
        <div className="feed-item" onClick={() => onFeedSelect(-1, 'Starred')}>
          <span className="feed-icon">⭐</span>
          <span className="feed-name">Starred</span>
        </div>
        
        {/* Unread Only Toggle */}
        <div className="sidebar-toggle" onClick={onToggleUnreadOnly}>
          <div className={`toggle-switch ${showUnreadOnly ? 'active' : ''}`}>
            <div className="toggle-thumb"></div>
          </div>
          <span className="toggle-label">Unread only</span>
        </div>
      </div>

      <div className="feed-categories scrollbar">
        {filteredCategories.map(({ category, feeds }) => {
          const isCollapsed = collapsedCategories.has(category.id);
          return (
            <div key={category.id} className="category">
              <div
                className="category-title"
                onClick={() => toggleCategory(category.id)}
              >
                <span className="category-chevron">{isCollapsed ? '▶' : '▼'}</span>
                {category.title}
              </div>
              {!isCollapsed && feeds.map((feed) => (
                <div
                  key={feed.id}
                  className={`feed-item ${selectedFeedId === feed.id ? 'active' : ''} ${unreadCounts[feed.id] > 0 ? 'unread' : ''}`}
                  onClick={() => onFeedSelect(feed.id, feed.title)}
                >
                  <span className="feed-icon-wrapper">
                    <FeedIcon siteUrl={feed.site_url} title={feed.title} />
                  </span>
                  <span className="feed-name">{feed.title}</span>
                  <span className="feed-count">
                    {unreadCounts[feed.id] > 0 ? unreadCounts[feed.id] : 0}
                  </span>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <div style={{ padding: '15px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button className="btn btn-secondary" style={{ width: '100%' }} onClick={onSettings}>
          ⚙️ Settings
        </button>
        {onThemeSettings && (
          <button className="btn btn-secondary" style={{ width: '100%' }} onClick={onThemeSettings}>
            🎨 Theme
          </button>
        )}
      </div>
    </aside>
  );
}
