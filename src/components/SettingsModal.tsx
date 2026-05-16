import { useState } from 'react';

interface Props {
  onSave: (url: string, key: string) => void;
  onClose: () => void;
  initialUrl?: string;
  initialKey?: string;
}

export default function SettingsModal({ onSave, onClose, initialUrl, initialKey }: Props) {
  const [url, setUrl] = useState(initialUrl || '');
  const [key, setKey] = useState(initialKey || '');
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setError('');

    try {
      // Test the connection by making a simple API call
      const response = await fetch(`${url}/v1/me`, {
        headers: { 'X-Auth-Token': key },
      });

      if (response.ok) {
        onSave(url, key);
      } else if (response.status === 401) {
        setError('Invalid API key. Please check your credentials.');
      } else {
        setError(`Connection failed: ${response.statusText}`);
      }
    } catch {
      setError('Failed to connect. Please check the URL and make sure Miniflux is accessible.');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>🔧 Miniflux Settings</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.9rem' }}>
          Enter your Miniflux server details to connect.
        </p>
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
            <label>Server URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://miniflux.example.com"
              required
            />
          </div>
          <div className="form-group">
            <label>API Key</label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="your-api-key"
              required
            />
            <span style={{ fontSize: '0.8rem', color: 'var(--overlay0)', marginTop: '5px', display: 'block' }}>
              Find this in Settings → API Keys in your Miniflux web interface
            </span>
          </div>
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              style={{ display: initialUrl ? 'block' : 'none' }}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={testing}>
              {testing ? 'Connecting...' : 'Connect'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
