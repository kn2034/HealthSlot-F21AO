const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const app = require('../../app');
const http = require('http');

describe('Login UI Tests', () => {
  let driver;
  let server;

  beforeAll(async () => {
    server = http.createServer(app);
    await new Promise(resolve => server.listen(3001, resolve));
    
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(new chrome.Options().headless())
      .build();
  });

  afterAll(async () => {
    await driver.quit();
    await server.close();
  });

  test('should display login form', async () => {
    await driver.get('http://localhost:3001/login');
    
    const emailInput = await driver.wait(
      until.elementLocated(By.css('input[type="email"]')),
      5000
    );
    
    const passwordInput = await driver.findElement(By.css('input[type="password"]'));
    const loginButton = await driver.findElement(By.css('button[type="submit"]'));
    
    expect(await emailInput.isDisplayed()).toBe(true);
    expect(await passwordInput.isDisplayed()).toBe(true);
    expect(await loginButton.isDisplayed()).toBe(true);
  });

  test('should show error on invalid login', async () => {
    await driver.get('http://localhost:3001/login');
    
    const emailInput = await driver.findElement(By.css('input[type="email"]'));
    const passwordInput = await driver.findElement(By.css('input[type="password"]'));
    
    await emailInput.sendKeys('invalid@email.com');
    await passwordInput.sendKeys('wrongpassword');
    
    const loginButton = await driver.findElement(By.css('button[type="submit"]'));
    await loginButton.click();
    
    const errorMessage = await driver.wait(
      until.elementLocated(By.css('.error-message')),
      5000
    );
    
    expect(await errorMessage.isDisplayed()).toBe(true);
    expect(await errorMessage.getText()).toContain('Invalid credentials');
  });
}); 