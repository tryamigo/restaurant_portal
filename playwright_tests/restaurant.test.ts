import { test, expect, Page } from '@playwright/test';

test.describe('Resturant Detail', () => {
  
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
    await page.goto('https://restaurant.navya.so/restaurants');
  };

  test.beforeEach(async ({ page }) => {
    await login(page);
  });   

    // Test case 1: Ensure restaurant details are displayed when fetched successfully
    test('should display restaurant details after successful API call', async ({ page }) => {
      

    // Check if restaurant details are displayed
    await expect(page.getByRole('heading', { name: 'Restaurant Portal' })).toBeVisible();
    await expect(page.getByText('Restaurant Details')).toBeVisible();
    await expect(page.getByText('Restaurant Information')).toBeVisible();
    await expect(page.locator('text=Name: amigo')).toBeVisible();
    await expect(page.locator('text=Phone: +')).toBeVisible();
    await expect(page.locator('text=Opening Hours: 10-')).toBeVisible();
    await expect(page.locator('text=GSTIN: DUMMY_GSTIN')).toBeVisible();
    await expect(page.locator('text=FSSAI: DUMMY_FSSAI')).toBeVisible();
    await expect(page.locator('text=Rating: 0')).toBeVisible();
    await expect(page.locator('text=Street Address:Nhi pata')).toBeVisible();
    await expect(page.locator('text=City:Gurugram')).toBeVisible();
    await expect(page.locator('text=Pincode:122001')).toBeVisible();
    await expect(page.locator('text=Longitude:77')).toBeVisible();
    await expect(page.locator('text=Landmark:Iris tower')).toBeVisible();
    await expect(page.locator('text=State:Hariyana')).toBeVisible();
    await expect(page.locator('text=Latitude:27')).toBeVisible();
    });

    // Test case 2: Ensure error message is displayed when the API fails
    test('should display error message when fetching restaurant details fails', async ({ page }) => {
        // Mocking API failure
        await page.route('/api/restaurants', route => {
            route.fulfill({
                status: 500,
                body: JSON.stringify({ message: 'Failed to fetch restaurant details' }),
            });
        });

        await page.goto('https://restaurant.navya.so/restaurants'); // The correct URL for the restaurant details page

        // Wait for the error message to appear
        await expect(page.locator('text=Failed to load restaurant details. Please try again later.')).toBeVisible();
    });

    // Test case 3: Ensure edit mode works correctly and shows restaurant info
    test('should display restaurant info in edit mode', async ({ page }) => {
       
        await page.getByRole('button', { name: 'Options' }).click();
        await page.getByRole('menuitem', { name: 'Edit Restaurant' }).click();
        await page.getByLabel('Name').click();
        await page.getByLabel('Name').fill('');
        await page.getByLabel('Name').fill('A');
        await page.getByLabel('Name').fill('Adarsh');
        await page.getByLabel('GSTIN').click();
        await page.getByLabel('GSTIN').fill('GSTIN123');
        await page.getByLabel('FSSAI').click();
        await page.getByLabel('FSSAI').fill('');
        await page.getByLabel('FSSAI').fill('fssai123');
        await page.getByLabel('Rating').click();
        await page.getByLabel('Rating').fill('05');
        await page.getByLabel('Street Address').fill('janakputi');
        await page.getByRole('button', { name: 'Save Changes' }).click();
        
        await expect(page.locator('text=Adarsh')).toBeVisible();
        await expect(page.locator('text=GSTIN123')).toBeVisible();
        await expect(page.locator('text=fssai123')).toBeVisible();
        await expect(page.locator('text=5')).toBeVisible();
        await expect(page.locator('text=janakputi')).toBeVisible();
    });

    // // Test case 4: Ensure delete dialog opens and deletes restaurant
    test('should open delete dialog and delete restaurant', async ({ page }) => {

        // Click on "Delete Restaurant" button
        await page.getByRole('button', { name: 'Options' }).click();
        await page.getByRole('menuitem', { name: 'Delete Restaurant' }).click();
    
        // Check if the restaurant is deleted and redirected
        await expect(page.locator('text=No restaurant details found')).toBeVisible();
    });
});   