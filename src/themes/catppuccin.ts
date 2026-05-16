// Catppuccin Theme Definitions
// https://github.com/catppuccin/catppuccin

export type ThemeFlavor = 'latte' | 'frappe' | 'macchiato' | 'mocha' | 'system';

export interface ThemeColors {
  name: string;
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  accent: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  surface0: string;
  surface1: string;
  surface2: string;
  overlay0: string;
  overlay1: string;
  overlay2: string;
  blue: string;
  lavender: string;
  sapphire: string;
  green: string;
  yellow: string;
  peach: string;
  maroon: string;
  red: string;
  pink: string;
  mauve: string;
  flamingo: string;
  rosewater: string;
}

// 🌻 Latte (Light)
export const latte: ThemeColors = {
  name: 'Catppuccin Latte',
  bgPrimary: '#eff1f5',      // base
  bgSecondary: '#e6e9ef',    // mantle
  bgTertiary: '#dce0e8',     // crust
  accent: '#8839ef',         // mauve
  textPrimary: '#4c4f69',    // text
  textSecondary: '#6c6f85',  // subtext0
  border: '#ccd0da',         // surface0
  surface0: '#ccd0da',
  surface1: '#bcc0cc',
  surface2: '#acb0be',
  overlay0: '#9ca0b0',
  overlay1: '#8c8fa1',
  overlay2: '#7c7f93',
  blue: '#1e66f5',
  lavender: '#7287fd',
  sapphire: '#209fb5',
  green: '#40a02b',
  yellow: '#df8e1d',
  peach: '#fe640b',
  maroon: '#e64553',
  red: '#d20f39',
  pink: '#ea76cb',
  mauve: '#8839ef',
  flamingo: '#dd7878',
  rosewater: '#dc8a78',
};

// 🪴 Frappé (Dark)
export const frappe: ThemeColors = {
  name: 'Catppuccin Frappé',
  bgPrimary: '#303446',      // base
  bgSecondary: '#292c3c',    // mantle
  bgTertiary: '#232634',     // crust
  accent: '#ca9ee6',         // mauve
  textPrimary: '#c6d0f5',    // text
  textSecondary: '#a5adce',  // subtext0
  border: '#414559',         // surface0
  surface0: '#414559',
  surface1: '#51576d',
  surface2: '#626880',
  overlay0: '#737994',
  overlay1: '#838ba7',
  overlay2: '#949cbb',
  blue: '#8caaee',
  lavender: '#babbf1',
  sapphire: '#85c1dc',
  green: '#a6d189',
  yellow: '#e5c890',
  peach: '#ef9f76',
  maroon: '#ea999c',
  red: '#e78284',
  pink: '#f4b8e4',
  mauve: '#ca9ee6',
  flamingo: '#eebebe',
  rosewater: '#f2d5cf',
};

// 🌺 Macchiato (Dark)
export const macchiato: ThemeColors = {
  name: 'Catppuccin Macchiato',
  bgPrimary: '#24273a',      // base
  bgSecondary: '#1e2030',    // mantle
  bgTertiary: '#181926',     // crust
  accent: '#c6a0f6',         // mauve
  textPrimary: '#cad3f5',    // text
  textSecondary: '#a5adcb',  // subtext0
  border: '#363a4f',         // surface0
  surface0: '#363a4f',
  surface1: '#494d64',
  surface2: '#5b6078',
  overlay0: '#6e738d',
  overlay1: '#8087a2',
  overlay2: '#939ab7',
  blue: '#8aadf4',
  lavender: '#b7bdf8',
  sapphire: '#7dc4e4',
  green: '#a6da95',
  yellow: '#eed49f',
  peach: '#f5a97f',
  maroon: '#ee99a0',
  red: '#ed8796',
  pink: '#f5bde6',
  mauve: '#c6a0f6',
  flamingo: '#f0c6c6',
  rosewater: '#f4dbd6',
};

// 🌿 Mocha (Dark)
export const mocha: ThemeColors = {
  name: 'Catppuccin Mocha',
  bgPrimary: '#1e1e2e',      // base
  bgSecondary: '#181825',      // mantle
  bgTertiary: '#11111b',       // crust
  accent: '#cba6f7',           // mauve
  textPrimary: '#cdd6f4',      // text
  textSecondary: '#a6adc8',      // subtext0
  border: '#313244',           // surface0
  surface0: '#313244',
  surface1: '#45475a',
  surface2: '#585b70',
  overlay0: '#6c7086',
  overlay1: '#7f849c',
  overlay2: '#9399b7',
  blue: '#89b4fa',
  lavender: '#b4befe',
  sapphire: '#74c7ec',
  green: '#a6e3a1',
  yellow: '#f9e2af',
  peach: '#fab387',
  maroon: '#eba0ac',
  red: '#f38ba8',
  pink: '#f5c2e7',
  mauve: '#cba6f7',
  flamingo: '#f2cdcd',
  rosewater: '#f5e0dc',
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
  
  const saved = localStorage.getItem('kimiflux-theme');
  if (saved && (saved === 'latte' || saved === 'frappe' || saved === 'macchiato' || saved === 'mocha' || saved === 'system')) {
    return saved as ThemeFlavor;
  }
  
  return 'system';
};

export const saveThemeFlavor = (flavor: ThemeFlavor) => {
  localStorage.setItem('kimiflux-theme', flavor);
};

export const applyTheme = (theme: ThemeColors) => {
  const root = document.documentElement;
  
  root.style.setProperty('--bg-primary', theme.bgPrimary);
  root.style.setProperty('--bg-secondary', theme.bgSecondary);
  root.style.setProperty('--bg-tertiary', theme.bgTertiary);
  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--text-primary', theme.textPrimary);
  root.style.setProperty('--text-secondary', theme.textSecondary);
  root.style.setProperty('--border', theme.border);
  root.style.setProperty('--surface0', theme.surface0);
  root.style.setProperty('--surface1', theme.surface1);
  root.style.setProperty('--surface2', theme.surface2);
  root.style.setProperty('--overlay0', theme.overlay0);
  root.style.setProperty('--overlay1', theme.overlay1);
  root.style.setProperty('--overlay2', theme.overlay2);
  root.style.setProperty('--blue', theme.blue);
  root.style.setProperty('--lavender', theme.lavender);
  root.style.setProperty('--sapphire', theme.sapphire);
  root.style.setProperty('--green', theme.green);
  root.style.setProperty('--yellow', theme.yellow);
  root.style.setProperty('--peach', theme.peach);
  root.style.setProperty('--maroon', theme.maroon);
  root.style.setProperty('--red', theme.red);
  root.style.setProperty('--pink', theme.pink);
  root.style.setProperty('--mauve', theme.mauve);
  root.style.setProperty('--flamingo', theme.flamingo);
  root.style.setProperty('--rosewater', theme.rosewater);
};

export const themeOptions: { value: ThemeFlavor; label: string; description: string; isDark: boolean | null }[] = [
  { value: 'system', label: 'System Default', description: 'Follows your OS theme preference', isDark: null },
  { value: 'latte', label: 'Catppuccin Latte', description: 'Light theme with warm pastel tones', isDark: false },
  { value: 'frappe', label: 'Catppuccin Frappé', description: 'Dark theme with medium contrast', isDark: true },
  { value: 'macchiato', label: 'Catppuccin Macchiato', description: 'Dark theme with higher contrast', isDark: true },
  { value: 'mocha', label: 'Catppuccin Mocha', description: 'Dark theme with highest contrast', isDark: true },
];
