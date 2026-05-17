// Catppuccin Theme Definitions - From https://github.com/catppuccin/freshrss
// These colors are mapped from the official FreshRSS Catppuccin themes

export type ThemeFlavor = 'latte' | 'frappe' | 'macchiato' | 'mocha' | 'system';

export interface ThemeColors {
  name: string;
  // Core backgrounds
  bgPrimary: string;    // --bg (main background)
  bgSecondary: string;  // --accent-bg (sidebar/nav)
  bgTertiary: string;   // --border/crust (elevated surfaces)
  // Text colors
  textPrimary: string;  // --text
  textSecondary: string; // --text-light
  // Accents
  accent: string;       // --accent
  accentLight: string; // --accent-light
  // Borders
  border: string;
  // Supporting
  code: string;
  codeBg: string;
  alert: string;
  alertBg: string;
  hover: string;
  surface0: string;
  surface1: string;
  surface2: string;
}

// 🌻 Latte (Light)
export const latte: ThemeColors = {
  name: 'Catppuccin Latte',
  bgPrimary: '#eff1f5',        // base
  bgSecondary: '#e6e9ef',      // mantle/accent-bg
  bgTertiary: '#ccd0da',       // surface0
  textPrimary: '#4c4f69',     // text
  textSecondary: '#5c5f77',   // subtext1
  accent: '#8839ef',            // mauve - brighter for light theme
  accentLight: '#d20f39',     // red
  border: '#ccd0da',          // surface0
  code: '#fe640b',            // peach
  codeBg: '#e6e9ef',          // mantle
  alert: '#40a02b',           // green
  alertBg: '#209fb5',         // sapphire
  hover: '#acb0be',           // surface2
  surface0: '#ccd0da',
  surface1: '#bcc0cc',
  surface2: '#acb0be',
};

// 🪴 Frappé (Dark)
export const frappe: ThemeColors = {
  name: 'Catppuccin Frappé',
  bgPrimary: '#303446',      // base
  bgSecondary: '#292c3c',      // mantle
  bgTertiary: '#232634',     // crust
  textPrimary: '#c6d0f5',    // text
  textSecondary: '#a5adce',   // subtext0
  accent: '#ca9ee6',          // mauve
  accentLight: '#e78284',     // red
  border: '#414559',          // surface0
  code: '#ef9f76',            // peach
  codeBg: '#414559',          // surface0
  alert: '#a6d189',           // green
  alertBg: '#85c1dc',         // sapphire
  hover: '#626880',           // surface2
  surface0: '#414559',
  surface1: '#51576d',
  surface2: '#626880',
};

// 🌺 Macchiato (Dark)
export const macchiato: ThemeColors = {
  name: 'Catppuccin Macchiato',
  bgPrimary: '#24273a',        // base
  bgSecondary: '#1e2030',      // mantle
  bgTertiary: '#181926',       // crust
  textPrimary: '#cad3f5',     // text
  textSecondary: '#a5adcb',   // subtext0
  accent: '#c6a0f6',          // mauve
  accentLight: '#ed8796',     // red
  border: '#363a4f',          // surface0
  code: '#f5a97f',            // peach
  codeBg: '#363a4f',          // surface0
  alert: '#a6da95',           // green
  alertBg: '#7dc4e4',         // sapphire
  hover: '#5b6078',           // surface2
  surface0: '#363a4f',
  surface1: '#494d64',
  surface2: '#5b6078',
};

// 🌿 Mocha (Dark)
export const mocha: ThemeColors = {
  name: 'Catppuccin Mocha',
  bgPrimary: '#1e1e2e',       // base
  bgSecondary: '#181825',       // mantle
  bgTertiary: '#11111b',        // crust
  textPrimary: '#cdd6f4',     // text
  textSecondary: '#a6adc8',   // subtext0
  accent: '#cba6f7',            // mauve
  accentLight: '#f38ba8',     // red
  border: '#313244',            // surface0
  code: '#fab387',              // peach
  codeBg: '#313244',            // surface0
  alert: '#a6e3a1',             // green
  alertBg: '#74c7ec',           // sapphire
  hover: '#585b70',             // surface1
  surface0: '#313244',
  surface1: '#45475a',
  surface2: '#585b70',
};

export const themes: Record<Exclude<ThemeFlavor, 'system'>, ThemeColors> = {
  latte,
  frappe,
  macchiato,
  mocha,
};

export const getThemeByFlavor = (flavor: ThemeFlavor): ThemeColors => {
  if (flavor === 'system') {
    return getSystemTheme();
  }
  return themes[flavor];
};

export const getSystemTheme = (): ThemeColors => {
  if (typeof window === 'undefined') {
    return mocha; // Default for SSR
  }
  
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? mocha : latte;
};

export const getDefaultThemeFlavor = (): ThemeFlavor => {
  if (typeof window === 'undefined') {
    return 'system';
  }
  
  const saved = localStorage.getItem('fluxpane-theme');
  if (saved && (saved === 'latte' || saved === 'frappe' || saved === 'macchiato' || saved === 'mocha' || saved === 'system')) {
    return saved as ThemeFlavor;
  }
  
  return 'system';
};

export const saveThemeFlavor = (flavor: ThemeFlavor) => {
  localStorage.setItem('fluxpane-theme', flavor);
};

export const applyTheme = (theme: ThemeColors) => {
  const root = document.documentElement;
  
  // Core backgrounds
  root.style.setProperty('--bg-primary', theme.bgPrimary);
  root.style.setProperty('--bg-secondary', theme.bgSecondary);
  root.style.setProperty('--bg-tertiary', theme.bgTertiary);
  
  // Text colors
  root.style.setProperty('--text-primary', theme.textPrimary);
  root.style.setProperty('--text-secondary', theme.textSecondary);
  
  // Accents
  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--accent-light', theme.accentLight);
  
  // Border
  root.style.setProperty('--border', theme.border);
  
  // Supporting
  root.style.setProperty('--code', theme.code);
  root.style.setProperty('--code-bg', theme.codeBg);
  root.style.setProperty('--alert', theme.alert);
  root.style.setProperty('--alert-bg', theme.alertBg);
  root.style.setProperty('--hover', theme.hover);
  root.style.setProperty('--surface0', theme.surface0);
  root.style.setProperty('--surface1', theme.surface1);
  root.style.setProperty('--surface2', theme.surface2);
};

export const themeOptions: { value: ThemeFlavor; label: string; description: string; isDark: boolean | null }[] = [
  { value: 'system', label: 'System Default', description: 'Follows your OS theme preference', isDark: null },
  { value: 'latte', label: 'Catppuccin Latte', description: 'Light theme with warm pastel tones', isDark: false },
  { value: 'frappe', label: 'Catppuccin Frappé', description: 'Dark theme with medium contrast', isDark: true },
  { value: 'macchiato', label: 'Catppuccin Macchiato', description: 'Dark theme with higher contrast', isDark: true },
  { value: 'mocha', label: 'Catppuccin Mocha', description: 'Dark theme with highest contrast', isDark: true },
];
