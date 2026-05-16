import { useTheme, ThemeProvider } from '../hooks/useTheme';
import { themeOptions, ThemeFlavor } from '../themes/catppuccin';

interface ThemeSettingsProps {
  onClose?: () => void;
}

function ThemeSettingsContent({ onClose }: ThemeSettingsProps) {
  const { flavor, setFlavor, theme, isDark } = useTheme();

  const handleThemeChange = (newFlavor: ThemeFlavor) => {
    setFlavor(newFlavor);
  };

  return (
    <div className="theme-settings">
      <div className="theme-settings-header">
        <h3>🎨 Theme Settings</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '5px' }}>
          Choose your preferred color scheme
        </p>
      </div>

      <div className="theme-preview" style={{
        background: theme.bgSecondary,
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
        border: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '12px',
            background: `linear-gradient(135deg, ${theme.bgPrimary} 50%, ${theme.accent} 50%)`,
            border: '2px solid var(--border)',
          }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{theme.name}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              {isDark ? 'Dark Theme' : 'Light Theme'}
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div 
            title="Background Primary"
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '6px',
              background: theme.bgPrimary,
              border: '1px solid var(--border)',
            }} 
          />
          <div 
            title="Background Secondary"
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '6px',
              background: theme.bgSecondary,
              border: '1px solid var(--border)',
            }} 
          />
          <div 
            title="Accent"
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '6px',
              background: theme.accent,
            }} 
          />
          <div 
            title="Blue"
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '6px',
              background: theme.blue,
            }} 
          />
          <div 
            title="Green"
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '6px',
              background: theme.green,
            }} 
          />
          <div 
            title="Red"
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '6px',
              background: theme.red,
            }} 
          />
          <div 
            title="Yellow"
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '6px',
              background: theme.yellow,
            }} 
          />
        </div>
      </div>

      <div className="theme-options">
        {themeOptions.map((option) => (
          <label
            key={option.value}
            className={`theme-option ${flavor === option.value ? 'active' : ''}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              borderRadius: '8px',
              cursor: 'pointer',
              border: '1px solid',
              borderColor: flavor === option.value ? 'var(--accent)' : 'var(--border)',
              background: flavor === option.value ? 'var(--bg-tertiary)' : 'transparent',
              marginBottom: '10px',
              transition: 'all 0.2s',
            }}
          >
            <input
              type="radio"
              name="theme"
              value={option.value}
              checked={flavor === option.value}
              onChange={() => handleThemeChange(option.value)}
              style={{ cursor: 'pointer' }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, marginBottom: '2px' }}>
                {option.label}
                {option.isDark === null && (
                  <span style={{
                    marginLeft: '8px',
                    fontSize: '0.75rem',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-secondary)',
                  }}>
                    Auto
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {option.description}
              </div>
            </div>
            {option.isDark !== null && (
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '4px',
                background: option.isDark ? '#1e1e2e' : '#eff1f5',
                border: '1px solid var(--border)',
              }} title={option.isDark ? 'Dark' : 'Light'} />
            )}
          </label>
        ))}
      </div>

      {onClose && (
        <div className="theme-settings-actions" style={{ marginTop: '20px' }}>
          <button className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      )}
    </div>
  );
}

// Wrapper that provides ThemeContext for standalone usage
export default function ThemeSettings(props: ThemeSettingsProps) {
  return (
    <ThemeProvider>
      <ThemeSettingsContent {...props} />
    </ThemeProvider>
  );
}

// This version assumes ThemeProvider is already set up (use in App)
export function ThemeSettingsInline(props: ThemeSettingsProps) {
  return <ThemeSettingsContent {...props} />;
}