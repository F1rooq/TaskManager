export const PRIORITIES = ["low", "medium", "high"];

function generateId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export class Task {
  constructor({ title = "", priority = "low" } = {}) {
    this.id = generateId();
    this.title = String(title).trim();
    this.priority = PRIORITIES.includes(priority) ? priority : "low";
    this.isDone = false;
    this.createdAt = new Date().toISOString();
  }
}