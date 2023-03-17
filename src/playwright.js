const assert = require('node:assert');
const { chromium } = require('playwright');
const net = require('net');

(async () => {
  const client = net.connect({ port: 80, host: 'google.com' }, () => {
    console.log(`MyIP=${client.localAddress}`);
    console.log(`MyPORT=${client.localPort}`);
    client.destroy();
  });

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
