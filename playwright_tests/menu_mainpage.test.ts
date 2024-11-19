import { test, expect, Page } from '@playwright/test';

test.describe('Menu Management Functionality', () => {
  
  const login = async (page: Page) => {
    await page.goto('https://restaurant.navya.so/sign-in?callbackUrl=%2F');
    await page.fill('input#mobile', '+919002130542');
    await page.click('button:has-text("Send OTP")');
    
    const otpFields = page.locator('input[type="text"]');
    for (let i = 0; i < 6; i++) {
      await otpFields.nth(i).fill((i + 1).toString());
    }
    
    await page.click('button:has-text("Login")');
    await expect(page).toHaveURL('https://restaurant.navya.so/orders');
  };

  const gotoMenuPage = async (page: Page) => {
    await page.goto('https://restaurant.navya.so/menu');
  };

  test.beforeEach(async ({ page }) => {
    await login(page);
    await gotoMenuPage(page);
  });

  // 1. Verify menu items are displayed correctly in the table
  test('Verify menu items display correctly in table', async ({ page }) => {
    // Step 1: Check for table headers
    await expect(page.locator('table thead tr th:nth-child(1)')).toHaveText('Item');
    await expect(page.locator('table thead tr th:nth-child(2)')).toHaveText('Description');
    await expect(page.locator('table thead tr th:nth-child(3)')).toHaveText('Price');
    await expect(page.locator('table thead tr th:nth-child(4)')).toHaveText('Ratings');
    await expect(page.locator('table thead tr th:nth-child(5)')).toHaveText('Discounts');
    await expect(page.locator('table thead tr th:nth-child(6)')).toHaveText('Image');
    await expect(page.locator('table thead tr th:nth-child(7)')).toHaveText('Actions');
    
    // Step 2: Check if menu items are displayed properly
    const item = page.locator('table tbody tr:nth-child(1) td:nth-child(1)');
    const description = page.locator('table tbody tr:nth-child(1) td:nth-child(2)');
    const price = page.locator('table tbody tr:nth-child(1) td:nth-child(3)');
    const ratings = page.locator('table tbody tr:nth-child(1) td:nth-child(4)');
    const discounts = page.locator('table tbody tr:nth-child(1) td:nth-child(5)');
    const image = page.locator('table tbody tr:nth-child(1) td:nth-child(6) img');
    const actions = page.locator('table tbody tr:nth-child(1) td:nth-child(7)');
    
    // Ensure the content is populated correctly
    await expect(item).toHaveText('Pizza');
    await expect(description).toHaveText('Cheese Pizza');
    await expect(price).toHaveText('₹10.99');
    await expect(ratings).toHaveText('4.00');
    await expect(discounts).toHaveText('20.00%');
    await expect(actions).toHaveText(/Edit|Delete/); // Actions should contain either "Edit" or "Delete"

    // Optionally, check if the image is visible 
    await expect(image).toBeVisible();

    // Optionally, check if the action buttons are Visible
    const editButton = page.locator('.px-6 > button:nth-child(1)').first();
    const deleteButton = page.locator('.px-6 > button:nth-child(2)').first();
    await expect(editButton).toBeVisible(); 
    await expect(deleteButton).toBeVisible(); 

  });

  // 2. Inline Editing of Menu Item (including all fields)
  test('Inline editing of menu item details', async ({ page }) => {
    // Click the first edit button to open the edit modal or form
    await page.getByRole('row', { name: 'Pizza Cheese Pizza ₹10.99 4.00 20.' }).getByRole('button').first().click();
  
    // Fill in the fields for name, description, price, ratings, discounts, and image link
    await page.fill('#name', 'Pizza');
    await page.fill('#description', 'Cheese Pizza');
    await page.fill('input[id="price"]', '10.99');
    await page.fill('#ratings', '4');
    await page.fill('#discounts', '20');
    await page.fill('#imageLink', 'https://example.com/image.jpg');

    await page.getByRole('button', { name: 'Update Item' }).click();
    // Assert that the success message is visible and contains the expected text
     await expect(page.locator('div.success-message')).toHaveText('Item deleted successfully');   
  });
  

  // 3. Deleting a Menu Item
  test('Deleting a menu item with confirmation', async ({ page }) => {
    await page.locator('.px-6 > button:nth-child(2)').first().click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await expect(page.locator('div.success-message')).toHaveText('Item deleted successfully');
  });

  // 4. Cancel Deleting  a Menu Item
  test('Cancelling the delete option', async ({ page }) => {
    await page.locator('.px-6 > button:nth-child(2)').first().click();
    await page.getByRole('button', { name: 'Cancel' }).click();
  });
  
  // 5. Handling Errors during Fetch
  test('Handling errors during fetch', async ({ page }) => {
    await page.route('**/menu-items', (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });
    
    await page.goto('https://restaurant.navya.so/menu');
    
    await expect(page.locator('div.error-message')).toHaveText('Failed to load menu items. Please try again.');
  });

//   5. Mobile View Responsiveness Test
  test('UI responsiveness in mobile view', async ({ page }) => {
    // Set mobile view size (375px by 667px) for testing responsiveness
    await page.setViewportSize({ width: 375, height: 667 });
  
    // Step 1: Check for table headers and ensure they are visible
    await expect(page.locator('table thead tr th:nth-child(1)')).toHaveText('Item');
    await expect(page.locator('table thead tr th:nth-child(2)')).toHaveText('Description');
    await expect(page.locator('table thead tr th:nth-child(3)')).toHaveText('Price');
    await expect(page.locator('table thead tr th:nth-child(4)')).toHaveText('Ratings');
    await expect(page.locator('table thead tr th:nth-child(5)')).toHaveText('Discounts');
    await expect(page.locator('table thead tr th:nth-child(6)')).toHaveText('Image');
    await expect(page.locator('table thead tr th:nth-child(7)')).toHaveText('Actions');
    
    // Step 2: Check if menu items are displayed properly and verify visibility
    const item = page.locator('table tbody tr:nth-child(1) td:nth-child(1)');
    const description = page.locator('table tbody tr:nth-child(1) td:nth-child(2)');
    const price = page.locator('table tbody tr:nth-child(1) td:nth-child(3)');
    const ratings = page.locator('table tbody tr:nth-child(1) td:nth-child(4)');
    const discounts = page.locator('table tbody tr:nth-child(1) td:nth-child(5)');
    const image = page.locator('table tbody tr:nth-child(1) td:nth-child(6) img');
    const actions = await page.locator('table tbody tr:nth-child(1) td:nth-child(7)');
  
    // Ensure the content is populated correctly
    await expect(item).toHaveText('Pizza');
    await expect(description).toHaveText('Cheese Pizza');
    await expect(price).toHaveText('₹10.99');
    await expect(ratings).toHaveText('4.00');
    await expect(discounts).toHaveText('20.00%');
    await expect(actions).toHaveText(/Edit|Delete/); // Actions should contain either "Edit" or "Delete"

    
    await expect(image).toBeVisible();
    // Optionally, check if the action buttons are clickable
    const editButton = page.locator('.px-6 > button:nth-child(1)').first();
    const deleteButton = page.locator('.px-6 > button:nth-child(2)').first();
    await expect(editButton).toBeVisible(); 
    await expect(deleteButton).toBeVisible(); 
  });
  
});
