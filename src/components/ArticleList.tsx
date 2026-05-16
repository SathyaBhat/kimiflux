import type { Entry } from '../types/miniflux';

interface Props {
  entries: Entry[];
  loading: boolean;
  title: string;
  count: number;
  onEntrySelect: (entry: Entry) => void;
  onRefresh: () => void;
  onMarkAllRead: () => void;
  showAllPosts: boolean;
  onToggleShowAll: () => void;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

function stripHtml(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

export default function ArticleList({
  entries,
  loading,
  title,
  count,
  onEntrySelect,
  onRefresh,
  onMarkAllRead,
  showAllPosts,
  onToggleShowAll,
}: Props) {
  return (
    <main className="main-content">
      <div className="toolbar">
        <div className="search-box">
          <input type="text" placeholder="Search articles..." />
        </div>
        <button className="btn btn-secondary" onClick={onRefresh}>🔄 Refresh</button>
        <button className="btn btn-secondary" onClick={onMarkAllRead}>✓ Mark All Read</button>
        <button 
          className={`btn ${showAllPosts ? 'btn-primary' : 'btn-secondary'}`} 
          onClick={onToggleShowAll}
          title={showAllPosts ? 'Showing all posts' : 'Showing unread only'}
        >
          {showAllPosts ? '📄 All Posts' : '🔴 Unread Only'}
        </button>
      </div>

      <div className="articles-list scrollbar">
        <div className="articles-header">
          <h2>{title}</h2>
          <span className="articles-count">{count} articles</span>
        </div>

        {loading && <div className="loading">Loading...</div>}

        {!loading && entries.length === 0 && (
          <div className="empty-state">
            <h3>No articles found</h3>
            <p>All caught up! Check back later for new content.</p>
          </div>
        )}

        {!loading && entries.map((entry) => (
          <article
            key={entry.id}
            className={`article-card ${entry.status === 'read' ? 'read' : ''}`}
            onClick={() => onEntrySelect(entry)}
          >
            <div className="article-header">
              <span className="article-feed">{entry.feed.title}</span>
              <span className="article-date">{formatDate(entry.published_at)}</span>
              {entry.status === 'unread' && <span>🔴</span>}
            </div>
            <h3 className="article-title">{entry.title}</h3>
            {entry.content && (
              <p className="article-excerpt">{stripHtml(entry.content)}</p>
            )}
          </article>
        ))}
      </div>
    </main>
  );
}
