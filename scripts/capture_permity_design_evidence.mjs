import { chromium } from 'playwright';

async function main() {
  console.log('Launching browser to capture Permity design evidence...');
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('Navigating to http://127.0.0.1:5173/ ...');
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // 1. Capture Overview Dashboard (Permity identical dashboard)
  const overviewNav = page.locator('button:has-text("0. Visão Geral")').first();
  if (await overviewNav.isVisible()) {
    console.log('Clicking 0. Visão Geral...');
    await overviewNav.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'C:/Users/PROGRAMACAO-5/.gemini/antigravity/brain/317ce3f1-c779-4db8-b333-1bfe89db9a91/permity_01_overview_dashboard.png' });
    console.log('Saved permity_01_overview_dashboard.png');
  }

  // 2. Capture Bench View
  const benchNav = page.locator('button:has-text("1. Bancada")').first();
  if (await benchNav.isVisible()) {
    console.log('Clicking 1. Bancada...');
    await benchNav.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'C:/Users/PROGRAMACAO-5/.gemini/antigravity/brain/317ce3f1-c779-4db8-b333-1bfe89db9a91/permity_02_bench_view.png' });
    console.log('Saved permity_02_bench_view.png');
  }

  // 3. Capture CAD Station
  const cadNav = page.locator('button:has-text("5. Projeto CAD")').first();
  if (await cadNav.isVisible()) {
    console.log('Clicking 5. Projeto CAD...');
    await cadNav.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'C:/Users/PROGRAMACAO-5/.gemini/antigravity/brain/317ce3f1-c779-4db8-b333-1bfe89db9a91/permity_03_cad_view.png' });
    console.log('Saved permity_03_cad_view.png');
  }

  await browser.close();
  console.log('Browser closed. Evidence capture complete.');
}

main().catch((err) => {
  console.error('Error capturing evidence:', err);
  process.exit(1);
});
