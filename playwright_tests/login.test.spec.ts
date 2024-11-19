import { test, expect } from '@playwright/test';

test.describe('Comprehensive OTP Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://restaurant.navya.so/sign-in?callbackUrl=%2F'); // Replace with the actual OTP login route
  });

  test('should display all necessary elements for login on page load and after OTP is sent', async ({ page }) => {
    // Verify if the title is visible
    await expect(page.locator('text=Secure OTP Login')).toBeVisible();

    // Verify if the description text is visible
    await expect(page.locator('text=Verify your mobile number to access your account')).toBeVisible();

    // Verify mobile number input field
    await expect(page.locator('label:has-text("Mobile Number")')).toBeVisible();
    await expect(page.locator('input#mobile')).toBeVisible();
    await expect(page.getByPlaceholder('Enter 10-digit mobile number')).toBeVisible();
    await page.fill('input#mobile', '+919002130542'); 

    // Verify the send OTP button
    const sendOtpButton = page.locator('button:has-text("Send OTP")');
    await expect(sendOtpButton).toBeVisible();
    await sendOtpButton.click();
  
    // Verify OTP input field and resend OTP button after Send OTP is clicked
    await expect(page.locator('label:has-text("Enter 6-digit OTP")')).toBeVisible();
    const otpFields = page.locator('input[type="text"]');
const count = await otpFields.count();
for (let i = 0; i < count; i++) {
  await expect(otpFields.nth(i)).toBeVisible();
}
    await expect(page.locator('button:has-text("Resend OTP")')).toBeVisible();

    // Verify the Login OTP button
    const sendLoginOtpButton = page.locator('button:has-text("LOGIN")');
    await expect(sendLoginOtpButton).toBeVisible();
    await sendLoginOtpButton.click();    
});

  

  test('should disable Send OTP button when mobile field is empty', async ({ page }) => {
    await expect(page.locator('button:has-text("Send OTP")')).toBeDisabled();
    await page.fill('input#mobile', '123456'); // Partial input
    await expect(page.locator('button:has-text("Send OTP")')).toBeDisabled();
    await page.fill('input#mobile', '+919002130542'); // Valid input
    await expect(page.locator('button:has-text("Send OTP")')).toBeEnabled();
  });

  test('should show an error for invalid mobile number', async ({ page }) => {
    await page.fill('input#mobile', '12345');
    await page.click('button:has-text("Send OTP")');
    const errorAlert = page.locator('role=alert').first();
    await expect(errorAlert).toContainText('Please enter a valid 10-digit mobile number');
  });

  test('should successfully request OTP for a valid mobile number', async ({ page }) => {
    await page.fill('input#mobile', '+919002130542');
    await page.click('button:has-text("Send OTP")');
    await expect(page.locator('input[type="text"]:nth-child(1)')).toBeVisible();
    await expect(page.locator('button:has-text("Login")')).toBeVisible();
    const resendOTPButton = page.locator('button:has-text("Resend OTP")');
    await expect(resendOTPButton).toHaveText(/Resend OTP in \d+s/);
  });

  test('should disable resend OTP button during cooldown period', async ({ page }) => {
    await page.fill('input#mobile', '+919002130542');
    await page.click('button:has-text("Send OTP")');

    // Check that Resend OTP is disabled during cooldown
    const resendOTPButton = page.locator('button:has-text("Resend OTP")');
    await expect(resendOTPButton).toBeDisabled();
    await expect(resendOTPButton).toHaveText(/Resend OTP in \d+s/);
  });

  test('should re-enable resend OTP button after cooldown expires', async ({ page }) => {
    await page.fill('input#mobile', '+919002130542');
    await page.click('button:has-text("Send OTP")');

    // Wait for cooldown to expire
    await page.waitForTimeout(30000); // Adjust to your cooldown period

    // Check that Resend OTP is enabled after cooldown
    const resendOTPButton = page.locator('button:has-text("Resend OTP")');
    await expect(resendOTPButton).toBeEnabled();
    await expect(resendOTPButton).toHaveText('Resend OTP');
  });

  test('should allow only numeric characters in OTP fields', async ({ page }) => {
    await page.fill('input#mobile', '+919002130542');
    await page.click('button:has-text("Send OTP")');

    const otpFields = page.locator('input[type="text"]');
    await otpFields.nth(0).fill('a');
    await expect(otpFields.nth(0)).toHaveValue('');
    await otpFields.nth(0).fill('1');
    await expect(otpFields.nth(0)).toHaveValue('1');
  });

  test('should move focus to next OTP input on valid entry and back on deletion', async ({ page }) => {
    // Step 1: Fill in the mobile number and click 'Send OTP'
    await page.fill('input#mobile', '+919002130542');
    await page.click('button:has-text("Send OTP")');
  
    // Step 2: Get the OTP input fields
    const otpFields = page.locator('input[type="text"]');
  
    // Step 3: Fill each OTP field and check focus movement
    for (let i = 0; i < 6; i++) {
      await otpFields.nth(i).fill((i + 1).toString());  // Fill OTP field with values (1-6)
      
      if (i < 5) {
        // Wait for focus to move to the next field
        await expect(otpFields.nth(i + 1)).toBeFocused();
      }
    }
  
    // Step 4: Press Backspace on the 6th OTP field
    await otpFields.nth(5).press('Backspace');
  
    // Wait for focus to move back to the 5th OTP field (otpFields.nth(4))
    await otpFields.nth(4).waitFor({ state: 'visible' });
  
  });
  

  test('should display error message when OTP is incomplete and Login is attempted', async ({ page }) => {
    // Step 1: Fill in the mobile number and click 'Send OTP'
    await page.fill('input#mobile', '+919002130542');
    await page.click('button:has-text("Send OTP")');
    const otpFields = page.locator('input[type="text"]');

    for (let i = 0; i < 5; i++) {
      await otpFields.nth(i).fill((i+1).toString());
    }
    // Step 2: Click 'Login' without filling the last OTP field
    await page.click('button:has-text("Login")');
  
    // Step 3: Locate the error alert (be specific about which one)
    const errorAlert = page.locator('role=alert').first();
    await expect(errorAlert).toContainText('Please enter the complete 6-digit OTP');
    await errorAlert.waitFor({ state: 'visible', timeout: 5000 });
    
    // Step 4: Verify that the error message contains the expected text
    await expect(errorAlert).toContainText('Please enter the complete 6-digit OTP');
  });
  

  test('should successfully log in with correct OTP', async ({ page }) => {
    await page.fill('input#mobile', '+919002130542');
    await page.click('button:has-text("Send OTP")');

    const otpFields = page.locator('input[type="text"]');
    for (let i = 0; i < 6; i++) {
      await otpFields.nth(i).fill((i + 1).toString());
    }

    await page.click('button:has-text("Login")');
    await expect(page).toHaveURL('https://restaurant.navya.so/orders'); // Change to your post-login URL
  });

  test('should handle resend OTP request successfully after cooldown', async ({ page }) => {
    await page.fill('input#mobile', '+919002130542');
    await page.click('button:has-text("Send OTP")');

    await page.waitForTimeout(60000); // Adjust based on your cooldown

    const resendOTPButton = page.locator('button:has-text("Resend OTP")');
    await resendOTPButton.click();
    await expect(page.locator('button:has-text("Resend OTP in 30s")')).toBeVisible();
  });

  test('should display loading spinner during OTP request and login', async ({ page }) => {
    await page.fill('input#mobile', '+919002130542');
    
    await page.click('button:has-text("Send OTP")');
    const loadingSpinnerOTP = page.locator('.animate-spin');
    console.log(loadingSpinnerOTP);
    await expect(loadingSpinnerOTP).toBeVisible();

    const otpFields = page.locator('input[type="text"]');
    for (let i = 0; i < 6; i++) {
      await otpFields.nth(i).fill((i + 1).toString());
    }
    await page.click('button:has-text("Login")');
    const loadingSpinnerLogin = page.locator('.animate-spin');
    await expect(loadingSpinnerLogin).toBeVisible();
  });
});