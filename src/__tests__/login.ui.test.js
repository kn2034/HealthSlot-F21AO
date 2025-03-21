const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

jest.setTimeout(30000); // Increase timeout for UI tests

describe('Login Page UI Tests', () => {
    let driver;

    beforeAll(async () => {
        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(new chrome.Options().headless())
            .build();
    });

    afterAll(async () => {
        await driver.quit();
    });

    test('should display login form', async () => {
        await driver.get('http://localhost:3000/login');
        
        const emailInput = await driver.wait(
            until.elementLocated(By.css('input[type="email"]')),
            5000
        );
        const passwordInput = await driver.wait(
            until.elementLocated(By.css('input[type="password"]')),
            5000
        );
        const loginButton = await driver.wait(
            until.elementLocated(By.css('button[type="submit"]')),
            5000
        );

        expect(await emailInput.isDisplayed()).toBe(true);
        expect(await passwordInput.isDisplayed()).toBe(true);
        expect(await loginButton.isDisplayed()).toBe(true);
    });

    test('should show error on invalid login', async () => {
        await driver.get('http://localhost:3000/login');
        
        const emailInput = await driver.findElement(By.css('input[type="email"]'));
        const passwordInput = await driver.findElement(By.css('input[type="password"]'));
        const loginButton = await driver.findElement(By.css('button[type="submit"]'));

        await emailInput.sendKeys('invalid@test.com');
        await passwordInput.sendKeys('wrongpassword');
        await loginButton.click();

        const errorMessage = await driver.wait(
            until.elementLocated(By.css('.error-message')),
            5000
        );
        expect(await errorMessage.isDisplayed()).toBe(true);
    });
}); 