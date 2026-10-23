import { PRIORITIES } from "./Task.js";

const STORAGE_KEY = "task-manager-tasks-v1";

export function saveTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    return true;
  } catch {
    return false;
  }
}

export function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isValidTask).map(task => ({ ...task }));
  } catch {
    return [];
  }
}

function isValidTask(task) {
  if (!task || typeof task !== "object") {
    return false;
  }

  const hasValidId = typeof task.id === "string" && task.id.length > 0;

  const hasValidTitle =
    typeof task.title === "string" && task.title.trim().length > 0;

  const hasValidPriority = PRIORITIES.includes(task.priority);

  const hasValidIsDone = typeof task.isDone === "boolean";

  const hasValidCreatedAt =
    typeof task.createdAt === "string" &&
    !Number.isNaN(Date.parse(task.createdAt));

  return (
    hasValidId &&
    hasValidTitle &&
    hasValidPriority &&
    hasValidIsDone &&
    hasValidCreatedAt
  );
}