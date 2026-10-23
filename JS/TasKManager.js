import { Task } from "./Task.js";

export class TaskManager {
  constructor(initialTasks = []) {
    this.tasks = [...initialTasks];
  }

  addTask(taskData) {
    const newTask =
      taskData instanceof Task ? taskData : new Task(taskData);

    this.tasks = [...this.tasks, newTask];

    return newTask;
  }

  toggleTask(id) {
    this.tasks = this.tasks.map(task =>
      task.id === id
        ? {
            ...task,
            isDone: !task.isDone
          }
        : task
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

    return {
      total,
      completed,
      remaining
    };
  }

  getFilteredTasks(filter = "all") {
    if (filter === "completed") {
      return this.tasks.filter(task => task.isDone);
    }

    if (filter === "pending") {
      return this.tasks.filter(task => !task.isDone);
    }

    return [...this.tasks];
  }
}