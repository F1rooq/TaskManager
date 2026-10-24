const PREFS_KEY = "task-manager-prefs-v1";

const DEFAULTS = {
  name: "",
  theme: "dark",
  lang: "ar"
};

export function loadPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);

    if (!raw) {
      return { ...DEFAULTS, theme: detectTheme(), lang: detectLang() };
    }

    const parsed = JSON.parse(raw);

    return {
      name: typeof parsed.name === "string" ? parsed.name.trim() : "",
      theme: parsed.theme === "light" ? "light" : "dark",
      lang: parsed.lang === "en" ? "en" : "ar"
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export function savePrefs(prefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    return true;
  } catch {
    return false;
  }
}

function detectTheme() {
  if (window.matchMedia("(prefers-color-scheme: light)").matches) {
    return "light";
  }

  return "dark";
}

function detectLang() {
  const locale = (navigator.language || "ar").toLowerCase();
  return locale.startsWith("en") ? "en" : "ar";
}
