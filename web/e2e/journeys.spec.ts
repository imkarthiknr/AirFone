import { Page, expect, test } from '@playwright/test';

const year = String(new Date().getFullYear() + 2);

async function payWith(page: Page, number: string) {
  await page.getByLabel('Name on card').fill('E2E Tester');
  await page.getByLabel(/Card number/).fill(number);
  await page.getByLabel('Exp. month').selectOption('12');
  await page.getByLabel('Exp. year').selectOption(year);
  await page.getByLabel('CVV').fill('123');
  await page.getByRole('button', { name: /^Pay/ }).click();
}

test('new customer: register → log in → recharge (decline, then success) → bills', async ({
  page,
}) => {
  await page.goto('/register');
  await page.getByLabel('postpaid').check();
  await page.getByLabel('Full name').fill('E2E Tester');
  await page.getByLabel('Date of birth').fill('1995-05-05');
  await page.getByLabel('Email').fill(`e2e-${Date.now()}@example.com`);
  await page.getByLabel('Occupation').fill('Tester');
  await page.getByLabel('Aadhaar number').fill('2345 6789 0124');
  await page.getByLabel('Password').fill('airfone123');
  await page.getByLabel('House number').fill('1');
  await page.getByLabel('Street').fill('Test Street');
  await page.getByLabel('City').fill('Chennai');
  await page.getByLabel('State').fill('Tamil Nadu');
  await page.getByLabel('PIN code').fill('600001');
  await page.getByRole('button', { name: 'Register' }).click();

  const number = (await page.getByTestId('new-number').textContent())!.trim();
  expect(number).toMatch(/^[6-9]\d{9}$/);

  await page.getByRole('link', { name: 'Log in now' }).click();
  await expect(page.getByLabel('Mobile number')).toHaveValue(number);
  await page.getByLabel('Password').fill('airfone123');
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page.getByText('No active pack')).toBeVisible();

  await page.getByRole('link', { name: 'Recharge now' }).click();
  await expect(page).toHaveURL(/\/plans\/postpaid$/);
  await page
    .locator('app-plan-card', { hasText: 'Postpaid 400' })
    .getByRole('link', { name: 'Recharge' })
    .click();
  await payWith(page, '4000 0000 0000 0002');
  await expect(page.getByRole('alert').filter({ hasText: 'declined' })).toBeVisible();
  await payWith(page, '4242 4242 4242 4242');
  await expect(page.getByRole('heading', { name: 'Recharge successful' })).toBeVisible();
  await expect(page.getByText('Visa •••• 4242')).toBeVisible();

  await page.goto('/history');
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await expect(page.locator('tbody')).toContainText('Postpaid 400');
  await page.goto('/dashboard');
  await expect(page.getByText('30 days left')).toBeVisible();
});

test('complaint lifecycle: customer raises → admin responds → customer sees reply', async ({
  page,
}) => {
  await page.goto('/login');
  await page.getByLabel('Mobile number').fill('9000000004');
  await page.getByLabel('Password').fill('airfone123');
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto('/help/support');
  await page
    .getByLabel("What's going wrong?")
    .fill('E2E: no network in my building since yesterday.');
  await page.getByRole('button', { name: 'Submit complaint' }).click();
  const ticketNo = (await page.locator('.tickets li strong').first().textContent())!.trim();
  await page.getByRole('button', { name: 'Log out' }).click();

  await page.goto('/admin/login');
  await page.getByLabel('Username').fill('admin');
  await page.getByLabel('Password').fill('admin12345');
  await page.getByRole('button', { name: 'Log in' }).click();
  await page
    .getByRole('navigation', { name: 'Admin' })
    .getByRole('link', { name: 'Complaints' })
    .click();
  await page.locator('tr', { hasText: ticketNo }).getByRole('link', { name: 'Respond' }).click();
  await page
    .getByLabel(/Message to/)
    .fill('We fixed the antenna on your building. Please check now.');
  await page.getByRole('button', { name: /Send mail/ }).click();
  await expect(page.getByText('Response sent')).toBeVisible();

  await page
    .getByRole('navigation', { name: 'Admin' })
    .getByRole('link', { name: 'Outbox' })
    .click();
  await expect(page.locator('tbody tr').first()).toContainText(
    `Response to your complaint ${ticketNo}`,
  );
  await page.getByRole('button', { name: 'Log out' }).click();

  await page.goto('/login');
  await page.getByLabel('Mobile number').fill('9000000004');
  await page.getByLabel('Password').fill('airfone123');
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto('/help/support');
  const mine = page.locator('.tickets li', { hasText: ticketNo });
  await expect(mine.locator('.badge')).toHaveText('resolved');
  await expect(mine).toContainText('We fixed the antenna');
});

test('admin: dashboard, customer search/update and billing report', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin\/login/);
  await page.getByLabel('Username').fill('admin');
  await page.getByLabel('Password').fill('admin12345');
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page.getByText('Customers by connection')).toBeVisible();

  await page
    .getByRole('navigation', { name: 'Admin' })
    .getByRole('link', { name: 'Customers' })
    .click();
  await page.getByPlaceholder('Search name, email or mobile').fill('Leela');
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await page.getByRole('link', { name: 'Manage' }).click();
  await page.getByLabel('Connection type').selectOption('postpaid');
  await page.getByRole('button', { name: 'Update' }).click();
  await expect(page.getByRole('status')).toContainText('Customer updated');

  await page
    .getByRole('navigation', { name: 'Admin' })
    .getByRole('link', { name: 'Bill generation' })
    .click();
  await page.getByLabel('Start date').fill('2000-01-01');
  await page.getByRole('button', { name: 'Generate' }).click();
  await expect(page.locator('tfoot')).toContainText('Total');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download CSV' }).click();
  expect((await download).suggestedFilename()).toMatch(/^airfone-bills-.*\.csv$/);
});

test('guards and 404', async ({ page }) => {
  await page.goto('/history');
  await expect(page).toHaveURL(/\/login\?returnUrl=%2Fhistory/);
  await page.goto('/admin/customers');
  await expect(page).toHaveURL(/\/admin\/login/);
  await page.goto('/does-not-exist');
  await expect(page.getByRole('heading', { name: /Page not found/ })).toBeVisible();
});
