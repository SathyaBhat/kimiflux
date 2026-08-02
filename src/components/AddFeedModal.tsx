import { useState } from 'react';
import type { Category } from '../types/miniflux';
import { miniflux } from '../services/miniflux';

interface Props {
  categories: Category[];
  onClose: () => void;
  onAdded: () => void;
}

export default function AddFeedModal({ categories, onClose, onAdded }: Props) {
  const [feedUrl, setFeedUrl] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await miniflux.createFeed(feedUrl.trim(), categoryId ? Number(categoryId) : undefined);
      onAdded();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add feed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="modal">
        <h3>➕ Add Feed</h3>
        {error && (
          <div style={{
            color: 'var(--red)',
            background: 'color-mix(in srgb, var(--red) 10%, transparent)',
            padding: '10px',
            borderRadius: '8px',
            marginBottom: '15px',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Feed URL</label>
            <input
              type="url"
              value={feedUrl}
              onChange={(e) => setFeedUrl(e.target.value)}
              placeholder="https://example.com/feed.xml"
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Category (optional)</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">Use Miniflux default</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.title}</option>
              ))}
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting || !feedUrl.trim()}>
              {submitting ? 'Adding...' : 'Add Feed'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
