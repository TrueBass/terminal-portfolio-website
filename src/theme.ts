// Runtime accent themes — swap the CSS custom properties the whole 2D UI reads
// (--color-accent / --color-accent-2), so text, the header button, carets, etc.
// all recolor live. Driven by the terminal `theme` command; choice persists.

export interface Theme {
  label: string;
  accent: string;
  accent2: string;
}

export const themes: Record<string, Theme> = {
  sage: { label: "sage + pink (default)", accent: "#81a684", accent2: "#f8c7cc" },
  aurora: { label: "gold + lavender", accent: "#fbd960", accent2: "#d5b3ff" },
};

export const defaultThemeName = "sage";
const STORAGE_KEY = "accent-theme";

/** Fired on the window whenever the accent theme changes (the 3D badge listens). */
export const THEME_EVENT = "accent-theme-change";

/** Current accent colors, read live from the CSS variables. */
export function readAccents(): { accent: string; accent2: string } {
  const s = getComputedStyle(document.documentElement);
  return {
    accent: s.getPropertyValue("--color-accent").trim() || themes[defaultThemeName].accent,
    accent2: s.getPropertyValue("--color-accent-2").trim() || themes[defaultThemeName].accent2,
  };
}

/** Apply a theme by name. Returns false if the name is unknown. */
export function applyTheme(name: string): boolean {
  const theme = themes[name];
  if (!theme) return false;
  const root = document.documentElement;
  root.style.setProperty("--color-accent", theme.accent);
  root.style.setProperty("--color-accent-2", theme.accent2);
  try {
    if (name === defaultThemeName) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, name);
  } catch {
    /* storage may be unavailable (private mode) — ignore */
  }
  window.dispatchEvent(new CustomEvent(THEME_EVENT));
  return true;
}

/** Restore a previously chosen theme on page load. */
export function initTheme(): void {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && themes[saved]) applyTheme(saved);
  } catch {
    /* ignore */
  }
}

export function currentThemeName(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && themes[saved]) return saved;
  } catch {
    /* ignore */
  }
  return defaultThemeName;
}
