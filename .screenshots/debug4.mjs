import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
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

const base = 'http://localhost:8877/decks/croktile-intro/index.html';
await page.goto(base, { waitUntil: 'networkidle0', timeout: 30000 });
await new Promise(r => setTimeout(r, 1000));

await page.evaluate(() => { Reveal.slide(1); });
await new Promise(r => setTimeout(r, 500));

const info = await page.evaluate(() => {
  const sections = document.querySelectorAll('.slides > section');
  const present = document.querySelector('.present');
  const results = [];
  sections.forEach((s, i) => {
    const cs = window.getComputedStyle(s);
    results.push({
      idx: i,
      classList: Array.from(s.classList),
      transform: cs.transform,
      display: cs.display,
      position: cs.position,
      top: cs.top,
      left: cs.left,
    });
  });
  return {
    presentIndex: present ? Array.from(sections).indexOf(present) : -1,
    sections: results.slice(0, 5),
    slidesPosition: window.getComputedStyle(document.querySelector('.slides')).position,
  };
});
console.log(JSON.stringify(info, null, 2));

await browser.close();
