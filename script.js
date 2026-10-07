/**
 * Student Task Tracker - Vanilla JavaScript
 * Handles task management, local storage persistence, filtering, and UI updates.
 */

// Storage Key
const STORAGE_KEY = 'student_tracker_tasks';

// Initial Sample Data (used only on very first visit)
const INITIAL_SAMPLE_TASKS = [
  {
    id: 'task-1',
    title: 'Complete Math Problem Set #4',
    subject: 'Mathematics',
    priority: 'High',
    dueDate: getRelativeDateString(1),
    completed: false,
    createdAt: Date.now() - 3600000 * 4,
  },
  {
    id: 'task-2',
    title: 'Submit Physics Lab Report on Optics',
    subject: 'Physics',
    priority: 'Medium',
    dueDate: getRelativeDateString(3),
    completed: false,
    createdAt: Date.now() - 3600000 * 2,
  },
  {
    id: 'task-3',
    title: 'Read Chapters 3-5 of The Great Gatsby',
    subject: 'English Literature',
    priority: 'Low',
    dueDate: '',
    completed: true,
    createdAt: Date.now() - 3600000 * 24,
  }
];

// Helper to get formatted date relative to today (YYYY-MM-DD)
function getRelativeDateString(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split('T')[0];
}

// App State
let tasks = [];
let currentStatusFilter = 'all';
let currentPriorityFilter = 'all';
let searchQuery = '';

// DOM Elements
const taskForm = document.getElementById('task-form');
const taskTitleInput = document.getElementById('task-title');
const taskSubjectInput = document.getElementById('task-subject');
const taskPriorityInput = document.getElementById('task-priority');
const taskDueDateInput = document.getElementById('task-due-date');

const tasksContainer = document.getElementById('tasks-container');
const emptyState = document.getElementById('empty-state');
const emptyTitle = document.getElementById('empty-title');
const emptyDesc = document.getElementById('empty-desc');
const taskListTitle = document.getElementById('task-list-title');
const filteredCountBadge = document.getElementById('filtered-count-badge');

const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search-btn');
const statusFilters = document.getElementById('status-filters');
const priorityFilter = document.getElementById('priority-filter');

const totalCountEl = document.getElementById('total-count');
const pendingCountEl = document.getElementById('pending-count');
const completedCountEl = document.getElementById('completed-count');
const progressPercentEl = document.getElementById('progress-percent');
const progressBarEl = document.getElementById('progress-bar');
const toastEl = document.getElementById('toast');

// --------------------------------------------------
// Initialization
// --------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  loadTasksFromStorage();
  attachEventListeners();
  renderApp();
});

// --------------------------------------------------
// LocalStorage Operations
// --------------------------------------------------
function loadTasksFromStorage() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      tasks = JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse tasks from localStorage', e);
      tasks = [...INITIAL_SAMPLE_TASKS];
      saveTasksToStorage();
    }
  } else {
    // First time visitor gets starter tasks
    tasks = [...INITIAL_SAMPLE_TASKS];
    saveTasksToStorage();
  }
}

function saveTasksToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// --------------------------------------------------
// Event Listeners
// --------------------------------------------------
function attachEventListeners() {
  // Add Task Form Submit
  taskForm.addEventListener('submit', handleAddTask);

  // Status Filter Tabs
  statusFilters.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
      statusFilters.querySelectorAll('.filter-btn').forEach((btn) => btn.classList.remove('active'));
      e.target.classList.add('active');
      currentStatusFilter = e.target.dataset.filter;
      renderApp();
    }
  });

  // Priority Dropdown Filter
  priorityFilter.addEventListener('change', (e) => {
    currentPriorityFilter = e.target.value;
    renderApp();
  });

  // Search Input
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim().toLowerCase();
    clearSearchBtn.classList.toggle('hidden', searchQuery.length === 0);
    renderApp();
  });

  // Clear Search
  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    clearSearchBtn.classList.add('hidden');
    searchInput.focus();
    renderApp();
  });
}

// --------------------------------------------------
// Task CRUD Handlers
// --------------------------------------------------
function handleAddTask(e) {
  e.preventDefault();

  const title = taskTitleInput.value.trim();
  const subject = taskSubjectInput.value.trim();
  const priority = taskPriorityInput.value;
  const dueDate = taskDueDateInput.value;

  if (!title || !subject) {
    showToast('Please fill in both Task Name and Subject.');
    return;
  }

  const newTask = {
    id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    title,
    subject,
    priority,
    dueDate,
    completed: false,
    createdAt: Date.now()
  };

  tasks.unshift(newTask);
  saveTasksToStorage();
  renderApp();

  // Reset form
  taskForm.reset();
  taskPriorityInput.value = 'Medium';
  taskTitleInput.focus();

  showToast(`Task "${title}" added successfully!`);
}

function toggleTaskComplete(taskId) {
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return;

  task.completed = !task.completed;
  saveTasksToStorage();
  renderApp();

  showToast(task.completed ? 'Task marked as completed! 🎉' : 'Task marked as pending.');
}

function deleteTask(taskId) {
  const task = tasks.find((t) => t.id === taskId);
  const taskTitle = task ? task.title : 'Task';

  tasks = tasks.filter((t) => t.id !== taskId);
  saveTasksToStorage();
  renderApp();

  showToast(`Deleted: "${taskTitle}"`);
}

// --------------------------------------------------
// Rendering Functions
// --------------------------------------------------
function renderApp() {
  updateStats();
  renderTasks();
}

function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  totalCountEl.textContent = total;
  pendingCountEl.textContent = pending;
  completedCountEl.textContent = completed;
  progressPercentEl.textContent = `${percent}%`;
  progressBarEl.style.width = `${percent}%`;
}

function getFilteredTasks() {
  return tasks.filter((task) => {
    // 1. Status Filter
    if (currentStatusFilter === 'pending' && task.completed) return false;
    if (currentStatusFilter === 'completed' && !task.completed) return false;

    // 2. Priority Filter
    if (currentPriorityFilter !== 'all' && task.priority !== currentPriorityFilter) return false;

    // 3. Search Query
    if (searchQuery) {
      const matchTitle = task.title.toLowerCase().includes(searchQuery);
      const matchSubject = task.subject.toLowerCase().includes(searchQuery);
      if (!matchTitle && !matchSubject) return false;
    }

    return true;
  });
}

function renderTasks() {
  const filteredTasks = getFilteredTasks();

  // Update header count badge
  filteredCountBadge.textContent = `${filteredTasks.length} ${filteredTasks.length === 1 ? 'task' : 'tasks'}`;

  // Update Section Title based on filter
  if (currentStatusFilter === 'pending') {
    taskListTitle.textContent = 'Pending Tasks';
  } else if (currentStatusFilter === 'completed') {
    taskListTitle.textContent = 'Completed Tasks';
  } else {
    taskListTitle.textContent = 'My Tasks';
  }

  // Handle Empty State
  if (filteredTasks.length === 0) {
    tasksContainer.innerHTML = '';
    emptyState.classList.remove('hidden');

    if (tasks.length === 0) {
      emptyTitle.textContent = 'No tasks yet';
      emptyDesc.textContent = 'Create your first assignment or task using the form on the left!';
    } else if (searchQuery) {
      emptyTitle.textContent = 'No matching tasks';
      emptyDesc.textContent = `No results found for "${searchQuery}". Try clearing your search.`;
    } else {
      emptyTitle.textContent = `No ${currentStatusFilter} tasks`;
      emptyDesc.textContent = `There are no tasks matching the selected filter.`;
    }
    return;
  }

  emptyState.classList.add('hidden');

  // Build Task Cards HTML
  tasksContainer.innerHTML = filteredTasks.map((task) => createTaskCardHTML(task)).join('');

  // Attach card event listeners (toggle checkbox & delete)
  filteredTasks.forEach((task) => {
    const card = document.getElementById(`card-${task.id}`);
    if (!card) return;

    const checkbox = card.querySelector('.task-checkbox');
    const deleteBtn = card.querySelector('.btn-delete');

    if (checkbox) {
      checkbox.addEventListener('change', () => toggleTaskComplete(task.id));
    }

    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => deleteTask(task.id));
    }
  });
}

function createTaskCardHTML(task) {
  const priorityClass = `priority-${task.priority.toLowerCase()}`;
  const priorityEmoji = task.priority === 'High' ? '🔴' : task.priority === 'Medium' ? '🟡' : '🟢';
  
  // Format due date
  let dueDateHTML = '';
  if (task.dueDate) {
    const isOverdue = !task.completed && new Date(task.dueDate + 'T23:59:59') < new Date();
    const formattedDate = formatReadableDate(task.dueDate);
    dueDateHTML = `
      <div class="due-date ${isOverdue ? 'overdue' : ''}" title="Due date">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <span>${isOverdue ? 'Overdue: ' : 'Due: '}${escapeHTML(formattedDate)}</span>
      </div>
    `;
  }

  return `
    <article class="task-card ${task.completed ? 'completed' : ''}" id="card-${task.id}" data-priority="${escapeHTML(task.priority)}">
      <div>
        <div class="task-card-header">
          <div class="task-badges">
            <span class="subject-badge">${escapeHTML(task.subject)}</span>
            <span class="priority-badge ${priorityClass}">
              ${priorityEmoji} ${escapeHTML(task.priority)}
            </span>
          </div>
          <button type="button" class="btn-delete" title="Delete Task" aria-label="Delete task">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </div>

        <h3 class="task-title">${escapeHTML(task.title)}</h3>
      </div>

      <div class="task-card-footer">
        <label class="checkbox-container" title="Toggle task completion">
          <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} />
          <span class="custom-checkmark">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </span>
          <span>${task.completed ? 'Done' : 'Mark done'}</span>
        </label>

        ${dueDateHTML}
      </div>
    </article>
  `;
}

// --------------------------------------------------
// Utility Functions
// --------------------------------------------------
function formatReadableDate(dateString) {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  const dateObj = new Date(year, month - 1, day);
  return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

let toastTimeout = null;
function showToast(message) {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.classList.add('show');

  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }

  toastTimeout = setTimeout(() => {
    toastEl.classList.remove('show');
  }, 2600);
}
