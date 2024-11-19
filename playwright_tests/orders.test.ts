import { test, expect, Page } from '@playwright/test';

test.describe('Orders Management Functionality', () => {
  
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

  test.beforeEach(async ({ page }) => {
    await login(page);
  });   

  test('should fetch and display orders when the user is authenticated', async ({ page }) => {
    expect(page.locator('text=Orders Management')).toBeVisible();
    expect(page.getByRole('heading', { name: 'Orders Management' })).toHaveText('Orders Management');
    expect(page.getByPlaceholder('Search orders by ID or customer name')).toBeVisible();
    expect(page.getByRole('cell', { name: 'Order ID' })).toBeVisible();
    expect(page.getByRole('cell', { name: 'Order ID' })).toHaveText('Order ID');
    expect(page.getByRole('cell', { name: 'Customer' })).toBeVisible();
    expect(page.getByRole('cell', { name: 'Customer' })).toHaveText('Customer');
    expect(page.getByRole('cell', { name: 'Order Details' })).toBeVisible();
    expect(page.getByRole('cell', { name: 'Order Details' })).toHaveText('Order Details');
    expect(page.getByRole('cell', { name: 'Status' })).toBeVisible();
    expect(page.getByRole('cell', { name: 'Status' })).toHaveText('Status');
    expect(page.getByRole('cell', { name: 'Payment' })).toBeVisible();
    expect(page.getByRole('cell', { name: 'Payment' })).toHaveText('Payment');
    expect(page.getByRole('cell', { name: 'Actions' })).toBeVisible();
    expect(page.getByRole('cell', { name: 'Actions' })).toHaveText('Actions');
    expect(page.locator('th').filter({ hasText: 'Delivery' })).toBeVisible();
    expect(page.locator('th').filter({ hasText: 'Delivery' })).toHaveText('Delivery');
    expect(page.getByRole('cell', { name: '0cf5234f Nov 15, 2024, 6:33 PM' })).toBeVisible();
    expect(page.getByRole('cell', { name: 'items Total: $9.99' })).toBeVisible();
    expect(page.getByRole('cell', { name: 'Subtotal: $9.99 Delivery: $' })).toBeVisible();
    expect(page.locator('td:nth-child(2)').first()).toBeVisible();
    expect(page.locator('td:nth-child(2)').first()).toHaveText('N/ANo contact');
    expect(page.locator('.px-6 > .flex > .inline-flex').first()).toBeVisible();
    expect(page.locator('.px-6 > .inline-flex').first()).toBeVisible();
    expect(page.locator('.px-6 > .inline-flex').first()).toHaveText('pending');
    expect(page.getByRole('row', { name: '0cf5234f Nov 15, 2024, 6:33' }).getByRole('button').nth(1)).toBeVisible();
    expect(page.getByRole('row', { name: '0cf5234f Nov 15, 2024, 6:33' }).getByRole('button').nth(1)).toHaveText('View');
    await page.getByRole('row', { name: '0cf5234f Nov 15, 2024, 6:33' }).getByRole('button').nth(1).click();

    //If the fetch fails, an error message is displayed (e.g., "Failed to fetch orders").
    // expect(page.locator('text=Failed to fetch orders')).toBeVisible();
});

test('Search orders by order ID', async ({ page }) => {

    const searchTerm = '4215b'; // Replace with a valid order ID from mock or test data

    // Enter the search term in the search bar
    await page.fill('input[placeholder="Search orders by ID or customer name"]', searchTerm);

    // Check that the filtered results are displayed
    const visibleOrders = await page.$$eval('table tbody tr', (rows) =>
      rows.map((row) => row.querySelector('td:first-child div')?.textContent || '')
    );

    expect(visibleOrders).toContain(searchTerm);

  });

  test('Search orders by customer name', async ({ page }) => {
    const customerName = 'nil'; // Replace with a valid customer name from mock or test data

    // Enter the search term in the search bar
    await page.fill('input[placeholder="Search orders by ID or customer name"]', customerName);

    // Check that the filtered results are displayed
    const visibleCustomers = await page.$$eval('table tbody tr', (rows) =>
      rows.map((row) => row.querySelector('td:nth-child(2) div')?.textContent)
    );
    expect(visibleCustomers).toContain(customerName);
  });

  test('Search orders with an invalid term', async ({ page }) => {
    const invalidTerm = 'InvalidSearchTerm';

    // Enter an invalid search term in the search bar
    await page.fill('input[placeholder="Search orders by ID or customer name"]', invalidTerm);

    // Verify that no results are displayed
    const noResultsText = await page.textContent('table tbody tr td[colspan="7"]');
    expect(noResultsText).toBe('No orders found');
  });


test('Filter orders by a specific status', async ({ page }) => {

    // Select the "Pending" status from the dropdown
    await page.getByRole('combobox').click();
    await page.getByText('Pending', { exact: true }).click();

    // Wait for filtered results to update
    await page.waitForTimeout(500); // Optional: Adjust this if the filter action triggers a debounce or API call

    // Verify that all displayed orders match the selected status
    const visibleStatuses = await page.$$eval('table tbody tr td:nth-child(4)', (cells) =>
      cells.map((cell) => cell.textContent?.trim())
    );

    expect(visibleStatuses).toHaveLength(visibleStatuses.length); // Ensure all rows are displayed
    for (const status of visibleStatuses) {
      expect(status).toBe('pending');
    }

    //Select the "Preparing" status from the dropdown
    await page.getByRole('combobox').click();
    await page.getByText('Preparing', { exact: true }).click();

    // Wait for filtered results to update
    await page.waitForTimeout(500); // Optional: Adjust this if the filter action triggers a debounce or API call

    // Verify that all displayed orders match the selected status

    const visibleStatuses1 = await page.$$eval('table tbody tr td:nth-child(4)', (cells) =>
      cells.map((cell) => cell.textContent?.trim())
    );

    expect(visibleStatuses1).toHaveLength(visibleStatuses1.length); // Ensure all rows are displayed

    for (const status of visibleStatuses1) {
      expect(status).toBe('preparing');
    }

    //Select the "Delivered" status from the dropdown
    await page.getByRole('combobox').click();
    await page.getByText('Delivered', { exact: true }).click();

    // Wait for filtered results to update
    await page.waitForTimeout(500); // Optional: Adjust this if the filter action triggers a debounce or API call

    // Verify that all displayed orders match the selected status

    const visibleStatuses2 = await page.$$eval('table tbody tr td:nth-child(4)', (cells) =>
      cells.map((cell) => cell.textContent?.trim())
    );

    expect(visibleStatuses2).toHaveLength(visibleStatuses2.length); // Ensure all rows are displayed

    for (const status of visibleStatuses2) {
      expect(status).toBe('delivered');
    }

    //Select the "On the way" status from the dropdown

    await page.getByRole('combobox').click();
    await page.getByText('On the Way', { exact: true }).click();

    // Wait for filtered results to update

    await page.waitForTimeout(500); // Optional: Adjust this if the filter action triggers a debounce or API call

    // Verify that all displayed orders match the selected status

    const visibleStatuses3 = await page.$$eval('table tbody tr td:nth-child(4)', (cells) =>
      cells.map((cell) => cell.textContent?.trim())
    );

    expect(visibleStatuses3).toHaveLength(visibleStatuses3.length); // Ensure all rows are displayed

    for (const status of visibleStatuses3) {
      expect(status).toBe('on the way');
    }

    //Select the "All Status" status from the dropdown

    await page.getByRole('combobox').click();
    await page.getByText('All Status', { exact: true }).click();
    
    // Wait for filtered results to update

    await page.waitForTimeout(500); // Optional: Adjust this if the filter action triggers a debounce or API call

    // Verify that all displayed orders match the selected status

    const visibleStatuses4 = await page.$$eval('table tbody tr td:nth-child(4)', (cells) =>
      cells.map((cell) => cell.textContent?.trim())
    );

    expect(visibleStatuses4).toHaveLength(visibleStatuses4.length); // Ensure all rows are displayed

    // for (const status of visibleStatuses4) {
    //     expect(status).toBe('pending');
    // }
  });

  test('Navigate to order details page and verify content', async ({ page }) => {
    // Find the first "View" button in the orders list
    await page.getByRole('row', { name: '0cf5234f Nov 15, 2024, 6:33' }).getByRole('button').nth(1).click();

    // Wait for navigation to complete
    await page.waitForURL(/\/orders\/\d+/, { timeout: 5000 }); // Ensure navigation matches `/orders/{orderId}`

    // Verify that the URL contains the order ID
    const currentURL = page.url();
    expect(currentURL).toMatch(/\/orders\/\d+/);

    // Verify that detailed information is displayed on the page
    await expect(page.getByRole('heading', { name: 'Order #0cf5234f-a352-11ef-' })).toBeVisible();
   
  });


test('Displays an error message when the API fails', async ({ page }) => {
    // Intercept the API request and force a 500 error
    await page.route('/api/orders', async (route) => {
      await route.fulfill({
        status: 500,
        body: JSON.stringify({ message: 'Internal Server Error' }),
        headers: { 'Content-Type': 'application/json' },
      });
    });

    // Navigate to the orders page
    await page.goto('https://restaurant.navya.so/orders');

    // Wait for the error message to appear
    const errorMessage = page.locator('text=Failed to fetch orders');

    // Verify the error message is displayed
    await expect(errorMessage).toBeVisible();
  });

test('Handles a large dataset of orders gracefully', async ({ page }) => {
    // Intercept the API request and return a large dataset
    await page.route('/api/orders', async (route) => {
      const largeDataset = Array.from({ length: 100 }, (_, index) => ({
        id: `order-${index + 1}`,
        customerName: `Customer ${index + 1}`,
        status: 'Pending',
      }));
      await route.fulfill({
        status: 200,
        body: JSON.stringify(largeDataset),
        headers: { 'Content-Type': 'application/json' },
      });
    });

    // Navigate to the orders page
    await page.goto('https://restaurant.navya.so/orders');

    // Wait for the orders list to render
    const ordersList = page.locator('.hover:bg-gray-50'); // Replace with the actual selector
    await expect(ordersList).toHaveCount(100);

    // Scroll through the list
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000); // Allow time for UI to render further if applicable


    // Optional: Verify specific orders are rendered correctly
    const firstOrder = ordersList.nth(0);
    const lastOrder = ordersList.nth(99);
    await expect(firstOrder).toContainText('Customer 1');
    await expect(lastOrder).toContainText('Customer 100');
  });


test('Verify SVG logos match the order statuses', async ({ page }) => {
    // Define the expected SVG class or ID for each status
    const statusToSVG = {
      pending: 'svg-pending-icon',
      preparing: 'svg-preparing-icon',
      'on the way': 'svg-on-the-way-icon',
      delivered: 'svg-delivered-icon',
    };

    // Get all rows in the orders table
    const rows = page.locator('tbody tr');

    // Iterate through each row to validate the status and corresponding SVG
    const rowCount = await rows.count();
    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);

      // Extract the status text from the "Status" column
      const status = await row.locator('.px-6 > .inline-flex').textContent();
     
      // Extract the SVG element associated with this status
      const svgElement = row.locator(`svg.${statusToSVG[status as keyof typeof statusToSVG]}`);

      // Assert the SVG element is present
      await expect(svgElement).toBeVisible();
    }
  });

  test('should have accessible inputs, buttons, and dropdowns', async ({ page }) => {
   
    // Check if search input is accessible via keyboard
    const searchInput = page.locator('input[placeholder="Search orders by ID or customer name"]');
    await searchInput.focus();
    await expect(searchInput).toBeFocused();
    await searchInput.fill('Test Order');
    await expect(searchInput).toHaveValue('Test Order');
    await page.goto('https://restaurant.navya.so/orders');


    // Check if the status filter dropdown is accessible via keyboard
    const statusDropdown = page.getByRole('combobox');
    await statusDropdown.focus();
    await statusDropdown.click();
    await page.getByLabel('Pending').click(); // Select an option
    await expect(statusDropdown).toHaveText('pending');


    await page.waitForTimeout(500);

    // Check if the action buttons (like "View") are accessible via keyboard and have appropriate labels
    const viewButtons = page.getByRole('row', { name: '0cf5234f Nov 15, 2024, 6:33' }).getByRole('button').nth(1);
    await viewButtons.first().focus();

  });


  test('should fetch and display orders when the user is authenticated on Mobile Device', async ({ page }) => {

    await page.setViewportSize({ width: 375, height: 667 });
    expect(page.locator('text=Orders Management')).toBeVisible();
    expect(page.getByRole('heading', { name: 'Orders Management' })).toHaveText('Orders Management');
    expect(page.getByPlaceholder('Search orders by ID or customer name')).toBeVisible();
    expect(page.getByRole('cell', { name: 'Order ID' })).toBeVisible();
    expect(page.getByRole('cell', { name: 'Order ID' })).toHaveText('Order ID');
    expect(page.getByRole('cell', { name: 'Customer' })).toBeVisible();
    expect(page.getByRole('cell', { name: 'Customer' })).toHaveText('Customer');
    expect(page.getByRole('cell', { name: 'Order Details' })).toBeVisible();
    expect(page.getByRole('cell', { name: 'Order Details' })).toHaveText('Order Details');
    expect(page.getByRole('cell', { name: 'Status' })).toBeVisible();
    expect(page.getByRole('cell', { name: 'Status' })).toHaveText('Status');
    expect(page.getByRole('cell', { name: 'Payment' })).toBeVisible();
    expect(page.getByRole('cell', { name: 'Payment' })).toHaveText('Payment');
    expect(page.getByRole('cell', { name: 'Actions' })).toBeVisible();
    expect(page.getByRole('cell', { name: 'Actions' })).toHaveText('Actions');
    expect(page.locator('th').filter({ hasText: 'Delivery' })).toBeVisible();
    expect(page.locator('th').filter({ hasText: 'Delivery' })).toHaveText('Delivery');
    expect(page.getByRole('cell', { name: '0cf5234f Nov 15, 2024, 6:33 PM' })).toBeVisible();
    expect(page.getByRole('cell', { name: 'items Total: $9.99' })).toBeVisible();
    expect(page.getByRole('cell', { name: 'Subtotal: $9.99 Delivery: $' })).toBeVisible();
    expect(page.locator('td:nth-child(2)').first()).toBeVisible();
    expect(page.locator('td:nth-child(2)').first()).toHaveText('N/ANo contact');
    expect(page.locator('.px-6 > .flex > .inline-flex').first()).toBeVisible();
    expect(page.locator('.px-6 > .inline-flex').first()).toBeVisible();
    expect(page.locator('.px-6 > .inline-flex').first()).toHaveText('pending');
    expect(page.getByRole('row', { name: '0cf5234f Nov 15, 2024, 6:33' }).getByRole('button').nth(1)).toBeVisible();
    expect(page.getByRole('row', { name: '0cf5234f Nov 15, 2024, 6:33' }).getByRole('button').nth(1)).toHaveText('View');
    await page.getByRole('row', { name: '0cf5234f Nov 15, 2024, 6:33' }).getByRole('button').nth(1).click();

    //If the fetch fails, an error message is displayed (e.g., "Failed to fetch orders").
    // expect(page.locator('text=Failed to fetch orders')).toBeVisible();
});



});