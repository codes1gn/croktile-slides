import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const base = 'http://localhost:8877/decks/croktile-intro/index.html';

for (let i = 0; i <= 19; i++) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const url = req.url();
    if (url.includes('fonts.gstatic.com') || url.includes('fonts.googleapis.com')) {
      req.abort();
    } else {
      req.continue();
    }
  });
  await page.goto(`${base}#/${i}`, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 350));
  await page.screenshot({ path: `/home/albert/workspace/croktile-slides/.screenshots/s${i}.png` });
  await page.close();
  console.log(`slide ${i} captured`);
}

await browser.close();
console.log('done');
