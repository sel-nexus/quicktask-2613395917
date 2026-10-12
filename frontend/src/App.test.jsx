import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App.jsx';

/**
 * Render the task manager with a fresh browser storage state.
 * @returns {void}
 */
function renderApp() {
  window.localStorage.clear();
  render(<App />);
}

describe('QuickTask task lifecycle', () => {
  it('shows the required empty state and zero counts', () => {
    renderApp();

    expect(screen.getByText('No tasks yet. Add your first task!')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('0 tasks');
    expect(screen.getByRole('status')).toHaveTextContent('0 completed');
  });

  it('adds a trimmed task with the button and clears the input', async () => {
    const user = userEvent.setup();
    renderApp();
    const input = screen.getByRole('textbox', { name: 'Enter a task' });

    await user.type(input, '  Buy groceries  ');
    await user.click(screen.getByRole('button', { name: 'Add Task' }));

    expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    expect(input).toHaveValue('');
    expect(screen.getByRole('status')).toHaveTextContent('1 task');
  });

  it('adds a task when Enter is pressed', async () => {
    const user = userEvent.setup();
    renderApp();
    const input = screen.getByRole('textbox', { name: 'Enter a task' });

    await user.type(input, 'Send the report{Enter}');

    expect(screen.getByText('Send the report')).toBeInTheDocument();
    expect(input).toHaveValue('');
  });

  it('rejects empty and whitespace-only submissions', async () => {
    const user = userEvent.setup();
    renderApp();
    const input = screen.getByRole('textbox', { name: 'Enter a task' });
    const addButton = screen.getByRole('button', { name: 'Add Task' });

    await user.click(addButton);
    await user.type(input, '   ');
    await user.click(addButton);

    expect(screen.getByText('No tasks yet. Add your first task!')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('0 tasks');
  });

  it('renders tasks in insertion order with a checkbox and Delete button', async () => {
    const user = userEvent.setup();
    renderApp();
    const input = screen.getByRole('textbox', { name: 'Enter a task' });

    await user.type(input, 'First task{Enter}');
    await user.type(input, 'Second task{Enter}');

    const list = screen.getByRole('list', { name: 'Task list' });
    const rows = within(list).getAllByRole('listitem');
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent('First task');
    expect(rows[1]).toHaveTextContent('Second task');
    expect(within(rows[0]).getByRole('checkbox', { name: 'Mark First task as complete' })).toBeInTheDocument();
    expect(within(rows[0]).getByRole('button', { name: 'Delete First task' })).toHaveTextContent('Delete');
  });

  it('toggles completion on and off and updates the completed count', async () => {
    const user = userEvent.setup();
    renderApp();
    const input = screen.getByRole('textbox', { name: 'Enter a task' });
    await user.type(input, 'Read a chapter{Enter}');

    const checkbox = screen.getByRole('checkbox', { name: 'Mark Read a chapter as complete' });
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
    expect(screen.getByText('Read a chapter').closest('li')).toHaveClass('task-row--completed');
    expect(screen.getByRole('status')).toHaveTextContent('1 completed');

    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
    expect(screen.getByText('Read a chapter').closest('li')).not.toHaveClass('task-row--completed');
    expect(screen.getByRole('status')).toHaveTextContent('0 completed');
  });

  it('deletes a task and updates total and completed counts', async () => {
    const user = userEvent.setup();
    renderApp();
    const input = screen.getByRole('textbox', { name: 'Enter a task' });
    await user.type(input, 'Archive notes{Enter}');
    await user.click(screen.getByRole('checkbox', { name: 'Mark Archive notes as complete' }));
    await user.click(screen.getByRole('button', { name: 'Delete Archive notes' }));

    expect(screen.queryByText('Archive notes')).not.toBeInTheDocument();
    expect(screen.getByText('No tasks yet. Add your first task!')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('0 tasks');
    expect(screen.getByRole('status')).toHaveTextContent('0 completed');
  });

  it('persists tasks and restores them after a fresh render', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);
    const input = screen.getByRole('textbox', { name: 'Enter a task' });
    await user.type(input, 'Call the dentist{Enter}');
    await user.click(screen.getByRole('checkbox', { name: 'Mark Call the dentist as complete' }));
    unmount();

    render(<App />);

    expect(screen.getByText('Call the dentist')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Mark Call the dentist as complete' })).toBeChecked();
    expect(screen.getByRole('status')).toHaveTextContent('1 completed');
  });

  it('recovers from malformed LocalStorage data without crashing', () => {
    window.localStorage.setItem('quicktask.tasks', '{not valid json');

    render(<App />);

    expect(screen.getByText('No tasks yet. Add your first task!')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('0 tasks');
  });
});
