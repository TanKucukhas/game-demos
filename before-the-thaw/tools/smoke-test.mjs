// Headless full-flow test: start → teleport near seal → stalk → pounce → feed.
import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });

await page.goto('http://localhost:5199/', { waitUntil: 'networkidle' });
await page.click('#startBtn');
await page.waitForTimeout(1000);

// teleport downwind of the seal, stalk, force-calm seal, pounce
const result = await page.evaluate(() => {
  const { G, world } = window.__dev;
  G.pos.set(world.holePos.x + G.wind.x * 4, 0, world.holePos.z + G.wind.y * 4);
  G.stalking = true;
  G.sealAlert = 0;
  return { dist: +G.pos.distanceTo(world.holePos).toFixed(1), sealState: G.sealState };
});
await page.waitForTimeout(300);
const hunt = await page.evaluate(() => {
  const { G, doPounce } = window.__dev;
  for (let i = 0; i < 5 && G.sealState === 'hauled'; i++) { G.sealAlert = 0; doPounce(); }
  return G.sealState;
});
let fed = null;
if (hunt === 'dead') {
  await page.evaluate(() => {
    const { G, world, cubs } = window.__dev;
    G.pos.set(world.holePos.x + 2.5, 0, world.holePos.z + 1);
    cubs.forEach((c, i) => c.pos.set(world.holePos.x + 2.5 + i, 0, world.holePos.z - 1));
  });
  await page.keyboard.down('KeyF');
  await page.waitForTimeout(4000);
  await page.keyboard.up('KeyF');
  fed = await page.evaluate(() => ({
    energy: +window.__dev.G.energy.toFixed(2),
    carcass: +window.__dev.G.carcass.toFixed(2),
    sikuHunting: window.__dev.cubs[0].hunting,
    nukkaHunting: window.__dev.cubs[1].hunting,
  }));
}
await page.screenshot({ path: (process.env.SCRATCH || '/tmp') + '/hunt.png' });
console.log(JSON.stringify({ setup: result, hunt, fed }, null, 2));
console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'NO ERRORS');
await browser.close();
