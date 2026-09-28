import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('Navigating to http://127.0.0.1:5173/ ...');
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 1. Screenshot of the Navbar showing 5 stations (Guia & Design removed)
  await page.screenshot({ path: 'C:/Users/PROGRAMACAO-5/.gemini/antigravity/brain/317ce3f1-c779-4db8-b333-1bfe89db9a91/screenshot_navbar_5tabs.png' });
  console.log('Saved screenshot_navbar_5tabs.png');

  // Navigate to 5. Projeto CAD
  const cadNavButton = page.locator('button:has-text("5. Projeto CAD")');
  if (await cadNavButton.isVisible()) {
    await cadNavButton.click();
    await page.waitForTimeout(1200);
  }

  // 2. Click on subtab "3. Placa PCB (3D)"
  const tab3d = page.locator('button:has-text("3. Placa PCB (3D)")');
  if (await tab3d.isVisible()) {
    await tab3d.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'C:/Users/PROGRAMACAO-5/.gemini/antigravity/brain/317ce3f1-c779-4db8-b333-1bfe89db9a91/screenshot_cad_carrier_3d_clean.png' });
    console.log('Saved screenshot_cad_carrier_3d_clean.png');
  }

  // 3. Click on subtab "6. Registro & Tolerâncias"
  const tabCatalog = page.locator('button:has-text("6. Registro & Tolerâncias")');
  if (await tabCatalog.isVisible()) {
    await tabCatalog.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'C:/Users/PROGRAMACAO-5/.gemini/antigravity/brain/317ce3f1-c779-4db8-b333-1bfe89db9a91/screenshot_cad_catalog_updated.png' });
    console.log('Saved screenshot_cad_catalog_updated.png');
  }

  // 4. Click on subtab "4. Montagem Física 3D" to confirm grid removal on assembly
  const tabAssembly = page.locator('button:has-text("4. Montagem Física 3D")');
  if (await tabAssembly.isVisible()) {
    await tabAssembly.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'C:/Users/PROGRAMACAO-5/.gemini/antigravity/brain/317ce3f1-c779-4db8-b333-1bfe89db9a91/screenshot_bench_assembly_nogrid.png' });
    console.log('Saved screenshot_bench_assembly_nogrid.png');
  }

  await browser.close();
  console.log('Finished capturing all screenshots.');
}

main().catch(console.error);
