import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const STORAGE_KEY = 'quicktask.tasks';

/**
 * Load valid task records from browser storage.
 * @returns {Array<{id: string, text: string, completed: boolean}>} Saved tasks, or an empty list when storage is unavailable or invalid.
 */
function loadTasks() {
  try {
    const storedTasks = window.localStorage.getItem(STORAGE_KEY);
    if (!storedTasks) return [];

    const parsedTasks = JSON.parse(storedTasks);
    if (!Array.isArray(parsedTasks)) return [];

    return parsedTasks.filter(
      (task) =>
        task &&
        typeof task.id === 'string' &&
        typeof task.text === 'string' &&
        typeof task.completed === 'boolean',
    );
  } catch {
    return [];
  }
}

/**
 * Render one task with completion and deletion controls.
 * @param {{task: {id: string, text: string, completed: boolean}, onToggle: (id: string) => void, onDelete: (id: string) => void}} props Task data and action handlers.
 * @returns {JSX.Element} An accessible task row.
 */
function TaskRow({ task, onToggle, onDelete }) {
  return (
    <li className={`task-row${task.completed ? ' task-row--completed' : ''}`}>
      <label className="task-label">
        <input
          aria-label={`Mark ${task.text} as complete`}
          checked={task.completed}
          className="task-checkbox"
          onChange={() => onToggle(task.id)}
          type="checkbox"
        />
        <span className="task-text">{task.text}</span>
      </label>
      <button
        aria-label={`Delete ${task.text}`}
        className="delete-button"
        onClick={() => onDelete(task.id)}
        type="button"
      >
        Delete
      </button>
    </li>
  );
}

TaskRow.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    completed: PropTypes.bool.isRequired,
  }).isRequired,
  onToggle: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

/**
 * Render the QuickTask task manager and persist its task list in LocalStorage.
 * @returns {JSX.Element} The single-page task management interface.
 */
function App() {
  const [tasks, setTasks] = useState(loadTasks);
  const [taskInput, setTaskInput] = useState('');
  const completedCount = tasks.filter((task) => task.completed).length;

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // Keep the in-memory task list usable when browser storage is unavailable.
    }
  }, [tasks]);

  /**
   * Add a trimmed task when the input contains non-whitespace text.
   * @param {import('react').FormEvent<HTMLFormElement>} event Form submission event.
   * @returns {void}
   */
  function handleSubmit(event) {
    event.preventDefault();
    const text = taskInput.trim();
    if (!text) return;

    setTasks((currentTasks) => [
      ...currentTasks,
      { id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`, text, completed: false },
    ]);
    setTaskInput('');
  }

  /**
   * Toggle completion for the task with the supplied identifier.
   * @param {string} taskId Identifier of the task to update.
   * @returns {void}
   */
  function handleToggle(taskId) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    );
  }

  /**
   * Remove the task with the supplied identifier.
   * @param {string} taskId Identifier of the task to remove.
   * @returns {void}
   */
  function handleDelete(taskId) {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));
  }

  return (
    <main className="page-shell">
      <section aria-labelledby="page-title" className="task-card">
        <header className="task-header">
          <p className="section-label">YOUR DAILY LIST</p>
          <h1 id="page-title">QuickTask</h1>
          <p className="subtitle">Keep your day organized</p>
        </header>

        <form className="task-form" onSubmit={handleSubmit}>
          <label className="visually-hidden" htmlFor="task-input">
            Enter a task
          </label>
          <input
            autoComplete="off"
            id="task-input"
            onChange={(event) => setTaskInput(event.target.value)}
            placeholder="Enter a task"
            type="text"
            value={taskInput}
          />
          <button className="add-button" type="submit">
            Add Task
          </button>
        </form>

        <div aria-live="polite" className="task-summary" role="status">
          <span>{tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}</span>
          <span className="summary-divider" aria-hidden="true">·</span>
          <span>{completedCount} completed</span>
        </div>

        {tasks.length === 0 ? (
          <p className="empty-state">No tasks yet. Add your first task!</p>
        ) : (
          <ul aria-label="Task list" className="task-list">
            {tasks.map((task) => (
              <TaskRow
                key={task.id}
                onDelete={handleDelete}
                onToggle={handleToggle}
                task={task}
              />
            ))}
          </ul>
        )}
      </section>
      <p className="page-note">A little progress, one task at a time.</p>
    </main>
  );
}

export default App;
