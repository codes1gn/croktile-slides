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

const base = 'http://localhost:8877/decks/croqtile-intro/index.html';
await page.goto(base, { waitUntil: 'networkidle0', timeout: 30000 });
await new Promise(r => setTimeout(r, 1000));

await page.evaluate(() => { Reveal.slide(1); });
await new Promise(r => setTimeout(r, 500));

const info = await page.evaluate(() => {
  const slide = document.querySelector('.present');
  const h2 = slide ? slide.querySelector('h2') : null;
  const toc = slide ? slide.querySelector('.toc-list') : null;
  const cs = h2 ? window.getComputedStyle(h2) : null;
  return {
    h2Text: h2 ? h2.textContent : 'none',
    h2Color: cs ? cs.color : 'none',
    h2FontSize: cs ? cs.fontSize : 'none',
    h2Visibility: cs ? cs.visibility : 'none',
    h2Display: cs ? cs.display : 'none',
    h2Opacity: cs ? cs.opacity : 'none',
    h2Top: h2 ? h2.getBoundingClientRect().top : 'none',
    h2Left: h2 ? h2.getBoundingClientRect().left : 'none',
    slideOverflow: slide ? window.getComputedStyle(slide).overflow : 'none',
    slidePadding: slide ? window.getComputedStyle(slide).padding : 'none',
    slideDisplay: slide ? window.getComputedStyle(slide).display : 'none',
    slideVisibility: slide ? window.getComputedStyle(slide).visibility : 'none',
    tocExists: !!toc,
    tocChildCount: toc ? toc.children.length : 0,
  };
});
console.log(JSON.stringify(info, null, 2));

await browser.close();
