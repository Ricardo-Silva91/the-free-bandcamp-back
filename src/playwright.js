const assert = require('node:assert');
const { chromium } = require('playwright');
const { execSync } = require('child_process');

(async () => {
  const cmd = 'curl -s http://checkip.amazonaws.com || printf "0.0.0.0"';
  const pubIp = execSync(cmd).toString().trim();

  console.log(`My public IP address is: ${pubIp}`);

  // Setup
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // The actual interesting bit
  await context.route('**.jpg', (route) => route.abort());
  await page.goto('https://example.com/');

  console.log(await page.title());
  assert(await page.title() === 'Example Domain'); // 👎 not a Web First assertion

  // Teardown
  await context.close();
  await browser.close();
})();
