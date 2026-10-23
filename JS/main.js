import { TaskManager } from "./TasKManager.js";
import { loadTasks, saveTasks } from "./storage.js";
import { fetchHighPriorityMessage } from "./api.js";
import {
  renderTaskList,
  updateStats,
  updateFilterButtons,
  showMessage,
  showLoading,
  hideLoading
} from "./ui.js";

const taskForm = document.getElementById("task-form");
const taskTitleInput = document.getElementById("task-title");
const taskPrioritySelect = document.getElementById("task-priority");

const tasksList = document.getElementById("tasks-list");
const emptyState = document.getElementById("empty-state");

const filters = document.getElementById("filters");

const statsTotal = document.getElementById("stats-total");
const statsCompleted = document.getElementById("stats-completed");
const statsRemaining = document.getElementById("stats-remaining");

const messageArea = document.getElementById("message-area");
const loadingArea = document.getElementById("loading-area");

const manager = new TaskManager(loadTasks());

let currentFilter = "all";

function render() {
  const visibleTasks = manager.getFilteredTasks(currentFilter);

  renderTaskList(tasksList, emptyState, visibleTasks);

  updateStats(
    {
      total: statsTotal,
      completed: statsCompleted,
      remaining: statsRemaining
    },
    manager.getStats()
  );

  updateFilterButtons(filters, currentFilter);
}

function saveAndRender() {
  saveTasks(manager.tasks);
  render();
}

taskForm.addEventListener("submit", event => {
  event.preventDefault();

  const title = taskTitleInput.value.trim();
  const priority = taskPrioritySelect.value;

  if (!title) {
    showMessage(
      messageArea,
      "يرجى كتابة عنوان المهمة قبل الإضافة.",
      "error"
    );

    taskTitleInput.focus();
    return;
  }

  const newTask = manager.addTask({
    title,
    priority
  });

  saveAndRender();

  taskForm.reset();
  taskTitleInput.focus();

  if (newTask.priority === "high") {
    void handleHighPriorityTask(newTask);
  }
});

tasksList.addEventListener("click", event => {
  const actionButton = event.target.closest("[data-action]");

  if (!actionButton) {
    return;
  }

  const taskItem = actionButton.closest("[data-id]");

  if (!taskItem) {
    return;
  }

  const taskId = taskItem.dataset.id;
  const action = actionButton.dataset.action;

  if (action === "toggle") {
    manager.toggleTask(taskId);
    saveAndRender();
  }

  if (action === "delete") {
    manager.deleteTask(taskId);
    saveAndRender();
  }
});

filters.addEventListener("click", event => {
  const filterButton = event.target.closest("[data-filter]");

  if (!filterButton) {
    return;
  }

  currentFilter = filterButton.dataset.filter;

  render();
});

async function handleHighPriorityTask(task) {
  showLoading(loadingArea);

  try {
    const result = await fetchHighPriorityMessage(task);

    const baseMessage = `مهمة عالية الأولوية: "${task.title}". ${result.text}`;

    if (result.fallback) {
      showMessage(
        messageArea,
        `${baseMessage} (تعذر الوصول إلى الخدمة الخارجية، لذلك تم عرض رسالة محلية.)`,
        "warning"
      );
    } else {
      showMessage(messageArea, baseMessage, "success");
    }
  } catch {
    showMessage(
      messageArea,
      `تمت إضافة المهمة "${task.title}" بنجاح، لكن حدث خطأ غير متوقع أثناء جلب التنبيه الإضافي.`,
      "error"
    );
  } finally {
    hideLoading(loadingArea);
  }
}

render();