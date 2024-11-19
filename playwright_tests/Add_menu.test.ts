import { test, expect, Page } from "@playwright/test";

test.describe("Add Menu Items functionality", () => {
  // This function is used to login
  const login = async (page: Page) => {
    await page.goto("https://restaurant.navya.so/sign-in?callbackUrl=%2F");
    await page.fill("input#mobile", "+919002130542");
    await page.click('button:has-text("Send OTP")');

    const otpFields = page.locator('input[type="text"]');
    for (let i = 0; i < 6; i++) {
      await otpFields.nth(i).fill((i + 1).toString());
    }

    await page.click('button:has-text("Login")');
    await expect(page).toHaveURL("https://restaurant.navya.so/orders");
  };

  // This function is used to navigate to the Coupons Page
  const gotomenuPage = async (page: Page) => {
    await page.goto("https://restaurant.navya.so/menu");
    // const plussvg = page.locator('svg[xmlns="http://www.w3.org/2000/svg"]');
    // await expect(plussvg).toBeVisible();
    const addNewCouponButton = page.locator('button:has-text("Add Item")');
    await expect(addNewCouponButton).toBeVisible();
    await expect(addNewCouponButton).toBeEnabled();
    await addNewCouponButton.click();
  };

  // Before each test, we ensure we're logged in and on the Coupons Page
  test.beforeEach(async ({ page }) => {
    await login(page);
    await gotomenuPage(page);
  });

  // Test Case 1: Verify UI Elements on Load
  test('Verify all necessary fields and buttons are visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Add New Menu Item' })).toBeVisible();
    await expect(page.getByText('Item Name')).toBeVisible();
    await expect(page.getByLabel('Add New Menu Item').getByText('Description')).toBeVisible();
    await expect(page.getByLabel('Add New Menu Item').getByText('Price')).toBeVisible();
    await expect(page.getByLabel('Add New Menu Item').getByText('Ratings')).toBeVisible();
    await expect(page.getByText('Discount (%)')).toBeVisible();
    await expect(page.getByText('Image URL')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add Item' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add Item' })).toBeEnabled();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
await expect(page.getByRole('button', { name: 'Cancel' })).toBeEnabled();
  });

  // Test Case 2: Verify Required Field Validation
  test('Verify validation when fields are empty', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Item' }).click();
    await expect(page.locator('text=Name must be at least 2 characters long')).toBeVisible();
    await expect(page.locator('text=Description must be at least 5 characters long')).toBeVisible();
    await expect(page.locator('text=Price is required')).toBeVisible();
    await expect(page.locator('text=Ratings are required')).toBeVisible();
    await expect(page.locator('text=Discount is required')).toBeVisible();
    await expect(page.locator('text=Image URL is required')).toBeVisible();
  });

  // Test Case 3: Verify Input Validation for Numeric Fields
  test('Verify validation for the "Price", "Ratings", and "Discount" fields', async ({ page }) => {
    await page.fill('input[id = "price"]', 'abc');
    await page.fill('#ratings', '-1');
    await page.fill('#discounts', '110');
     await page.getByRole('button', { name: 'Add Item' }).click();
    await expect(page.locator('text=Price must be a valid number')).toBeVisible();
    await expect(page.locator('text=Ratings must be between 0 and 5')).toBeVisible();
    await expect(page.locator('text=Discount must be between 0 and 100')).toBeVisible();
  });

  // Test Case 4: Verify Adding a Valid Item
  test('Verify successful item addition', async ({ page }) => {
    await page.fill('#name', 'Pizza');
    await page.fill('#description', 'Cheese Pizza');
    await page.fill('input[id = "price"]', '10.99');
    await page.fill('#ratings', '4');
    await page.fill('#discounts', '20');
    await page.fill('#imageLink', 'https://example.com/image.jpg');
    await page.getByRole('button', { name: 'Add Item' }).click();
    await expect(page.locator('text=Item added successfully')).toBeVisible();
  });

  // Test Case 5: Verify Behavior When Image URL is Invalid
  test('Verify behavior for invalid image URL', async ({ page }) => {
    await page.fill('#name', 'Pizza');
    await page.fill('#description', 'Cheese Pizza');
    await page.fill('input[id = "price"]', '10.99');
    await page.fill('#ratings', '4');
    await page.fill('#discounts', '20');
    await page.fill('#imageLink', 'invalid-url');
    await page.getByRole('button', { name: 'Add Item' }).click();
    await expect(page.locator('text=Invalid Image URL')).toBeVisible();
  });

  // Test Case 6: Verify Maximum and Minimum Field Lengths
  test('Verify character length restrictions', async ({ page }) => {
    await page.fill('#name', 'a'.repeat(101)); // Assuming max length is 100
    await page.fill('#description', 'a'.repeat(501)); // Assuming max length is 500
    await page.getByRole('button', { name: 'Add Item' }).click();
    await expect(page.locator('text=Item Name is too long')).toBeVisible();
    await expect(page.locator('text=Description is too long')).toBeVisible();
  });

  // Test Case 9: Verify Image Preview Feature
  test('Verify image preview after entering URL', async ({ page }) => {

    await page.fill('#name', 'Pizza');
    await page.fill('#description', 'Cheese Pizza');
    await page.fill('input[id = "price"]', '10.99');
    await page.fill('#ratings', '4');
    await page.fill('#discounts', '20');
    await page.fill('#imageLink', 'https://example.com/image.jpg');
    await page.getByRole('button', { name: 'Add Item' }).click();
    const imagePreview = page.locator('img');
    await expect(imagePreview).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  // Test Case 10: Verify Error Handling for Server Failures
  test('Verify behavior on server error', async ({ page }) => {
    // Simulate server error (this might require mocking or stubbing the backend request)
    // For example, use Playwright's request interception
    await page.route('**/add-item', (route) => {
      route.fulfill({ status: 500 });
    });
    await page.fill('#name', 'Pizza');
    await page.fill('#description', 'Cheese Pizza');
    await page.fill('input[id = "price"]', '10.99');
    await page.fill('#ratings', '4');
    await page.fill('#discounts', '20');
    await page.fill('#imageLink', 'https://example.com/image.jpg');
    await page.getByRole('button', { name: 'Add Item' }).click();
    await expect(page.locator('text=Server Error, please try again')).toBeVisible();
  });

  // Test Case 11: Verify Accessibility
  test('Verify form accessibility for all users', async ({ page }) => {
    const labels = page.locator('label');
    await expect(labels).toHaveCount(6);
    const inputs = page.locator('input');
    for (let i = 0; i < await inputs.count(); i++) {
      const input = inputs.nth(i);
      const label = labels.nth(i);
      const labelId = await label.getAttribute('id');
      if (labelId) {
        await expect(input).toHaveAttribute('aria-labelledby', labelId);
      }
    }
    // Test keyboard navigation by tabbing through the form
    await page.keyboard.press('Tab');
    await expect(page.locator('#name')).toBeFocused();
  });

  // Test Case 12: Verify UI Elements on Load on Mobile
  test('Verify all necessary fields and buttons are visible on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile viewport size
    await expect(page.locator('h2:has-text("Add New Menu Item")')).toBeVisible();
    await expect(page.locator('#name')).toBeVisible();
    await expect(page.locator('#description')).toBeVisible();
    await expect(page.locator('#price')).toBeVisible();
    await expect(page.locator('#ratings')).toBeVisible();
    await expect(page.locator('#discounts')).toBeVisible();
    await expect(page.locator('#imageLink')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add Item' })).toBeVisible();
  });

  // Test Case 13: Verify Cancel Button Functionality
  test('Verify that the "Cancel" button works correctly', async ({ page }) => {
    await page.click('button:has-text("Cancel")');
    await expect(page).toHaveURL('https://restaurant.navya.so/menu'); // Assuming it redirects to the items list page
  });

  // Test Case 14: Verify Dialog Box Closes After Adding Item
  test('Verify that the dialog box closes after adding item', async ({ page }) => {
    await page.fill('#name', 'Pizza');
    await page.fill('#description', 'Cheese Pizza');
    await page.fill('#price', '10.99');
    await page.fill('#ratings', '4');
    await page.fill('#discounts', '20');
    await page.fill('#imageLink', 'https://example.com/image.jpg');
    await page.getByRole('button', { name: 'Add Item' }).click();
  });
});