interface CategoryGroup {
  category: { id: number; title: string };
  feeds: { id: number; title: string; category: { id: number } }[];
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
        <h1>🗞️ KimiFlux</h1>
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
        {filteredCategories.map(({ category, feeds }) => (
          <div key={category.id} className="category">
            <div className="category-title">{category.title}</div>
            {feeds.map((feed) => (
              <div
                key={feed.id}
                className={`feed-item ${selectedFeedId === feed.id ? 'active' : ''} ${unreadCounts[feed.id] > 0 ? 'unread' : ''}`}
                onClick={() => onFeedSelect(feed.id, feed.title)}
              >
                <span className="feed-icon">
                  {feed.title.charAt(0).toUpperCase()}
                </span>
                <span className="feed-name">{feed.title}</span>
                <span className="feed-count">
                  {unreadCounts[feed.id] > 0 ? unreadCounts[feed.id] : 0}
                </span>
              </div>
            ))}
          </div>
        ))}
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
