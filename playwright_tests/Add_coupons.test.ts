import { test, expect, Page } from "@playwright/test";

test.describe("Add Coupon Functionality", () => {
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
  const gotoCouponsPage = async (page: Page) => {
    await page.goto("https://restaurant.navya.so/coupons");
    const addNewCouponButton = page.locator(
      'button:has-text("Add New Coupon")'
    );
    await expect(addNewCouponButton).toBeVisible();
    await expect(addNewCouponButton).toBeEnabled();
    await addNewCouponButton.click();
  };

  // Before each test, we ensure we're logged in and on the Coupons Page
  test.beforeEach(async ({ page }) => {
    await login(page);
    await gotoCouponsPage(page);
  });

  //Test Case 1: Verify UI Elements on Load
  test("Verify UI Elements on Load", async ({ page }) => {
    // Verify that the title field and label are visible

    await expect(page.locator('h2:has-text("Add New Coupon")')).toBeVisible();


    await expect(page.locator('label[for="title"]')).toBeVisible();
    await expect(page.locator("input#title")).toBeVisible();

    // Verify that the description field and label are visible
    await expect(page.locator('label[for="description"]')).toBeVisible();
    await expect(page.locator("input#description")).toBeVisible();

    // Verify that the discount type field and label are visible
    await expect(page.locator('label[for="discountType"]')).toBeVisible();
    await expect(page.locator('button[role = "combobox"]')).toBeVisible();

    // Verify that the discount value field and label are visible
    await expect(page.locator('label[for="discountValue"]')).toBeVisible();
    await expect(page.locator("input#discountValue")).toBeVisible();

    // Verify that the eligible orders field and label are visible
    await expect(page.locator('label[for="eligibleOrders"]')).toBeVisible();
    await expect(page.locator("input#eligibleOrders")).toBeVisible();

    // Verify that the minimum order value field and label are visible
    await expect(page.locator('label[for="minOrderValue"]')).toBeVisible();
    await expect(page.locator("input#minOrderValue")).toBeVisible();

    // Verify that the maximum discount field and label are visible
    await expect(page.locator('label[for="maxDiscount"]')).toBeVisible();
    await expect(page.locator("input#maxDiscount")).toBeVisible();

    // Verify that the coupon code field and label are visible
    await expect(page.locator('label[for="couponCode"]')).toBeVisible();
    await expect(page.locator("input#couponCode")).toBeVisible();

    // Verify that the usage limit field and label are visible
    await expect(page.locator('label[for="usageLimit"]')).toBeVisible();
    await expect(page.locator("input#usageLimit")).toBeVisible();

    // Verify that the start date field and label are visible
    await expect(page.locator('label[for="startDate"]')).toBeVisible();
    await expect(page.locator("input#startDate")).toBeVisible();

    // Verify that the end date field and label are visible
    await expect(page.locator('label[for="endDate"]')).toBeVisible();
    await expect(page.locator("input#endDate")).toBeVisible();

    // Verify that the "Add Coupon" button is visible and interactable
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeEnabled();
  });

  // Test Case 2: Add a Coupon Successfully
  test("Add a Coupon Successfully", async ({ page }) => {
    // Step 1: Click the "Add New Coupon" button
    // Step 2: Fill in the coupon details in the form

    await page.getByLabel("Title").click();
    await page.getByLabel("Title").fill("SADASDS");
    await page.getByLabel("Description").click();
    await page.getByLabel("Description").fill("ASDASDA");
    await page.getByRole("combobox").click();
    await page.getByLabel("Fixed Amount").getByText("Fixed Amount").click();
    await page.getByLabel("Discount Value").click();
    await page.getByLabel("Discount Value").fill("31231");
    await page.getByLabel("Eligible Orders").click();
    await page.getByLabel("Eligible Orders").fill("12123");
    await page.getByLabel("Minimum Order Value").click();
    await page.getByLabel("Minimum Order Value").fill("123123");
    await page
      .locator("div")
      .filter({ hasText: /^Maximum Discount$/ })
      .click();
    await page.getByLabel("Maximum Discount").fill("123123");
    await page.getByLabel("Coupon Code").click();
    await page.getByLabel("Coupon Code").fill("SAVE100");
    await page.getByLabel("Usage Limit").click();
    await page.getByLabel("Usage Limit").fill("1231");
    await page.getByLabel("Start Date").fill("2024-11-15");
    await page.getByLabel("End Date").fill("2024-11-17");
    await page.getByRole("button", { name: "Add Coupon" }).click();

    // Step 4: Verify the success toast message appears
    const successToast = page.locator(
      'div[class="text-sm opacity-90"]:has-text("Coupon added successfully")'
    );
    await expect(successToast).toBeVisible();

    // Step 5: Verify the coupon is displayed in the coupon list
    const newCoupon = page.locator('li:has-text("SAVE10")');
    await expect(newCoupon).toBeVisible();

    // Optionally, verify the details of the added coupon
    const couponTitle = newCoupon.locator("h4");
    const couponCode = newCoupon.locator('p:has-text("Coupon Code: SAVE10")');
    await expect(couponTitle).toHaveText("10% Off on All Orders");
    await expect(couponCode).toHaveText("Coupon Code: SAVE10");
  });

  // Test Case 3: Add Coupon Without Required Fields
  test("Add Coupon Without Required Fields", async ({ page }) => {
    // Step 1: Click the "Add New Coupon" button

    // Step 2: Leave all fields empty (don't fill anything)
    // Fields will be empty by default, no need to interact with them

    // Step 3: Click the "Add Coupon" submit button
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
    await submitButton.click();

    // Step 4: Verify validation error messages are displayed for required fields
    const titleErrorMessage = page.locator("text=Title is required");
    const couponCodeErrorMessage = page.locator("text=Coupon Code is required");
    const discountValueErrorMessage = page.locator(
      "text=Discount Value is required"
    );
    const minOrderValueErrorMessage = page.locator(
      "text=Min Order Value is required"
    );

    // Validate the error messages appear for the required fields
    await expect(titleErrorMessage).toBeVisible();
    await expect(couponCodeErrorMessage).toBeVisible();
    await expect(discountValueErrorMessage).toBeVisible();
    await expect(minOrderValueErrorMessage).toBeVisible();
  });

  // Test Case 4: Add Coupon With Invalid Discount Value
  test("Add coupon with invalid discount value (negative number)", async ({
    page,
  }) => {
    // Step 1: Navigate to the Coupons Page after authentication (mocked as example)

    // Step 2: Click on "Add New Coupon" button to open the form

    // Step 3: Fill in the form with valid data except for the Discount Value
    await page.locator("input#title").fill("New Year Discount"); // Valid title
    await page
      .locator("input#description")
      .fill("Special discount for new year"); // Valid description
    await page.locator("input#couponCode").fill("NEWYEAR2024"); // Valid coupon code
    await page.locator("input#usageLimit").fill("100"); // Valid usage limit
    await page.locator("input#minOrderValue").fill("50"); // Valid min order value
    await page.locator("input#maxDiscount").fill("20"); // Valid max discount
    await page.locator("input#startDate").fill("2024-01-01"); // Valid start date
    await page.locator("input#endDate").fill("2024-12-31"); // Valid end date

    // Step 4: Enter an invalid discount value (-10)
    await page.locator("input#discountValue").fill("-10"); // Invalid discount value (negative number)

    // Step 5: Click on "Add Coupon" button to submit the form
    await page.locator('button[type="submit"]').click(); // Locator for the "Add Coupon" button

    // Step 6: Verify the validation message appears below the Discount Value field
    const validationMessage = await page.locator(
      "text=Discount Value cannot be negative"
    );
    await expect(validationMessage).toBeVisible(); // Ensure the validation message is visible

    // Step 7: Verify that the coupon was not added (check for no success message or coupon in the list)
    const successToast = page.locator(
      'div[class="text-sm opacity-90"]:has-text("Coupon added successfully")'
    );
    await expect(successToast).not.toBeVisible(); // Ensure no success message appears
  });

  // Test Case 5: Add Coupon With Duplicate Coupon Code
  test("Add coupon with duplicate coupon code", async ({ page }) => {
    // Step 1: Navigate to the Coupons Page after authentication

    // Step 2: Click on the "Add New Coupon" button to open the form

    // Step 3: Fill in the form with valid data, but use a coupon code that already exists
    await page.locator("input#title").fill("Summer Sale Discount"); // Valid title
    await page.locator("input#description").fill("Discount for summer sale"); // Valid description
    await page.locator("input#couponCode").fill("SAVE10"); // Duplicate coupon code (assuming SAVE10 exists)
    await page.locator("input#usageLimit").fill("200"); // Valid usage limit
    await page.locator("input#minOrderValue").fill("30"); // Valid min order value
    await page.locator("input#maxDiscount").fill("50"); // Valid max discount
    await page.locator("input#startDate").fill("2024-06-01"); // Valid start date
    await page.locator("input#endDate").fill("2024-06-30"); // Valid end date

    // Step 4: Click on the "Add Coupon" button to submit the form
    await page.locator('button[type="submit"]').click(); // Locator for the "Add Coupon" button

    // Step 5: Verify the validation message appears below the Coupon Code field
    const validationMessage = await page.locator(
      "text=Coupon code already exists"
    );
    await expect(validationMessage).toBeVisible(); // Ensure the validation message is visible

    // Step 6: Verify that the coupon was not added (check for no success message or coupon in the list)
    const successMessage = page.locator("text=Coupon added successfully");
    await expect(successMessage).not.toBeVisible(); // Ensure no success message appears
  });

  // Test Case 6: Add Coupon With Invalid Date Range
  test("should show error if end date is earlier than start date", async ({
    page,
  }) => {
    // Pre-condition: Navigate to the Coupons Page and ensure the user is authenticated
    // Step 2: Fill in the required fields
    await page.getByLabel("Title").click();
    await page.getByLabel("Title").fill("Holiday Discount");
    await page.getByLabel("Description").click();
    await page
      .getByLabel("Description")
      .fill("Enjoy a special discount for the holiday season.");
    await page.getByRole("combobox").click();
    await page.getByLabel("Percentage").click();
    await page.getByLabel("Discount Value").click();
    await page.getByLabel("Discount Value").fill("15");
    await page.getByLabel("Eligible Orders").click();
    await page.getByLabel("Eligible Orders").fill("30");
    await page.getByLabel("Minimum Order Value").click();
    await page.getByLabel("Minimum Order Value").fill("50");
    await page
      .locator("div")
      .filter({ hasText: /^Maximum Discount$/ })
      .click();
    await page.getByLabel("Maximum Discount").fill("60");
    await page.getByLabel("Coupon Code").click();
    await page.getByLabel("Coupon Code").fill("HOLIDAY15");
    await page.getByLabel("Usage Limit").click();
    await page.getByLabel("Usage Limit").fill("100");
    await page.getByLabel("Start Date").fill("2024-12-01");
    await page.getByLabel("End Date").fill("2024-11-01");
    await page.getByRole("button", { name: "Add Coupon" }).click();

    // Step 5: Verify the validation message appears for the invalid date range
    const errorMessage = page.locator(
      "text=End date cannot be earlier than the start date"
    );
    await expect(errorMessage).toBeVisible();
  });

  // Test Case 7: = Cancel Add Coupon Process
  test("Cancel Add Coupon Process", async ({ page }) => {
    // Step 1: Navigate to the Coupons Page

    // Step 2: Click the "Add New Coupon" button

    // Step 3: Fill in some fields
    await page.fill("input#title", "Test Coupon");
    await page.fill("input#description", "Test Description");

    // Step 4: Click on the "Cancel" button or "Add New Coupon" again
    await page.click("text=Cancel");
  });

  // Test Case 8: Add Coupon With Maximum Length Fields
  test("Verify Adding Coupon with Maximum Length Fields", async ({ page }) => {
    // Step 2: Click on the "Add New Coupon" button

    // Step 3: Fill in the fields with maximum length values
    await page.fill(
      "input#title",
      "A very long title that exceeds the normal length"
    );
    await page.fill(
      "input#description",
      "A very long description that exceeds the normal length. It should describe the coupon in great detail."
    );
    await page.fill("input#couponCode", "MAXDISCOUNT2024");
    await page.fill("input#discountValue", "100");
    await page.fill("input#minOrderValue", "10");
    await page.fill("input#maxDiscount", "20");
    await page.getByLabel("Eligible Orders").click();
    await page.getByLabel("Eligible Orders").fill("12123");
    await page.fill("input#usageLimit", "50");
    await page.fill("input#startDate", "2024-01-01");
    await page.fill("input#endDate", "2024-12-31");

    // Step 4: Click on the "Add Coupon" button
    await page.click('button[type="submit"]');

    // Step 5: Ensure that the coupon was added successfully and displayed correctly
    const successToast = page.locator(
      'div[class="text-sm opacity-90"]:has-text("Coupon added successfully")'
    );
    await expect(successToast).toBeVisible();
    await expect(page.locator("text=MAXDISCOUNT2024")).toBeVisible();
    await expect(
      page.locator("text=A very long title that exceeds the normal length")
    ).toBeVisible();
  });

  // Test Case 9: Verify Loading State While Adding Coupon
  test("Verify Loading State While Adding Coupon", async ({ page }) => {
    // Step 1: Navigate to the Coupons Page
    // Step 2: Click on the "Add New Coupon" button
    // Step 3: Fill in required coupon fields
    await page.fill(
      "input#title",
      "A very long title that exceeds the normal length"
    );
    await page.fill(
      "input#description",
      "A very long description that exceeds the normal length. It should describe the coupon in great detail."
    );
    await page.fill("input#couponCode", "MAXDISCOUNT2024");
    await page.fill("input#discountValue", "100");
    await page.fill("input#minOrderValue", "10");
    await page.fill("input#maxDiscount", "20");
    await page.getByLabel("Eligible Orders").click();
    await page.getByLabel("Eligible Orders").fill("12123");
    await page.fill("input#usageLimit", "50");
    await page.fill("input#startDate", "2024-01-01");
    await page.fill("input#endDate", "2024-12-31");

    // Step 4: Submit the form
    const loadingSpinner = page.locator('[data-testid="loading-spinner"]');
    const addButton = page.locator('button[type="submit"]');

    // Step 5: Ensure loading spinner is visible during the request
    await expect(loadingSpinner).toBeVisible();

    // Step 6: Wait for the coupon to be added and the spinner to disappear
    await page.click('button[type="submit"]');
    await expect(loadingSpinner).toBeHidden();

    // Step 7: Ensure a success message appears
    const successToast = page.locator(
      'div[class="text-sm opacity-90"]:has-text("Coupon added successfully")'
    );
    await expect(successToast).toBeVisible();
  });

  // Test Case 10: Verify Invalid Coupon Code Format
  test("Test Invalid Coupon Code Format", async ({ page }) => {
    // Step 1: Navigate to the Coupons Page

    // Step 2: Click on the "Add New Coupon" button

    // Step 3: Fill in the fields with an invalid coupon code
    await page.fill(
      "input#title",
      "A very long title that exceeds the normal length"
    );
    await page.fill(
      "input#description",
      "A very long description that exceeds the normal length. It should describe the coupon in great detail."
    );
    await page.fill("input#couponCode", "Sac3243!@#");
    await page.fill("input#discountValue", "100");
    await page.fill("input#minOrderValue", "10");
    await page.fill("input#maxDiscount", "20");
    await page.getByLabel("Eligible Orders").click();
    await page.getByLabel("Eligible Orders").fill("12123");
    await page.fill("input#usageLimit", "50");
    await page.fill("input#startDate", "2024-01-01");
    await page.fill("input#endDate", "2024-12-31");

    // Step 4: Try to submit the form
    await page.click('button[type="submit"]');

    // Step 5: Ensure a validation error is displayed for the coupon code
    await expect(
      page.locator(
        "text=Coupon code can only contain letters and numbers, no spaces or special characters"
      )
    ).toBeVisible();
  });

  // Test Case 11: Verify Discount Value Greater than Maximum Discount
  test("Test Discount Value Greater than Maximum Discount", async ({
    page,
  }) => {
    // Step 1: Navigate to the Coupons Page

    // Step 2: Click on the "Add New Coupon" button

    // Step 3: Fill in the fields with an invalid discount value
    await page.fill("input#title", "Test Coupon");
    await page.fill("input#description", "Test Description");
    await page.fill("input#couponCode", "DISCOUNT20");
    await page.fill("input#discountValue", "25"); // Invalid discount
    await page.fill("input#maxDiscount", "20"); // Maximum discount is 20
    await page.fill("input#startDate", "2024-01-01");
    await page.fill("input#endDate", "2024-12-31");

    // Step 4: Try to submit the form
    await page.click('button[type="submit"]');
    // Step 5: Ensure a validation error is displayed for the discount value
    await expect(
      page.locator("text=Discount value cannot exceed maximum discount")
    ).toBeVisible();
  });

  // Test Case 12: Verify Maximum Discount Greater than Minimum Order Value
  test("Add coupon with same start and end date", async ({ page }) => {
    await page.fill(
      "input#title",
      "A very long title that exceeds the normal length"
    );
    await page.fill("input#description", "A very long description");
    await page.fill("input#couponCode", "Sac3243!@#");
    await page.fill("input#discountValue", "100");
    await page.fill("input#minOrderValue", "10");
    await page.fill("input#maxDiscount", "20");
    await page.getByLabel("Eligible Orders").click();
    await page.getByLabel("Eligible Orders").fill("12123");
    await page.fill("input#usageLimit", "50");
    await page.fill("input#startDate", "2024-01-01");
    await page.fill("input#endDate", "2024-01-01");

    await page.click('button[type="submit"]');

    // Verify coupon was added successfully
    const successToast = page.locator(
      'div[class="text-sm opacity-90"]:has-text("Coupon added successfully")'
    );
    await expect(successToast).toBeVisible();
  });

  // Test Case 13: Verify Maximum Discount Greater than Minimum Order Value
  test("Add coupon with empty description", async ({ page }) => {
    await page.fill(
      "input#title",
      "A very long title that exceeds the normal length"
    );
    await page.fill("input#couponCode", "Sac3243!@#");
    await page.fill("input#discountValue", "100");
    await page.fill("input#minOrderValue", "10");
    await page.fill("input#maxDiscount", "20");
    await page.getByLabel("Eligible Orders").click();
    await page.getByLabel("Eligible Orders").fill("12123");
    await page.fill("input#usageLimit", "50");
    await page.fill("input#startDate", "2024-01-01");
    await page.fill("input#endDate", "2024-12-31");

    // Add eligible orders
    await page.getByLabel("Eligible Orders").click();
    await page.getByLabel("Eligible Orders").fill("12123");

    await page.click('button[type="submit"]');

    // Verify if coupon is created successfully without description
    const successToast = page.locator(
      'div[class="text-sm opacity-90"]:has-text("Coupon added successfully")'
    );
    await expect(successToast).toBeVisible();
  });

  // Test Case 14: Verify Minimum Order Value Greater than Maximum Discount

  test("Add coupon with minimum order value greater than maximum discount", async ({
    page,
  }) => {
    await page.fill(
      "input#title",
      "A very long title that exceeds the normal length"
    );
    await page.fill(
      "input#description",
      "A very long description that exceeds the normal length. It should describe the coupon in great detail."
    );
    await page.fill("input#couponCode", "Sac3243!@#");
    await page.fill("input#discountValue", "2");
    await page.fill("input#minOrderValue", "50");
    await page.fill("input#maxDiscount", "20");
    await page.getByLabel("Eligible Orders").click();
    await page.getByLabel("Eligible Orders").fill("12123");
    await page.fill("input#usageLimit", "50");
    await page.fill("input#startDate", "2024-01-01");
    await page.fill("input#endDate", "2024-12-31");

    await page.click('button[type="submit"]');

    // Verify that a validation message appears
    await expect(
      page.locator(
        "text=Minimum order value cannot be less than maximum discount"
      )
    ).toBeVisible();
  });

  // Test Case 15: Verify Start Date Greater than End Date

  test("Add coupon without coupon code", async ({ page }) => {
    await page.fill(
      "input#title",
      "A very long title that exceeds the normal length"
    );
    await page.fill(
      "input#description",
      "A very long description that exceeds the normal length. It should describe the coupon in great detail."
    );
    await page.fill("input#discountValue", "100");
    await page.fill("input#minOrderValue", "10");
    await page.fill("input#maxDiscount", "20");
    await page.getByLabel("Eligible Orders").click();
    await page.getByLabel("Eligible Orders").fill("12123");
    await page.fill("input#usageLimit", "50");
    await page.locator("input#startDate").fill("2024-01-01");
    await page.locator("input#endDate").fill("2024-01-10");

    await page.click('button[type="submit"]');

    // Verify validation message for coupon code
    await expect(page.locator("text=Coupon code is required")).toBeVisible();
  });

// Test Case 16: Verify Add Coupon with Empty Description
  // test("Add coupon with very long title and description", async ({ page }) => {
  //   const longTitle = "A".repeat(200);
  //   const longDescription = "B".repeat(1000);

  //   await page.fill("input#title", longTitle);
  //   await page.fill("input#description", longDescription);
  //   await page.fill("input#discountValue", "100");
  //   await page.fill("input#minOrderValue", "10");
  //   await page.fill("input#maxDiscount", "20");
  //   await page.getByLabel("Eligible Orders").click();
  //   await page.getByLabel("Eligible Orders").fill("12123");
  //   await page.fill("input#usageLimit", "50");
  //   await page.locator("input#startDate").fill("2024-01-01");
  //   await page.locator("input#endDate").fill("2024-01-16");
  //   await page.click('button[type="submit"]');

  //   // Verify that the coupon is added and text is displayed correctly
  //   const successToast = page.locator(
  //     'div[class="text-sm opacity-90"]:has-text("Coupon added successfully")'
  //   );
  //   await expect(successToast).toBeVisible();
  // });

  // Test Case 17: Verify Add Coupon with Maximum Length Fields

  test("Verify Add Coupon functionality on mobile devices", async ({
    page,
  }) => {
    // Simulate mobile view
    await page.setViewportSize({ width: 375, height: 667 });

    await expect(page.locator('h2:has-text("Add New Coupon")')).toBeVisible();

    // Check if the form is displayed properly on mobile
    await expect(page.locator('label[for="title"]')).toBeVisible();
    await expect(page.locator("input#title")).toBeVisible();

    // Verify that the description field and label are visible
    await expect(page.locator('label[for="description"]')).toBeVisible();
    await expect(page.locator("input#description")).toBeVisible();

    // Verify that the discount type field and label are visible
    await expect(page.locator('label[for="discountType"]')).toBeVisible();
    await expect(page.locator('button[role = "combobox"]')).toBeVisible();

    // Verify that the discount value field and label are visible
    await expect(page.locator('label[for="discountValue"]')).toBeVisible();
    await expect(page.locator("input#discountValue")).toBeVisible();

    // Verify that the eligible orders field and label are visible
    await expect(page.locator('label[for="eligibleOrders"]')).toBeVisible();
    await expect(page.locator("input#eligibleOrders")).toBeVisible();

    // Verify that the minimum order value field and label are visible
    await expect(page.locator('label[for="minOrderValue"]')).toBeVisible();
    await expect(page.locator("input#minOrderValue")).toBeVisible();

    // Verify that the maximum discount field and label are visible
    await expect(page.locator('label[for="maxDiscount"]')).toBeVisible();
    await expect(page.locator("input#maxDiscount")).toBeVisible();

    // Verify that the coupon code field and label are visible
    await expect(page.locator('label[for="couponCode"]')).toBeVisible();
    await expect(page.locator("input#couponCode")).toBeVisible();

    // Verify that the usage limit field and label are visible
    await expect(page.locator('label[for="usageLimit"]')).toBeVisible();
    await expect(page.locator("input#usageLimit")).toBeVisible();

    // Verify that the start date field and label are visible
    await expect(page.locator('label[for="startDate"]')).toBeVisible();
    await expect(page.locator("input#startDate")).toBeVisible();

    // Verify that the end date field and label are visible
    await expect(page.locator('label[for="endDate"]')).toBeVisible();
    await expect(page.locator("input#endDate")).toBeVisible();

    // Fill in the form and submit
    await page.fill(
      "input#title",
      "A very long title that exceeds the normal length"
    );
    await page.fill("input#description", "A very long description");
    await page.fill("input#discountValue", "100");
    await page.fill("input#minOrderValue", "10");
    await page.fill("input#maxDiscount", "20");
    await page.getByLabel("Eligible Orders").click();
    await page.getByLabel("Eligible Orders").fill("12123");
    await page.fill("input#usageLimit", "50");
    await page.locator("input#startDate").fill("2024-01-01");
    await page.locator("input#endDate").fill("2024-05-10");

    await page.click('button[type="submit"]');
    // Verify coupon is added successfully
    const successToast = page.locator(
      'div[class="text-sm opacity-90"]:has-text("Coupon added successfully")'
    );
    await expect(successToast).toBeVisible();
  });

});
