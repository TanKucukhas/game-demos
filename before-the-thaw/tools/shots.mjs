// Capture title + gameplay screenshots for visual review.
import { chromium } from 'playwright';
const out = process.env.SCRATCH || '/tmp';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:5199/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
await page.screenshot({ path: out + '/title2.png' });
await page.click('#startBtn');
await page.waitForTimeout(1500);
// walk toward the hunt grounds so models + world are visible
await page.keyboard.down('KeyW');
await page.waitForTimeout(2500);
await page.keyboard.up('KeyW');
await page.screenshot({ path: out + '/game2.png' });
// jump near hole to see seal + birds + scent HUD
await page.evaluate(() => {
  const { G, world } = window.__dev;
  G.pos.set(world.holePos.x - 14, 0, world.holePos.z - 12);
});
await page.waitForTimeout(1200);
await page.screenshot({ path: out + '/hunt2.png' });
await browser.close();
console.log('shots saved');
