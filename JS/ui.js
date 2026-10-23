export function renderTaskList(tasksList, emptyState, tasks) {
  tasksList.replaceChildren();

  if (!tasks.length) {
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;

  const fragment = document.createDocumentFragment();

  tasks.forEach(task => {
    fragment.appendChild(createTaskElement(task));
  });

  tasksList.appendChild(fragment);
}

export function createTaskElement(task) {
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
  priority.classList.add(
    "task__priority",
    `task__priority--${task.priority}`
  );
  priority.textContent = task.priority;

  const date = document.createElement("time");
  date.classList.add("task__date");
  date.dateTime = task.createdAt;
  date.textContent = formatDate(task.createdAt);

  meta.append(priority, date);
  content.append(title, meta);

  const actions = document.createElement("div");
  actions.classList.add("task__actions");

  const toggleButton = document.createElement("button");
  toggleButton.type = "button";
  toggleButton.dataset.action = "toggle";
  toggleButton.classList.add("btn", "btn--small");
  toggleButton.textContent = task.isDone ? "إلغاء الإكمال" : "إكمال";
  toggleButton.setAttribute(
    "aria-label",
    `${toggleButton.textContent}: ${task.title}`
  );

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.dataset.action = "delete";
  deleteButton.classList.add("btn", "btn--small", "btn--danger");
  deleteButton.textContent = "حذف";
  deleteButton.setAttribute("aria-label", `حذف: ${task.title}`);

  actions.append(toggleButton, deleteButton);

  li.append(content, actions);

  return li;
}

export function updateStats(statsElements, stats) {
  statsElements.total.textContent = String(stats.total);
  statsElements.completed.textContent = String(stats.completed);
  statsElements.remaining.textContent = String(stats.remaining);
}

export function updateFilterButtons(filtersContainer, currentFilter) {
  const buttons = filtersContainer.querySelectorAll("[data-filter]");

  buttons.forEach(button => {
    const isActive = button.dataset.filter === currentFilter;

    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
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

function formatDate(dateString) {
  try {
    return new Intl.DateTimeFormat("ar-EG", {
      dateStyle: "medium"
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
}