const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://jmcconville18.github.io/TickerApp/');

  // Click the "Get Weather" button
  await page.click('button:contains("Get Weather")');

  // Wait for the response to ensure the button click action is completed
  await page.waitForResponse(response => response.url().includes('weather') && response.status() === 200);

  await browser.close();
})();
