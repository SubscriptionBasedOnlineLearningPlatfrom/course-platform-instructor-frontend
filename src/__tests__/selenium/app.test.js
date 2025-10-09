const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const path = require('path');

describe('Instructor Frontend Integration Tests', () => {
  let driver;

  beforeAll(async () => {
    // Set up Chrome options
    const options = new chrome.Options();
    options.addArguments('--headless'); // Run in headless mode for CI
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--disable-gpu');
    options.addArguments('--window-size=1920,1080');

    // Set ChromeDriver path
    const chromeDriverPath = path.join(__dirname, '../../node_modules/.bin/chromedriver');
    process.env.CHROMEDRIVER_PATH = chromeDriverPath;

    // Create WebDriver instance
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
  }, 30000); // Increase timeout

  afterAll(async () => {
    if (driver) {
      await driver.quit();
    }
  }, 30000);

  test('should load the instructor frontend', async () => {
    await driver.get('http://localhost:5173');

    // Wait for the page to load
    await driver.wait(until.titleContains('PROLEARNX'), 10000);

    // Check if the main content is loaded
    const body = await driver.findElement(By.tagName('body'));
    expect(await body.isDisplayed()).toBe(true);
  }, 15000);

  test('should show dashboard when not authenticated', async () => {
    await driver.get('http://localhost:5173');

    // Wait for dashboard elements to appear (guest mode)
    await driver.wait(until.elementLocated(By.css('main, .dashboard, [class*="dashboard"]')), 10000);

    // Check if main content area exists
    const main = await driver.findElement(By.tagName('main'));
    expect(await main.isDisplayed()).toBe(true);
  }, 15000);

  test('should navigate to login page', async () => {
    await driver.get('http://localhost:5173/login');

    // Wait for login form to appear
    await driver.wait(until.elementLocated(By.css('form, input[type="email"], input[type="password"]')), 10000);

    // Check if login elements exist
    const emailInputs = await driver.findElements(By.css('input[type="email"]'));
    const passwordInputs = await driver.findElements(By.css('input[type="password"]'));

    expect(emailInputs.length > 0 || passwordInputs.length > 0).toBe(true);
  }, 15000);

  test('should navigate to create course page', async () => {
    await driver.get('http://localhost:5173/create-course');

    // Since not authenticated, should redirect to login
    await driver.wait(until.urlContains('/login'), 10000);

    // Verify we're redirected to login
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toContain('/login');
  }, 15000);

  test('should display sidebar navigation', async () => {
    await driver.get('http://localhost:5173');

    // Wait for sidebar to load
    await driver.wait(until.elementLocated(By.css('aside, .sidebar, nav'), 10000));

    // Check if sidebar contains navigation elements
    const sidebar = await driver.findElement(By.css('aside, .sidebar, nav'));
    expect(await sidebar.isDisplayed()).toBe(true);

    // Look for navigation links or menu items
    const navLinks = await driver.findElements(By.css('a, button, [role="button"]'));
    expect(navLinks.length).toBeGreaterThan(0);
  }, 15000);

  test('should handle profile page access', async () => {
    await driver.get('http://localhost:5173/profile');

    // Should redirect to login since not authenticated
    await driver.wait(until.urlContains('/login'), 10000);

    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toContain('/login');
  }, 15000);

  test('should display dashboard content', async () => {
    await driver.get('http://localhost:5173/dashboard');

    // Wait for dashboard content to load
    await driver.wait(until.elementLocated(By.css('main, .dashboard, [class*="dashboard"]')), 10000);

    // Check for common dashboard elements
    const mainContent = await driver.findElement(By.css('main'));
    expect(await mainContent.isDisplayed()).toBe(true);

    // Look for dashboard-specific content (cards, stats, etc.)
    const dashboardElements = await driver.findElements(By.css('.card, .stat, .metric, [class*="card"], [class*="stat"]'));
    // Dashboard might have various elements, so we just check that content loaded
    expect(await mainContent.getText()).toBeTruthy();
  }, 15000);

  test('should handle curriculum page access', async () => {
    // Try to access a course curriculum page
    await driver.get('http://localhost:5173/courses/1/curriculum');

    // Should redirect to login since not authenticated
    await driver.wait(until.urlContains('/login'), 10000);

    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toContain('/login');
  }, 15000);

  test('should handle quiz creation page access', async () => {
    await driver.get('http://localhost:5173/QuizCreation');

    // Should redirect to login since not authenticated
    await driver.wait(until.urlContains('/login'), 10000);

    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toContain('/login');
  }, 15000);

  test('should handle enrollment overview access', async () => {
    await driver.get('http://localhost:5173/EnrollmentOverview');

    // Should redirect to login since not authenticated
    await driver.wait(until.urlContains('/login'), 10000);

    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toContain('/login');
  }, 15000);
});