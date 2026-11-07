import { useSyncExternalStore } from "react";

export type TextSize = "normal" | "large" | "xlarge";

export type Preferences = {
  textSize: TextSize;
  highContrast: boolean;
  reduceMotion: boolean;
  showAssistant: boolean;
  medReminders: boolean;
  apptReminders: boolean;
};

const DEFAULTS: Preferences = {
  textSize: "normal",
  highContrast: false,
  reduceMotion: false,
  showAssistant: true,
  medReminders: true,
  apptReminders: true,
};

const KEY = "equilibra:preferences";
const FONT: Record<TextSize, string> = { normal: "100%", large: "112.5%", xlarge: "125%" };

function load(): Preferences {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Preferences>) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

function apply(prefs: Preferences) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.style.fontSize = FONT[prefs.textSize] ?? "100%";
  root.classList.toggle("high-contrast", prefs.highContrast);
  root.classList.toggle("reduce-motion", prefs.reduceMotion);
}

let prefs = load();
apply(prefs);
const listeners = new Set<() => void>();

function commit(next: Preferences) {
  prefs = next;
  apply(next);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignora */
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setPreference<K extends keyof Preferences>(key: K, value: Preferences[K]) {
  commit({ ...prefs, [key]: value });
}

export const resetPreferences = () => commit(DEFAULTS);
export const usePreferences = () => useSyncExternalStore(subscribe, () => prefs);