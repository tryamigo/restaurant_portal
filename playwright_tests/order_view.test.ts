import { test, expect, Page } from '@playwright/test';

test.describe('Orders Details Functionality', () => {
  
  const login = async (page: Page) => {
    await page.goto('https://restaurant.navya.so/sign-in?callbackUrl=%2F');
    await page.fill('input#mobile', '9002130542');
    await page.click('button:has-text("Send OTP")');
    
    const otpFields = page.locator('input[type="text"]');
    for (let i = 0; i < 6; i++) {
      await otpFields.nth(i).fill((i + 1).toString());
    }
    
    await page.click('button:has-text("Login")');
    await expect(page).toHaveURL('https://restaurant.navya.so/orders');
    await page.goto('https://restaurant.navya.so/orders/0cf5234f-a352-11ef-baba-96f21672413c');
  };

  test.beforeEach(async ({ page }) => {
    await login(page);
  });   

  test('Check page content', async ({ page }) => {
    
    expect(page.getByRole('heading', { name: 'Order #0cf5234f-a352-11ef-' })).toBeVisible();
    expect(page.getByRole('button', { name: 'Back to Orders' })).toBeVisible();
    expect(page.getByRole('button', { name: 'Back to Orders' })).toBeEnabled();
    expect(page.getByRole('button', { name: 'Update Status' })).toBeVisible();
    expect(page.getByRole('button', { name: 'Update Status' })).toBeEnabled();
    
    //Update Status
    page.getByRole('button', { name: 'Update Status' }).click();
    await page.waitForSelector('text=Edit Order Status', { timeout: 5000 });
    expect(page.getByText('Edit Order Status')).toBeVisible();
    await page.waitForSelector('text=Update the status of this', { timeout: 5000 });
    expect(page.getByText('Update the status of this')).toBeVisible();
    const orderStatusLabel = page.locator('label:text("Order Status")');
    await expect(orderStatusLabel).toBeVisible();

    expect(page.getByRole('combobox')).toBeVisible();
    await page.getByRole('combobox').click();
    expect(page.getByLabel('Pending')).toBeVisible();
    expect(page.getByText('Preparing')).toBeVisible();
    expect(page.getByText('On the way')).toBeVisible();
    expect(page.getByLabel('Delivered')).toBeVisible();
    page.getByText('On the way').click();
    await expect(page.locator('button:has-text("Cancel")')).toBeVisible();
    await expect(page.locator('button:has-text("Save Changes")')).toBeVisible();
    await page.locator('button:has-text("Save Changes")').click();
    expect(page.getByText('Placed on November 15, 2024')).toBeVisible();
    expect(page.getByText('Current order status')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'On the way' })).toBeVisible();
    expect(page.locator('div').filter({ hasText: /^on the way$/ })).toBeVisible();
    expect(page.getByRole('cell', { name: 'Product' })).toBeVisible();
    expect(page.getByRole('cell', { name: 'Quantity' })).toBeVisible();
    expect(page.getByRole('cell', { name: 'Price' })).toBeVisible();
    expect(page.getByRole('cell', { name: 'Total', exact: true })).toBeVisible();
    expect(page.getByRole('cell', { name: 'Margherita Pizza' })).toBeVisible();
    expect(page.getByRole('cell', { name: 'Tomato, mozzarella, and basil' })).toBeVisible();
    expect(page.getByRole('cell', { name: '1' })).toBeVisible();
    expect(page.getByRole('cell', { name: 'Subtotal:' })).toBeVisible();
    expect(page.getByRole('cell', { name: 'Discount:' })).toBeVisible();
    expect(page.getByRole('cell', { name: '-₹' })).toBeVisible();
    expect(page.getByRole('cell', { name: 'Total Payable:' })).toBeVisible();
    expect(page.getByRole('cell', { name: '₹' }).nth(2)).toBeVisible();
  });


  test('should update order status and SCG logo dynamically', async ({ page }) => {

    // Verify initial status and logo
    const initialstatus = await page.getByRole('heading', { name: 'pending' }).innerText();
    const initialsmallstatus =   await page.locator('div').filter({ hasText: /^pending$/ }).innerText();
    const initialLogoSrc = page.getByRole('main').getByRole('img').nth(2)
    
    // Click on the "Edit" button
    page.getByRole('button', { name: 'Update Status' }).click();

    // Change the order status to "on the way"
        await page.getByRole('combobox').click();
        page.getByText('On the way').click();   
    // Save the changes
    page.getByRole('button', { name: 'Save Changes' }).click();

    // Verify the updated status
    const updatedStatus = await page.getByRole('heading', { name: 'on the way' }).innerText();
    expect(updatedStatus).not.toBe(initialstatus);

    // Verify the SCG logo changes dynamically
    const updatedLogoSrc =  page.getByRole('main').getByRole('img').nth(2)
    expect(updatedLogoSrc).not.toBe(initialLogoSrc);
    expect(updatedLogoSrc).not.toBe(initialsmallstatus);

    // Verify the status and logo are correct for the updated status
    if (updatedStatus.trim() === 'on the way') {
      expect(updatedLogoSrc); // Replace with actual logo file name
    }
  });

    test('Check page content for mobile View', async ({ page }) => {
    
    await page.setViewportSize({ width: 375, height: 667 });
    expect(page.getByRole('heading', { name: 'Order #0cf5234f-a352-11ef-' })).toBeVisible();
    expect(page.getByRole('button', { name: 'Back to Orders' })).toBeVisible();
    expect(page.getByRole('button', { name: 'Back to Orders' })).toBeEnabled();
    expect(page.getByRole('button', { name: 'Update Status' })).toBeVisible();
    expect(page.getByRole('button', { name: 'Update Status' })).toBeEnabled();
    
    //Update Status
    page.getByRole('button', { name: 'Update Status' }).click();
    await page.waitForSelector('text=Edit Order Status', { timeout: 5000 });
    expect(page.getByText('Edit Order Status')).toBeVisible();
    await page.waitForSelector('text=Update the status of this', { timeout: 5000 });
    expect(page.getByText('Update the status of this')).toBeVisible();
    const orderStatusLabel = page.locator('label:text("Order Status")');
    await expect(orderStatusLabel).toBeVisible();

    expect(page.getByRole('combobox')).toBeVisible();
    await page.getByRole('combobox').click();
    expect(page.getByLabel('Pending')).toBeVisible();
    expect(page.getByText('Preparing')).toBeVisible();
    expect(page.getByText('On the way')).toBeVisible();
    expect(page.getByLabel('Delivered')).toBeVisible();
    page.getByText('On the way').click();
    await expect(page.locator('button:has-text("Cancel")')).toBeVisible();
    await expect(page.locator('button:has-text("Save Changes")')).toBeVisible();
    await page.locator('button:has-text("Save Changes")').click();
    expect(page.getByText('Placed on November 15, 2024')).toBeVisible();
    expect(page.getByText('Current order status')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'On the way' })).toBeVisible();
    expect(page.locator('div').filter({ hasText: /^on the way$/ })).toBeVisible();
    expect(page.getByRole('cell', { name: 'Product' })).toBeVisible();
    expect(page.getByRole('cell', { name: 'Quantity' })).toBeVisible();
    expect(page.getByRole('cell', { name: 'Price' })).toBeVisible();
    expect(page.getByRole('cell', { name: 'Total', exact: true })).toBeVisible();
    expect(page.getByRole('cell', { name: 'Margherita Pizza' })).toBeVisible();
    expect(page.getByRole('cell', { name: 'Tomato, mozzarella, and basil' })).toBeVisible();
    expect(page.getByRole('cell', { name: '1' })).toBeVisible();
    expect(page.getByRole('cell', { name: 'Subtotal:' })).toBeVisible();
    expect(page.getByRole('cell', { name: 'Discount:' })).toBeVisible();
    expect(page.getByRole('cell', { name: '-₹' })).toBeVisible();
    expect(page.getByRole('cell', { name: 'Total Payable:' })).toBeVisible();
    expect(page.getByRole('cell', { name: '₹' }).nth(2)).toBeVisible();
  });

});   