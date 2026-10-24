// ==========================================
// Task & TaskManager Definitions
// ==========================================
const PRIORITIES = ["low", "medium", "high"];
function generateId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
class Task {
  constructor({ title = "", priority = "low" } = {}) {
    this.id = generateId();
    this.title = String(title).trim();
    this.priority = PRIORITIES.includes(priority) ? priority : "low";
    this.isDone = false;
    this.createdAt = new Date().toISOString();
  }
}

class TaskManager {
  constructor(initialTasks = []) {
    this.tasks = [...initialTasks];
  }
  addTask(taskData) {
    const newTask = taskData instanceof Task ? taskData : new Task(taskData);
    this.tasks = [...this.tasks, newTask];
    return newTask;
  }
  toggleTask(id) {
    this.tasks = this.tasks.map(task =>
      task.id === id ? { ...task, isDone: !task.isDone } : task
    );
  }
  deleteTask(id) {
    this.tasks = this.tasks.filter(task => task.id !== id);
  }
  getStats() {
    const total = this.tasks.length;
    const completed = this.tasks.filter(task => task.isDone).length;
    const remaining = this.tasks.reduce((count, task) => {
      return task.isDone ? count : count + 1;
    }, 0);
    return { total, completed, remaining };
  }
  getFilteredTasks(filter = "all") {
    if (filter === "completed") return this.tasks.filter(task => task.isDone);
    if (filter === "pending") return this.tasks.filter(task => !task.isDone);
    return [...this.tasks];
  }
}

// ==========================================
// Storage & Preferences
// ==========================================
const STORAGE_KEY = "task-manager-tasks-v1";
function saveTasks(tasks) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); return true; } 
  catch { return false; }
}
function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidTask).map(task => ({ ...task }));
  } catch { return []; }
}
function isValidTask(task) {
  if (!task || typeof task !== "object") return false;
  const hasValidId = typeof task.id === "string" && task.id.length > 0;
  const hasValidTitle = typeof task.title === "string" && task.title.trim().length > 0;
  const hasValidPriority = PRIORITIES.includes(task.priority);
  const hasValidIsDone = typeof task.isDone === "boolean";
  const hasValidCreatedAt = typeof task.createdAt === "string" && !Number.isNaN(Date.parse(task.createdAt));
  return hasValidId && hasValidTitle && hasValidPriority && hasValidIsDone && hasValidCreatedAt;
}

const PREFS_KEY = "task-manager-prefs-v1";
const DEFAULTS = { name: "", theme: "dark", lang: "ar" };
function loadPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return { ...DEFAULTS, theme: detectTheme(), lang: detectLang() };
    const parsed = JSON.parse(raw);
    return {
      name: typeof parsed.name === "string" ? parsed.name.trim() : "",
      theme: parsed.theme === "light" ? "light" : "dark",
      lang: parsed.lang === "en" ? "en" : "ar"
    };
  } catch { return { ...DEFAULTS }; }
}
function savePrefs(prefs) {
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); return true; } 
  catch { return false; }
}
function detectTheme() {
  if (window.matchMedia("(prefers-color-scheme: light)").matches) return "light";
  return "dark";
}
function detectLang() {
  const locale = (navigator.language || "ar").toLowerCase();
  return locale.startsWith("en") ? "en" : "ar";
}

// ==========================================
// i18n (Translations)
// ==========================================
const translations = {
  ar: {
    dir: "rtl", lang: "ar", documentTitle: "TaskManager", brand: "TaskManager",
    greetingFallback: "مرحباً، ما خططك اليوم؟",
    greetingHello: "مرحباً {name}، ما خططك اليوم؟",
    greetingPendingOne: "مرحباً {name}، ما زالت مهمة «{task}» بانتظارك.",
    greetingPendingMany: "مرحباً {name}، لديك {count} مهام مفتوحة. هل نبدأ بـ «{task}»؟",
    greetingAllDone: "مرحباً {name}، أنهيت كل مهامك. ماذا بعد اليوم؟",
    greetingCompletedHint: "مرحباً {name}، أكملت {count} حتى الآن. ما خطتك التالية؟",
    namePromptTitle: "كيف نناديك؟", namePromptText: "اكتب اسمك لتظهر تحية شخصية في كل زيارة.",
    namePlaceholder: "اسمك", nameSave: "ابدأ", nameChange: "تغيير الاسم",
    themeToLight: "الوضع الفاتح", themeToDark: "الوضع الداكن",
    languageToEn: "English", languageToAr: "العربية",
    headline: "مدير المهام", headlineAccent: "اليومي",
    subtitle: "أضف مهامك، رتّبها حسب الأولوية، وتابع إنجازك في لوحة واحدة واضحة.",
    chipSearch: "بحث سريع", chipFilter: "تصفية", chipProgress: "تقدم مرئي", chipAutosave: "حفظ تلقائي",
    taskTitleLabel: "عنوان المهمة", taskTitlePlaceholder: "اكتب مهمة جديدة...",
    priorityLabel: "الأولوية", priorityLow: "منخفضة", priorityMedium: "متوسطة", priorityHigh: "عالية",
    addTask: "إضافة المهمة", overviewTitle: "نظرة عامة",
    overviewSubtitle: "إحصائيات لحظية مع نسبة الإنجاز",
    statsTotal: "العدد الإجمالي", statsTotalHint: "كل المهام المسجلة",
    statsCompleted: "المهام المكتملة", statsCompletedHint: "ما تم إنجازه",
    statsRemaining: "المهام المتبقية", statsRemainingHint: "ما زال قيد العمل",
    progressLabel: "نسبة الإنجاز", filtersTitle: "التصفية",
    filtersSubtitle: "عرض المهام حسب الحالة",
    filterAll: "الكل", filterCompleted: "المكتملة فقط", filterPending: "غير المكتملة فقط",
    tasksTitle: "المهام", tasksSubtitle: "بحث، ترتيب، إكمال، وحذف",
    searchAria: "البحث في المهام", searchPlaceholder: "ابحث في المهام...",
    sortAria: "ترتيب المهام", sortNewest: "الأحدث أولًا", sortOldest: "الأقدم أولًا", sortPriority: "حسب الأولوية",
    clearCompleted: "مسح المكتملة", celebrationTitle: "عمل رائع!",
    celebrationText: "لقد أكملت جميع مهامك الحالية.", emptyState: "لا توجد مهام لعرضها.",
    footerSave: "يتم الحفظ تلقائيًا في هذا المتصفح", footerSearch: "اضغط",
    footerSearchRest: "للانتقال إلى البحث", loading: "جارٍ التحميل ...",
    complete: "إكمال", undoComplete: "إلغاء الإكمال", delete: "حذف",
    emptyTitleError: "يرجى كتابة عنوان المهمة قبل الإضافة.",
    nameError: "يرجى كتابة اسمك للمتابعة.",
    highPriorityMessage: 'مهمة عالية الأولوية: "{title}". {quote}',
    highPriorityFallback: " (تعذر الوصول إلى الخدمة الخارجية، لذلك تم عرض رسالة محلية.) ",
    addError: 'تمت إضافة المهمة "{title}" بنجاح، لكن حدث خطأ غير متوقع أثناء جلب التنبيه الإضافي.',
    deletedToast: "تم حذف المهمة.", undo: "تراجع", clearedToast: "تم مسح المهام المكتملة.",
    dateLocale: "ar-EG"
  },
  en: {
    dir: "ltr", lang: "en", documentTitle: "TaskManager", brand: "TaskManager",
    greetingFallback: "Hello — what’s your plan today?",
    greetingHello: "Hello {name}, what’s your plan today?",
    greetingPendingOne: "Hello {name}, “{task}” is still waiting for you.",
    greetingPendingMany: "Hello {name}, you have {count} open tasks. Start with “{task}”?",
    greetingAllDone: "Hello {name}, everything’s done. What’s next today?",
    greetingCompletedHint: "Hello {name}, you’ve finished {count} so far. What’s the next move?",
    namePromptTitle: "What should we call you?",
    namePromptText: "Add your name so TaskManager can greet you each visit.",
    namePlaceholder: "Your name", nameSave: "Let’s go", nameChange: "Change name",
    themeToLight: "Light mode", themeToDark: "Dark mode",
    languageToEn: "English", languageToAr: "العربية",
    headline: "Task", headlineAccent: "Manager",
    subtitle: "Capture work, sort by priority, and watch your progress in one calm board.",
    chipSearch: "Instant search", chipFilter: "Smart filters", chipProgress: "Live progress", chipAutosave: "Auto-save",
    taskTitleLabel: "Task title", taskTitlePlaceholder: "Write a new task...",
    priorityLabel: "Priority", priorityLow: "Low", priorityMedium: "Medium", priorityHigh: "High",
    addTask: "Add task", overviewTitle: "Overview",
    overviewSubtitle: "Live stats with completion rate",
    statsTotal: "Total", statsTotalHint: "Every saved task",
    statsCompleted: "Completed", statsCompletedHint: "Already done",
    statsRemaining: "Remaining", statsRemainingHint: "Still in progress",
    progressLabel: "Completion", filtersTitle: "Filters",
    filtersSubtitle: "Show tasks by status",
    filterAll: "All", filterCompleted: "Completed only", filterPending: "Pending only",
    tasksTitle: "Tasks", tasksSubtitle: "Search, sort, complete, and delete",
    searchAria: "Search tasks", searchPlaceholder: "Search tasks...",
    sortAria: "Sort tasks", sortNewest: "Newest first", sortOldest: "Oldest first", sortPriority: "By priority",
    clearCompleted: "Clear completed", celebrationTitle: "Nice work!",
    celebrationText: "You’ve completed every current task.", emptyState: "No tasks to show.",
    footerSave: "Saved automatically in this browser", footerSearch: "Press",
    footerSearchRest: "to jump to search", loading: "Loading ...",
    complete: "Complete", undoComplete: "Undo complete", delete: "Delete",
    emptyTitleError: "Please write a task title before adding.",
    nameError: "Please enter your name to continue.",
    highPriorityMessage: 'High-priority task: "{title}". {quote}',
    highPriorityFallback: " (Couldn’t reach the remote service, so a local note is shown.) ",
    addError: 'Task "{title}" was added, but the extra alert failed unexpectedly.',
    deletedToast: "Task deleted.", undo: "Undo", clearedToast: "Completed tasks cleared.",
    dateLocale: "en-US"
  }
};

function interpolate(template, values = {}) {
  return String(template).replace(/{(\w+)}/g, (_, key) =>
    values[key] == null ? "" : String(values[key])
  );
}
function t(lang, key, values) {
  const table = translations[lang] || translations.en;
  const text = table[key] ?? translations.en[key] ?? key;
  return values ? interpolate(text, values) : text;
}
function applyStaticTranslations(lang) {
  const table = translations[lang] || translations.en;
  document.documentElement.lang = table.lang;
  document.documentElement.dir = table.dir;
  document.title = table.documentTitle;
  document.querySelectorAll("[data-i18n]").forEach(node => { node.textContent = t(lang, node.dataset.i18n); });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(node => { node.placeholder = t(lang, node.dataset.i18nPlaceholder); });
  document.querySelectorAll("[data-i18n-aria]").forEach(node => { node.setAttribute("aria-label", t(lang, node.dataset.i18nAria)); });
  document.querySelectorAll("[data-i18n-title]").forEach(node => { node.setAttribute("title", t(lang, node.dataset.i18nTitle)); });
}
function greetingFor(lang, name, tasks) {
  if (!name) return t(lang, "greetingFallback");
  const pending = tasks.filter(task => !task.isDone);
  const completed = tasks.filter(task => task.isDone);
  const firstPending = pending[0]?.title ?? "";
  if (pending.length === 1) return t(lang, "greetingPendingOne", { name, task: firstPending });
  if (pending.length > 1) return t(lang, "greetingPendingMany", { name, count: pending.length, task: firstPending });
  if (completed.length && !pending.length) return t(lang, "greetingAllDone", { name });
  if (completed.length) return t(lang, "greetingCompletedHint", { name, count: completed.length });
  return t(lang, "greetingHello", { name });
}

// ==========================================
// API
// ==========================================
const QUOTE_API_URL = "https://dummyjson.com/quotes/random";
const LOCAL_QUOTES = {
  ar: [
    { text: "الإنجاز يبدأ بخطوة صغيرة اليوم.", source: "محلي" },
    { text: "المهام عالية الأولوية تستحق تركيزًا عاليًا.", source: "محلي" },
    { text: "ركّز على الأهم قبل المهم.", source: "محلي" },
    { text: "التركيز الآن يعني راحة لاحقًا.", source: "محلي" }
  ],
  en: [
    { text: "Progress starts with one small step today.", source: "local" },
    { text: "High-priority work deserves high-priority focus.", source: "local" },
    { text: "Do the important thing before the merely urgent.", source: "local" },
    { text: "Focus now means ease later.", source: "local" }
  ]
};
async function fetchHighPriorityMessage(task, lang = "en") {
  try {
    const remoteQuote = await fetchQuoteFromApi();
    return { text: remoteQuote.text, source: remoteQuote.source, fallback: false, taskTitle: task?.title ?? "" };
  } catch {
    const localQuote = await fetchQuoteMock(lang);
    return { text: localQuote.text, source: localQuote.source, fallback: true, taskTitle: task?.title ?? "" };
  }
}
async function fetchQuoteFromApi() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(QUOTE_API_URL, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    if (!data?.quote) throw new Error("No quote found");
    return { text: data.quote, source: data.author || "Unknown" };
  } finally { clearTimeout(timeoutId); }
}
function fetchQuoteMock(lang = "en") {
  const pack = LOCAL_QUOTES[lang] || LOCAL_QUOTES.en;
  return new Promise(resolve => {
    const randomIndex = Math.floor(Math.random() * pack.length);
    setTimeout(() => resolve(pack[randomIndex]), 700);
  });
}

// ==========================================
// Scene (Background Animation)
// ==========================================
const MAX_PARTICLES = 70;
const POINTER_INFLUENCE = 140;
function initScene(canvas) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scene = document.querySelector(".scene");
  const ctx = canvas.getContext("2d", { alpha: true });
  const pointer = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.35 };
  const target = { ...pointer };
  let width = 0, height = 0, particles = [], frameId = 0;
  let lastTheme = document.documentElement.dataset.theme || "dark";

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth; height = window.innerHeight;
    canvas.width = Math.floor(width * dpr); canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    particles = createParticles(width, height);
  }
  function createParticles(w, h) {
    return Array.from({ length: MAX_PARTICLES }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
      r: 1.1 + Math.random() * 2.2, pulse: Math.random() * Math.PI * 2
    }));
  }
  function themeColors() {
    const isLight = document.documentElement.dataset.theme === "light";
    return isLight ? {
      particle: "rgba(79, 70, 229, 0.55)", line: "rgba(14, 165, 233, 0.16)", glow: "rgba(244, 114, 182, 0.18)"
    } : {
      particle: "rgba(167, 139, 250, 0.85)", line: "rgba(34, 211, 238, 0.16)", glow: "rgba(251, 113, 133, 0.18)"
    };
  }
  function draw(now) {
    const colors = themeColors();
    const theme = document.documentElement.dataset.theme || "dark";
    if (theme !== lastTheme) lastTheme = theme;
    pointer.x += (target.x - pointer.x) * 0.08;
    pointer.y += (target.y - pointer.y) * 0.08;
    const nx = pointer.x / width, ny = pointer.y / height;
    document.documentElement.style.setProperty("--pointer-x", `${nx}`);
    document.documentElement.style.setProperty("--pointer-y", `${ny}`);
    if (scene) {
      scene.style.setProperty("--orb-x", `${pointer.x}px`);
      scene.style.setProperty("--orb-y", `${pointer.y}px`);
    }
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = colors.glow;
    ctx.beginPath(); ctx.arc(pointer.x, pointer.y, 90, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < particles.length; i += 1) {
      const p = particles[i];
      const dx = p.x - pointer.x, dy = p.y - pointer.y;
      const dist = Math.hypot(dx, dy) || 1;
      if (dist < POINTER_INFLUENCE) {
        const force = (POINTER_INFLUENCE - dist) / POINTER_INFLUENCE;
        p.vx += (dx / dist) * force * 0.22; p.vy += (dy / dist) * force * 0.22;
      }
      p.vx *= 0.985; p.vy *= 0.985; p.x += p.vx; p.y += p.vy; p.pulse += 0.02;
      if (p.x < -20) p.x = width + 20; if (p.x > width + 20) p.x = -20;
      if (p.y < -20) p.y = height + 20; if (p.y > height + 20) p.y = -20;
      for (let j = i + 1; j < particles.length; j += 1) {
        const q = particles[j];
        const gap = Math.hypot(p.x - q.x, p.y - q.y);
        if (gap < 110) {
          ctx.strokeStyle = colors.line; ctx.globalAlpha = 1 - gap / 110;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); ctx.globalAlpha = 1;
        }
      }
      const radius = p.r + Math.sin(p.pulse + now / 700) * 0.4;
      ctx.fillStyle = colors.particle;
      ctx.beginPath(); ctx.arc(p.x, p.y, radius, 0, Math.PI * 2); ctx.fill();
    }
    if (!reducedMotion) frameId = window.requestAnimationFrame(draw);
  }
  function onPointerMove(event) { target.x = event.clientX; target.y = event.clientY; }
  function onPointerLeave() { target.x = width * 0.5; target.y = height * 0.35; }
  
  resize();
  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerleave", onPointerLeave);
  frameId = window.requestAnimationFrame(draw);
  if (reducedMotion) draw(0);
  
  return () => {
    window.cancelAnimationFrame(frameId);
    window.removeEventListener("resize", resize);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerleave", onPointerLeave);
  };
}

// ==========================================
// UI Rendering Helpers
// ==========================================
const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };
function renderTaskList(tasksList, emptyState, tasks, lang) {
  tasksList.replaceChildren();
  if (!tasks.length) { emptyState.hidden = false; return; }
  emptyState.hidden = true;
  const fragment = document.createDocumentFragment();
  tasks.forEach(task => fragment.appendChild(createTaskElement(task, lang)));
  tasksList.appendChild(fragment);
}
function createTaskElement(task, lang) {
  const li = document.createElement("li");
  li.classList.add("task");
  li.classList.toggle("task--done", Boolean(task.isDone));
  li.dataset.id = task.id;
  const content = document.createElement("div");
  content.classList.add("task__content");
  const title = document.createElement("h3");
  title.classList.add("task__title");
  title.textContent = task.title;
  const meta = document.createElement("div");
  meta.classList.add("task__meta");
  const priority = document.createElement("span");
  priority.classList.add("task__priority", `task__priority--${task.priority}`);
  priority.textContent = t(lang, task.priority === "high" ? "priorityHigh" : task.priority === "medium" ? "priorityMedium" : "priorityLow");
  const date = document.createElement("time");
  date.classList.add("task__date");
  date.dateTime = task.createdAt;
  date.textContent = formatDate(task.createdAt, lang);
  meta.append(priority, date);
  content.append(title, meta);
  const actions = document.createElement("div");
  actions.classList.add("task__actions");
  const toggleButton = document.createElement("button");
  toggleButton.type = "button"; toggleButton.dataset.action = "toggle";
  toggleButton.classList.add("btn", "btn--small");
  toggleButton.textContent = task.isDone ? t(lang, "undoComplete") : t(lang, "complete");
  toggleButton.setAttribute("aria-label", `${toggleButton.textContent}: ${task.title}`);
  const deleteButton = document.createElement("button");
  deleteButton.type = "button"; deleteButton.dataset.action = "delete";
  deleteButton.classList.add("btn", "btn--small", "btn--danger");
  deleteButton.textContent = t(lang, "delete");
  deleteButton.setAttribute("aria-label", `${t(lang, "delete")}: ${task.title}`);
  actions.append(toggleButton, deleteButton);
  li.append(content, actions);
  return li;
}
function updateStats(statsElements, stats) {
  statsElements.total.textContent = String(stats.total);
  statsElements.completed.textContent = String(stats.completed);
  statsElements.remaining.textContent = String(stats.remaining);
}
function updateProgress(circle, percentNode, stats) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const percent = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0;
  circle.style.strokeDasharray = String(circumference);
  circle.style.strokeDashoffset = String(circumference * (1 - percent / 100));
  percentNode.textContent = `${percent}%`;
}
function updateFilterButtons(filtersContainer, currentFilter, stats) {
  const buttons = filtersContainer.querySelectorAll("[data-filter]");
  buttons.forEach(button => {
    const isActive = button.dataset.filter === currentFilter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  const counts = { all: stats.total, completed: stats.completed, pending: stats.remaining };
  filtersContainer.querySelectorAll("[data-filter-count]").forEach(node => {
    const key = node.dataset.filterCount;
    if (key in counts) node.textContent = String(counts[key]);
  });
}
function showMessage(messageArea, text, type = "success") {
  messageArea.textContent = text;
  messageArea.className = `message-area message-area--${type}`;
  messageArea.hidden = false;
}
function showLoading(loadingArea) { loadingArea.hidden = false; }
function hideLoading(loadingArea) { loadingArea.hidden = true; }
function showToast(toastArea, messageNode, actionNode, text, actionLabel, onAction) {
  messageNode.textContent = text;
  toastArea.hidden = false;
  if (actionLabel && onAction) {
    actionNode.hidden = false; actionNode.textContent = actionLabel;
    actionNode.onclick = () => { onAction(); hideToast(toastArea); };
  } else {
    actionNode.hidden = true; actionNode.onclick = null;
  }
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => hideToast(toastArea), 4200);
}
function hideToast(toastArea) { toastArea.hidden = true; }
function sortTasks(tasks, sortBy) {
  const copy = [...tasks];
  if (sortBy === "oldest") return copy.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  if (sortBy === "priority") {
    return copy.sort((a, b) => {
      const rank = (PRIORITY_RANK[a.priority] ?? 9) - (PRIORITY_RANK[b.priority] ?? 9);
      if (rank !== 0) return rank;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }
  return copy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}
function formatDate(dateString, lang) {
  try {
    return new Intl.DateTimeFormat(t(lang, "dateLocale"), { dateStyle: "medium" }).format(new Date(dateString));
  } catch { return dateString; }
}

// ==========================================
// Main App Execution
// ==========================================
const prefs = loadPrefs();
const taskForm = document.getElementById("task-form");
const taskTitleInput = document.getElementById("task-title");
const searchInput = document.getElementById("search-input");
const sortSelect = document.getElementById("sort-select");
const clearCompleted = document.getElementById("clear-completed");
const tasksList = document.getElementById("tasks-list");
const emptyState = document.getElementById("empty-state");
const filters = document.getElementById("filters");
const celebration = document.getElementById("celebration");
const statsTotal = document.getElementById("stats-total");
const statsCompleted = document.getElementById("stats-completed");
const statsRemaining = document.getElementById("stats-remaining");
const progressCircle = document.getElementById("progress-ring-circle");
const progressPercent = document.getElementById("progress-percent");
const messageArea = document.getElementById("message-area");
const loadingArea = document.getElementById("loading-area");
const toastArea = document.getElementById("toast-area");
const toastMessage = document.getElementById("toast-message");
const toastAction = document.getElementById("toast-action");
const greeting = document.getElementById("greeting");
const nameModal = document.getElementById("name-modal");
const nameForm = document.getElementById("name-form");
const nameInput = document.getElementById("user-name");
const themeToggle = document.getElementById("theme-toggle");
const langToggle = document.getElementById("lang-toggle");
const sceneCanvas = document.getElementById("scene-canvas");

const manager = new TaskManager(loadTasks());
let currentFilter = "all";
let currentQuery = "";
let currentSort = "newest";
let undoStack = null;

applyTheme(prefs.theme);
applyLanguage(prefs.lang);
initScene(sceneCanvas);
maybeAskName();
render();

taskForm.addEventListener("submit", event => {
  event.preventDefault();
  const title = taskTitleInput.value.trim();
  const priority = taskForm.querySelector('input[name="task-priority"]:checked')?.value ?? "medium";
  if (!title) {
    showMessage(messageArea, t(prefs.lang, "emptyTitleError"), "error");
    taskTitleInput.focus();
    return;
  }
  const newTask = manager.addTask({ title, priority });
  saveAndRender();
  taskForm.reset();
  const medium = taskForm.querySelector('input[name="task-priority"][value="medium"]');
  if (medium) medium.checked = true;
  taskTitleInput.focus();
  if (newTask.priority === "high") void handleHighPriorityTask(newTask);
});

tasksList.addEventListener("click", event => {
  const actionButton = event.target.closest("[data-action]");
  if (!actionButton) return;
  const taskItem = actionButton.closest("[data-id]");
  if (!taskItem) return;
  const taskId = taskItem.dataset.id;
  const action = actionButton.dataset.action;
  if (action === "toggle") {
    manager.toggleTask(taskId);
    saveAndRender();
  }
  if (action === "delete") {
    const snapshot = [...manager.tasks];
    manager.deleteTask(taskId);
    saveAndRender();
    undoStack = snapshot;
    showToast(toastArea, toastMessage, toastAction, t(prefs.lang, "deletedToast"), t(prefs.lang, "undo"), restoreUndo);
  }
});

filters.addEventListener("click", event => {
  const filterButton = event.target.closest("[data-filter]");
  if (!filterButton) return;
  currentFilter = filterButton.dataset.filter;
  render();
});

searchInput.addEventListener("input", () => {
  currentQuery = searchInput.value.trim().toLowerCase();
  render();
});

sortSelect.addEventListener("change", () => {
  currentSort = sortSelect.value;
  render();
});

clearCompleted.addEventListener("click", () => {
  const snapshot = [...manager.tasks];
  const hadCompleted = manager.tasks.some(task => task.isDone);
  if (!hadCompleted) return;
  manager.tasks = manager.tasks.filter(task => !task.isDone);
  saveAndRender();
  undoStack = snapshot;
  showToast(toastArea, toastMessage, toastAction, t(prefs.lang, "clearedToast"), t(prefs.lang, "undo"), restoreUndo);
});

themeToggle.addEventListener("click", () => {
  prefs.theme = prefs.theme === "dark" ? "light" : "dark";
  savePrefs(prefs);
  applyTheme(prefs.theme);
});

langToggle.addEventListener("click", () => {
  prefs.lang = prefs.lang === "ar" ? "en" : "ar";
  savePrefs(prefs);
  applyLanguage(prefs.lang);
  render();
});

greeting.addEventListener("click", () => openNameModal());

nameForm.addEventListener("submit", event => {
  event.preventDefault();
  const name = nameInput.value.trim();
  if (!name) {
    showMessage(messageArea, t(prefs.lang, "nameError"), "error");
    nameInput.focus();
    return;
  }
  prefs.name = name;
  savePrefs(prefs);
  closeNameModal();
  render();
});

document.addEventListener("keydown", event => {
  if (event.key !== "/") return;
  const tag = event.target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
  event.preventDefault();
  searchInput.focus();
});

function restoreUndo() {
  if (!undoStack) return;
  manager.tasks = [...undoStack];
  undoStack = null;
  saveAndRender();
}
function saveAndRender() {
  saveTasks(manager.tasks);
  render();
}
function render() {
  const stats = manager.getStats();
  const filtered = manager.getFilteredTasks(currentFilter);
  const searched = currentQuery ? filtered.filter(task => task.title.toLowerCase().includes(currentQuery)) : filtered;
  const visible = sortTasks(searched, currentSort);
  renderTaskList(tasksList, emptyState, visible, prefs.lang);
  updateStats({ total: statsTotal, completed: statsCompleted, remaining: statsRemaining }, stats);
  updateProgress(progressCircle, progressPercent, stats);
  updateFilterButtons(filters, currentFilter, stats);
  const allDone = stats.total > 0 && stats.remaining === 0;
  celebration.hidden = !allDone;
  greeting.textContent = greetingFor(prefs.lang, prefs.name, manager.tasks);
}
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeToggle.setAttribute("aria-label", t(prefs.lang, theme === "dark" ? "themeToLight" : "themeToDark"));
}
function applyLanguage(lang) {
  applyStaticTranslations(lang);
  langToggle.textContent = t(lang, lang === "ar" ? "languageToEn" : "languageToAr");
  applyTheme(prefs.theme);
}
function maybeAskName() {
  if (prefs.name) { closeNameModal(); return; }
  openNameModal();
}
function openNameModal() {
  nameModal.hidden = false;
  nameInput.value = prefs.name;
  window.requestAnimationFrame(() => nameInput.focus());
}
function closeNameModal() { nameModal.hidden = true; }
async function handleHighPriorityTask(task) {
  showLoading(loadingArea);
  try {
    const result = await fetchHighPriorityMessage(task, prefs.lang);
    const baseMessage = t(prefs.lang, "highPriorityMessage", { title: task.title, quote: result.text });
    if (result.fallback) {
      showMessage(messageArea, `${baseMessage}${t(prefs.lang, "highPriorityFallback")}`, "warning");
    } else {
      showMessage(messageArea, baseMessage, "success");
    }
  } catch {
    showMessage(messageArea, t(prefs.lang, "addError", { title: task.title }), "error");
  } finally {
    hideLoading(loadingArea);
  }
}