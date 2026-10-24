import { t } from "./i18n.js";

const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };

export function renderTaskList(tasksList, emptyState, tasks, lang) {
  tasksList.replaceChildren();

  if (!tasks.length) {
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;

  const fragment = document.createDocumentFragment();

  tasks.forEach(task => {
    fragment.appendChild(createTaskElement(task, lang));
  });

  tasksList.appendChild(fragment);
}

export function createTaskElement(task, lang) {
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
  priority.textContent = t(
    lang,
    task.priority === "high"
      ? "priorityHigh"
      : task.priority === "medium"
        ? "priorityMedium"
        : "priorityLow"
  );

  const date = document.createElement("time");
  date.classList.add("task__date");
  date.dateTime = task.createdAt;
  date.textContent = formatDate(task.createdAt, lang);

  meta.append(priority, date);
  content.append(title, meta);

  const actions = document.createElement("div");
  actions.classList.add("task__actions");

  const toggleButton = document.createElement("button");
  toggleButton.type = "button";
  toggleButton.dataset.action = "toggle";
  toggleButton.classList.add("btn", "btn--small");
  toggleButton.textContent = task.isDone
    ? t(lang, "undoComplete")
    : t(lang, "complete");
  toggleButton.setAttribute(
    "aria-label",
    `${toggleButton.textContent}: ${task.title}`
  );

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.dataset.action = "delete";
  deleteButton.classList.add("btn", "btn--small", "btn--danger");
  deleteButton.textContent = t(lang, "delete");
  deleteButton.setAttribute("aria-label", `${t(lang, "delete")}: ${task.title}`);

  actions.append(toggleButton, deleteButton);
  li.append(content, actions);

  return li;
}

export function updateStats(statsElements, stats) {
  statsElements.total.textContent = String(stats.total);
  statsElements.completed.textContent = String(stats.completed);
  statsElements.remaining.textContent = String(stats.remaining);
}

export function updateProgress(circle, percentNode, stats) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const percent = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0;

  circle.style.strokeDasharray = String(circumference);
  circle.style.strokeDashoffset = String(circumference * (1 - percent / 100));
  percentNode.textContent = `${percent}%`;
}

export function updateFilterButtons(filtersContainer, currentFilter, stats) {
  const buttons = filtersContainer.querySelectorAll("[data-filter]");

  buttons.forEach(button => {
    const isActive = button.dataset.filter === currentFilter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  const counts = {
    all: stats.total,
    completed: stats.completed,
    pending: stats.remaining
  };

  filtersContainer.querySelectorAll("[data-filter-count]").forEach(node => {
    const key = node.dataset.filterCount;
    if (key in counts) {
      node.textContent = String(counts[key]);
    }
  });
}

export function showMessage(messageArea, text, type = "success") {
  messageArea.textContent = text;
  messageArea.className = `message-area message-area--${type}`;
  messageArea.hidden = false;
}

export function showLoading(loadingArea) {
  loadingArea.hidden = false;
}

export function hideLoading(loadingArea) {
  loadingArea.hidden = true;
}

export function showToast(toastArea, messageNode, actionNode, text, actionLabel, onAction) {
  messageNode.textContent = text;
  toastArea.hidden = false;

  if (actionLabel && onAction) {
    actionNode.hidden = false;
    actionNode.textContent = actionLabel;
    actionNode.onclick = () => {
      onAction();
      hideToast(toastArea);
    };
  } else {
    actionNode.hidden = true;
    actionNode.onclick = null;
  }

  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => hideToast(toastArea), 4200);
}

export function hideToast(toastArea) {
  toastArea.hidden = true;
}

export function sortTasks(tasks, sortBy) {
  const copy = [...tasks];

  if (sortBy === "oldest") {
    return copy.sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
  }

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
    return new Intl.DateTimeFormat(t(lang, "dateLocale"), {
      dateStyle: "medium"
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
}
