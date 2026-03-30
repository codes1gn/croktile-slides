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
  const slide = document.querySelector('.present');
  const slides = document.querySelector('.slides');
  const reveal = document.querySelector('.reveal');
  return {
    revealW: reveal.offsetWidth,
    revealH: reveal.offsetHeight,
    slidesW: slides.offsetWidth,
    slidesH: slides.offsetHeight,
    slideW: slide.offsetWidth,
    slideH: slide.offsetHeight,
    slideScrollH: slide.scrollHeight,
    slidesStyle: slides.style.cssText,
    scale: Reveal.getScale(),
    config: Reveal.getConfig(),
  };
});
console.log(JSON.stringify(info, null, 2));

await browser.close();
