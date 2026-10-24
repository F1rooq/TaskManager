import { TaskManager } from "./TasKManager.js";
import { loadTasks, saveTasks } from "./storage.js";
import { fetchHighPriorityMessage } from "./api.js";
import { loadPrefs, savePrefs } from "./prefs.js";
import {
  applyStaticTranslations,
  greetingFor,
  t
} from "./i18n.js";
import { initScene } from "./scene.js";
import {
  renderTaskList,
  updateStats,
  updateFilterButtons,
  updateProgress,
  showMessage,
  showLoading,
  hideLoading,
  showToast,
  sortTasks
} from "./ui.js";

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
  const priority =
    taskForm.querySelector('input[name="task-priority"]:checked')?.value ??
    "medium";

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

  if (newTask.priority === "high") {
    void handleHighPriorityTask(newTask);
  }
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
    showToast(
      toastArea,
      toastMessage,
      toastAction,
      t(prefs.lang, "deletedToast"),
      t(prefs.lang, "undo"),
      restoreUndo
    );
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
  showToast(
    toastArea,
    toastMessage,
    toastAction,
    t(prefs.lang, "clearedToast"),
    t(prefs.lang, "undo"),
    restoreUndo
  );
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

greeting.addEventListener("click", () => {
  openNameModal();
});

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
  const searched = currentQuery
    ? filtered.filter(task => task.title.toLowerCase().includes(currentQuery))
    : filtered;
  const visible = sortTasks(searched, currentSort);

  renderTaskList(tasksList, emptyState, visible, prefs.lang);
  updateStats(
    { total: statsTotal, completed: statsCompleted, remaining: statsRemaining },
    stats
  );
  updateProgress(progressCircle, progressPercent, stats);
  updateFilterButtons(filters, currentFilter, stats);

  const allDone = stats.total > 0 && stats.remaining === 0;
  celebration.hidden = !allDone;
  greeting.textContent = greetingFor(prefs.lang, prefs.name, manager.tasks);
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeToggle.setAttribute(
    "aria-label",
    t(prefs.lang, theme === "dark" ? "themeToLight" : "themeToDark")
  );
}

function applyLanguage(lang) {
  applyStaticTranslations(lang);
  langToggle.textContent = t(lang, lang === "ar" ? "languageToEn" : "languageToAr");
  applyTheme(prefs.theme);
}

function maybeAskName() {
  if (prefs.name) {
    closeNameModal();
    return;
  }

  openNameModal();
}

function openNameModal() {
  nameModal.hidden = false;
  nameInput.value = prefs.name;
  window.requestAnimationFrame(() => nameInput.focus());
}

function closeNameModal() {
  nameModal.hidden = true;
}

async function handleHighPriorityTask(task) {
  showLoading(loadingArea);

  try {
    const result = await fetchHighPriorityMessage(task, prefs.lang);
    const baseMessage = t(prefs.lang, "highPriorityMessage", {
      title: task.title,
      quote: result.text
    });

    if (result.fallback) {
      showMessage(
        messageArea,
        `${baseMessage}${t(prefs.lang, "highPriorityFallback")}`,
        "warning"
      );
    } else {
      showMessage(messageArea, baseMessage, "success");
    }
  } catch {
    showMessage(
      messageArea,
      t(prefs.lang, "addError", { title: task.title }),
      "error"
    );
  } finally {
    hideLoading(loadingArea);
  }
}
