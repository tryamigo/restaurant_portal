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
    await page.goto('https://restaurant.navya.so/coupons');
  };

  test.beforeEach(async ({ page }) => {
    await login(page);
    await gotoMenuPage(page);
  });
    
    test('Validating visibility of elements in Coupons Management for Laptop', async ({ page }) => {
      // Ensure the Coupons Management heading is visible
      await expect(page.getByRole('heading', { name: 'Coupons Management' })).toBeVisible();
    
      // Filter and check visibility of coupon with specific text (InactiveHOLIDAY2024)
      const couponElement = await page.locator('div').filter({ hasText: "wejhbds" }).nth(0);
      await expect(couponElement).toBeVisible();
    
      // Click the 'HOLIDAY2024' coupon and check its visibility
      await page.getByText('wejhbds').click();
      const holiday2024Coupon = await page.locator('h3').first();
      await expect(holiday2024Coupon).toBeVisible();
    
      // Click the first element with text-gray-600 and verify visibility
      const firstTextGray600 = await page.locator('.flex > .text-gray-600').first();
      await expect(firstTextGray600).toBeVisible();
    
      // Click and check the visibility of other elements
      const secondTextGray600 = await page.locator('div:nth-child(2) > .text-gray-600').first();
      await expect(secondTextGray600).toBeVisible();
    
      const thirdTextGray600 = await page.locator('div:nth-child(3) > .text-gray-600').first();
      await expect(thirdTextGray600).toBeVisible();
    
      // Clicking the same third element again and verifying visibility
      await thirdTextGray600.click();
      await expect(thirdTextGray600).toBeVisible();
    
      const discountElement =   await page.getByText('₹12.00').nth(2);
      await expect(discountElement).toBeVisible();
    
      // Check visibility of elements in the next set of clicks
      const fifthTextGray600 = await page.locator('div:nth-child(5) > .text-gray-600').first();
      await expect(fifthTextGray600).toBeVisible();
    
      const sixthTextGray600 = await page.locator('div:nth-child(6) > .text-gray-600').first();
      await expect(sixthTextGray600).toBeVisible();
    
      const sixthFontSemibold = await page.locator('div:nth-child(6) > .font-semibold').first();
      await expect(sixthFontSemibold).toBeVisible();
    
      const seventhTextGray600 = await page.locator('div:nth-child(7) > .text-gray-600').first();
      await expect(seventhTextGray600).toBeVisible();
    
      // Finally, validate visibility of the date range 'Dec 2024 -31 Dec 2024'
      const dateRange = await page.getByText('19 Nov 2024  -29 Nov 2024').first();
      await expect(dateRange).toBeVisible();

      // Click on the 'Search coupons...' input and check visibility
       await page.getByPlaceholder('Search coupons...').click();
       const searchInput = await page.getByPlaceholder('Search coupons...');
       await expect(searchInput).toBeVisible();
  
//   // Ensure that there are no coupons listed (e.g., all coupon elements are hidden or not present)
//      // Get the coupons list using the provided class
//   const coupons = page.locator('div:nth-child(1) > .p-6');
  
//   // Count the number of coupon elements
//   const couponsCount = await coupons.count();
//   console.log('Coupons count:', couponsCount);
  
//   if (couponsCount === 0) {
//     // If no coupons are available, ensure the "No coupons available" message is visible
//     const noCouponsMessage = await page.locator('text=No coupons available');  // Adjust this locator if needed
//     await expect(noCouponsMessage).toBeVisible();
//   } else {
//     // If there are coupons, ensure they are visible
//     await expect(coupons).toBeVisible();
//   }

    });

    test('Validating the functionality of the "Delete Coupon" button', async ({ page }) => {
      
        // Click the 'HOLIDAY2024' coupon and check its visibility
       await page.locator('div:nth-child(5) > div > .inline-flex').first().click();
    
      // Verify the success message is visible and contains the expected text
      await expect(page.getByText('Coupon deleted successfully', { exact: true })).toBeVisible();
      await expect(page.getByText('Success', { exact: true })).toBeVisible();
    
      // Verify the visibility of the deleted coupon
      const Couponcode = page.locator('div').filter({ hasText: "wejhbds"}).locator('div');
      await expect(Couponcode).not.toBeVisible();
    });

    test('Validating the functionality of the "Search Coupons..." input', async ({ page }) => {
      // Click on the 'Search coupons...' input and check visibility
      await page.getByPlaceholder('Search coupons...').click();
    
      // Verify the visibility of the 'Search coupons...' input
      const searchInput = await page.getByPlaceholder('Search coupons...');
      await expect(searchInput).toBeVisible();
    
      // Fill in the search input with 'FESTIVE2024'
      await page.fill('input[placeholder="Search coupons..."]', 'FESTIVE2024');
    
      // Verify the visibility of the 'FESTIVE2024' coupon
      const festive2024Coupon = await page.locator('div').filter({ hasText: /^FESTIVE2024$/ }).locator('div');
      await expect(festive2024Coupon).toBeVisible();
    });

test('toggle button state and check text', async ({ page }) => {

  // Check initial text on the button (could be "Activate" or "Deactivate")
  const statusElement = page.locator('.p-6 > div > .inline-flex').first();
  let initialText = await statusElement.textContent(); 
  console.log('Initial Status Text:', initialText); // Log the initial text for debugging
  expect(initialText).toContain('Active')

  // Click the button to toggle state
  await page.locator('div:nth-child(5) > div > button:nth-child(2)').first().click();
  const statusElement1 = page.locator('.p-6 > div > .inline-flex').first();
  let updatedText = await statusElement1.textContent(); 
  console.log('update Status Text:', updatedText); // Log the initial text for debugging
  expect(updatedText).toContain('Inactive'); // Expect the text to change to "Deactivate" after the first click
});


test('Validating visibility of elements in Coupons Management for Mobile', async ({ page }) => {

    await page.setViewportSize({ width: 375, height: 667 });
     // Filter and check visibility of coupon with specific text (InactiveHOLIDAY2024)
     const couponElement = await page.locator('div').filter({ hasText: "wejhbds" }).nth(0);
     await expect(couponElement).toBeVisible();
   
     // Click the 'HOLIDAY2024' coupon and check its visibility
     await page.getByText('wejhbds').click();
     const holiday2024Coupon = await page.locator('h3').first();
     await expect(holiday2024Coupon).toBeVisible();
   
     // Click the first element with text-gray-600 and verify visibility
     const firstTextGray600 = await page.locator('.flex > .text-gray-600').first();
     await expect(firstTextGray600).toBeVisible();
   
     // Click and check the visibility of other elements
     const secondTextGray600 = await page.locator('div:nth-child(2) > .text-gray-600').first();
     await expect(secondTextGray600).toBeVisible();
   
     const thirdTextGray600 = await page.locator('div:nth-child(3) > .text-gray-600').first();
     await expect(thirdTextGray600).toBeVisible();
   
     // Clicking the same third element again and verifying visibility
     await thirdTextGray600.click();
     await expect(thirdTextGray600).toBeVisible();
   
     const discountElement =   await page.getByText('₹12.00').nth(2);
     await expect(discountElement).toBeVisible();
   
     // Check visibility of elements in the next set of clicks
     const fifthTextGray600 = await page.locator('div:nth-child(5) > .text-gray-600').first();
     await expect(fifthTextGray600).toBeVisible();
   
     const sixthTextGray600 = await page.locator('div:nth-child(6) > .text-gray-600').first();
     await expect(sixthTextGray600).toBeVisible();
   
     const sixthFontSemibold = await page.locator('div:nth-child(6) > .font-semibold').first();
     await expect(sixthFontSemibold).toBeVisible();
   
     const seventhTextGray600 = await page.locator('div:nth-child(7) > .text-gray-600').first();
     await expect(seventhTextGray600).toBeVisible();
   
     // Finally, validate visibility of the date range 'Dec 2024 -31 Dec 2024'
     const dateRange = await page.getByText('19 Nov 2024  -29 Nov 2024').first();
     await expect(dateRange).toBeVisible();

     // Click on the 'Search coupons...' input and check visibility
      await page.getByPlaceholder('Search coupons...').click();
      const searchInput = await page.getByPlaceholder('Search coupons...');
      await expect(searchInput).toBeVisible();
  });

//   test('should update search results when searching for a specific coupon', async ({ page }) => {
//     // Assuming there is a search input with a class like `.search-input`
//     const searchInput = page.locator('.search-input');  // Adjust the locator for the search input
    
//     // First, make sure there are multiple coupons available
//     const coupons = page.locator('.coupon-item');  // Adjust the selector for the coupon elements
//     const initialCouponsCount = await coupons.count();
    
//     // Search for a specific coupon (e.g., using a coupon name)
//     await searchInput.fill('Holiday');  // Adjust search term based on your coupon data
    
//     // Wait for the results to update
//     await page.waitForTimeout(500);  // Wait a little for search results to update (adjust timing if needed)
    
//     // Verify that search results have updated (ensure the filtered results match the search term)
//     const filteredCoupons = await coupons.locator('text=Holiday');  // Adjust to match actual coupon data
//     const filteredCouponsCount = await filteredCoupons.count();
//     expect(filteredCouponsCount).toBeGreaterThan(0);  // Ensure at least one result matches the search
//   });

//   test('should update search results and reset when search text is cleared', async ({ page }) => {
//     // Navigate to the coupons page
//     await page.goto('https://restaurant.navya.so/coupons');
    
//     // Assuming there is a search input with a class like `.search-input`
//     const searchInput = page.locator('.search-input');  // Adjust the locator for the search input
    
//     // First, make sure there are multiple coupons available
//     const coupons = page.locator('.coupon-item');  // Adjust the selector for the coupon elements
//     const initialCouponsCount = await coupons.count();
    
//     // Step 1: Search for a specific coupon (e.g., using a coupon name)
//     await searchInput.fill('Holiday');  // Adjust search term based on your coupon data
    
//     // Wait for the results to update
//     await page.waitForTimeout(500);  // Wait a little for search results to update (adjust timing if needed)
    
//     // Verify that search results have updated (ensure the filtered results match the search term)
//     const filteredCoupons = await coupons.locator('text=Holiday');  // Adjust to match actual coupon data
//     const filteredCouponsCount = await filteredCoupons.count();
//     expect(filteredCouponsCount).toBeGreaterThan(0);  // Ensure at least one result matches the search
    
//     // Step 2: Clear the search input and ensure the page resets to show all coupons
//     await searchInput.fill('');  // Clear the search input
    
//     // Wait for the results to reset
//     await page.waitForTimeout(500);  // Wait for the page to reset the list
    
//     // Ensure that all coupons are visible again after clearing the search
//     const couponsAfterClear = await coupons.count();
//     expect(couponsAfterClear).toBeGreaterThan(0);  // Ensure the coupons are visible after clearing the search
    
//     // Verify that the number of coupons after clearing the search is the same as the initial count
//     expect(couponsAfterClear).toBe(initialCouponsCount);
//   });

  });
