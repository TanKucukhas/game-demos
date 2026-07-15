// Visual check of the rigged walking mother bear.
import { chromium } from 'playwright';
const out = process.env.SCRATCH || '/tmp';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto('http://localhost:5199/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
await page.click('#startBtn');
await page.waitForTimeout(1500);
await page.keyboard.down('KeyW');
await page.waitForTimeout(1800);
await page.screenshot({ path: out + '/walk1.png' });
await page.waitForTimeout(400);
await page.screenshot({ path: out + '/walk2.png' });
await page.keyboard.up('KeyW');
console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'NO ERRORS');
await browser.close();
