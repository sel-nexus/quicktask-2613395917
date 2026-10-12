import { expect, test } from '@playwright/test';

test('manages tasks through completion, deletion, and browser reload', async ({ page }) => {
  const browserErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text());
  });
  page.on('pageerror', (error) => browserErrors.push(error.message));

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'QuickTask' })).toBeVisible();
  await expect(page.getByText('No tasks yet. Add your first task!')).toBeVisible();

  const input = page.getByRole('textbox', { name: 'Enter a task' });
  await page.getByRole('button', { name: 'Add Task' }).click();
  await expect(page.getByRole('status')).toContainText('0 tasks');
  await expect(page.getByText('No tasks yet. Add your first task!')).toBeVisible();
  await input.fill('Prepare weekly plan');
  await input.press('Enter');
  await expect(page.getByText('Prepare weekly plan')).toBeVisible();
  await expect(page.getByRole('status')).toContainText('1 task');
  await expect(input).toHaveValue('');

  await page.getByRole('button', { name: 'Add Task' }).click();
  await input.fill('Review project notes');
  await page.getByRole('button', { name: 'Add Task' }).click();
  await expect(page.getByRole('listitem').nth(0)).toContainText('Prepare weekly plan');
  await expect(page.getByRole('listitem').nth(1)).toContainText('Review project notes');

  await page.getByRole('checkbox', { name: 'Mark Prepare weekly plan as complete' }).check();
  await expect(page.getByRole('listitem').nth(0)).toHaveClass(/task-row--completed/);
  await expect(page.getByRole('status')).toContainText('1 completed');
  await page.screenshot({ path: 'test-results/quicktask-desktop.png', fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(input).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add Task' })).toBeVisible();
  await expect(page.getByRole('listitem')).toHaveCount(2);
  await page.screenshot({ path: 'test-results/quicktask-mobile.png', fullPage: true });

  await page.reload();
  await expect(page.getByText('Prepare weekly plan')).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Mark Prepare weekly plan as complete' })).toBeChecked();
  await expect(page.getByText('Review project notes')).toBeVisible();

  await page.getByRole('button', { name: 'Delete Prepare weekly plan' }).click();
  await expect(page.getByText('Prepare weekly plan')).toHaveCount(0);
  await expect(page.getByRole('status')).toContainText('1 task');
  await expect(page.getByRole('status')).toContainText('0 completed');

  await page.getByRole('button', { name: 'Delete Review project notes' }).click();
  await expect(page.getByText('No tasks yet. Add your first task!')).toBeVisible();
  await expect(page.getByRole('status')).toContainText('0 tasks');
  expect(browserErrors).toEqual([]);
});
