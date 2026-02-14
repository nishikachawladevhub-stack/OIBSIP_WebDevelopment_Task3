// Basic in-memory task store. Each task:
// { id: string, text: string, status: 'pending' | 'completed', createdAt: Date, completedAt?: Date }

const state = {
  tasks: [],
};

const selectors = {
  form: document.getElementById("task-form"),
  input: document.getElementById("task-input"),
  pendingList: document.getElementById("pending-list"),
  completedList: document.getElementById("completed-list"),
  template: document.getElementById("task-item-template"),
  totalCount: document.getElementById("total-count"),
  pendingCount: document.getElementById("pending-count"),
  completedCount: document.getElementById("completed-count"),
};

function createTask(text) {
  return {
    id: crypto.randomUUID
      ? crypto.randomUUID()
      : `task-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    text: text.trim(),
    status: "pending",
    createdAt: new Date(),
    completedAt: null,
  };
}

function formatDateTime(date) {
  if (!date) return "";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function updateCounters() {
  const total = state.tasks.length;
  const completed = state.tasks.filter((t) => t.status === "completed").length;
  const pending = total - completed;

  selectors.totalCount.textContent = String(total);
  selectors.pendingCount.textContent = String(pending);
  selectors.completedCount.textContent = String(completed);
}

function clearListIfNeeded(listEl) {
  if (!listEl) return;
  const hasTasks = listEl.querySelector(".task-item") !== null;
  listEl.classList.toggle("empty-state", !hasTasks);
  const emptyMessage = listEl.querySelector(".empty-message");
  if (!hasTasks && !emptyMessage) {
    const li = document.createElement("li");
    li.className = "empty-message";
    li.textContent =
      listEl.id === "pending-list"
        ? "No pending tasks. Add something above."
        : "No completed tasks yet.";
    listEl.appendChild(li);
  }
  if (hasTasks && emptyMessage) {
    emptyMessage.remove();
  }
}

function renderTask(task) {
  const fragment = selectors.template.content.firstElementChild.cloneNode(true);
  const li = fragment;
  li.dataset.id = task.id;

  const checkbox = li.querySelector(".task-toggle");
  const textSpan = li.querySelector(".task-text");
  const metaSpan = li.querySelector(".task-meta");
  const editBtn = li.querySelector(".btn-edit");
  const deleteBtn = li.querySelector(".btn-delete");

  checkbox.checked = task.status === "completed";
  textSpan.textContent = task.text;
  textSpan.classList.toggle("completed", task.status === "completed");

  const created = `Added: ${formatDateTime(task.createdAt)}`;
  const completed =
    task.status === "completed" && task.completedAt
      ? ` • Completed: ${formatDateTime(task.completedAt)}`
      : "";
  metaSpan.textContent = created + completed;

  checkbox.addEventListener("change", () => toggleTaskStatus(task.id));
  editBtn.addEventListener("click", () => editTask(task.id));
  deleteBtn.addEventListener("click", () => deleteTask(task.id));

  return li;
}

function rerenderLists() {
  selectors.pendingList.innerHTML = "";
  selectors.completedList.innerHTML = "";

  const pendingTasks = state.tasks.filter((t) => t.status === "pending");
  const completedTasks = state.tasks.filter((t) => t.status === "completed");

  if (pendingTasks.length) {
    for (const t of pendingTasks) {
      selectors.pendingList.appendChild(renderTask(t));
    }
  }

  if (completedTasks.length) {
    for (const t of completedTasks) {
      selectors.completedList.appendChild(renderTask(t));
    }
  }

  clearListIfNeeded(selectors.pendingList);
  clearListIfNeeded(selectors.completedList);
  updateCounters();
}

function addTaskFromInput() {
  const text = selectors.input.value.trim();
  if (!text) return;

  const task = createTask(text);
  state.tasks.unshift(task);

  selectors.input.value = "";
  rerenderLists();
}

function toggleTaskStatus(id) {
  const task = state.tasks.find((t) => t.id === id);
  if (!task) return;

  if (task.status === "pending") {
    task.status = "completed";
    task.completedAt = new Date();
  } else {
    task.status = "pending";
    task.completedAt = null;
  }

  rerenderLists();
}

function deleteTask(id) {
  state.tasks = state.tasks.filter((t) => t.id !== id);
  rerenderLists();
}

function editTask(id) {
  const task = state.tasks.find((t) => t.id === id);
  if (!task) return;

  const newText = window.prompt("Edit task", task.text);
  if (newText === null) return;

  const trimmed = newText.trim();
  if (!trimmed) {
    // If text is cleared, treat it as delete for convenience
    deleteTask(id);
    return;
  }

  task.text = trimmed;
  rerenderLists();
}

function attachHandlers() {
  selectors.form.addEventListener("submit", (event) => {
    event.preventDefault();
    addTaskFromInput();
  });

  selectors.input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      addTaskFromInput();
    }
  });
}

function bootstrap() {
  attachHandlers();
  rerenderLists();
}

document.addEventListener("DOMContentLoaded", bootstrap);


