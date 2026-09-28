import { chromium } from 'playwright';

async function main() {
  console.log('Launching browser for engineering evidence capture...');
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('Navigating to http://127.0.0.1:5173/ ...');
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Navigate to 5. Projeto CAD
  const cadNavButton = page.locator('button:has-text("5. Projeto CAD")').first();
  if (await cadNavButton.isVisible()) {
    await cadNavButton.click();
    await page.waitForTimeout(1500);
  }

  // 1. Screenshot of Tab 1: Visão Geral (10 tabs visible in nav, scope matrix A/B/C)
  await page.screenshot({ path: 'C:/Users/PROGRAMACAO-5/.gemini/antigravity/brain/317ce3f1-c779-4db8-b333-1bfe89db9a91/screenshot_cad_overview_10tabs.png' });
  console.log('Saved screenshot_cad_overview_10tabs.png');

  // 2. Screenshot of Tab 2: Bancada Física (PBR optical tank, breadboard BB-830, DuPont harness)
  const tabAssembly = page.getByRole('button', { name: '2. Bancada Física', exact: true });
  if (await tabAssembly.count() > 0) {
    await tabAssembly.first().click();
    await page.waitForTimeout(2500);
    await page.screenshot({ path: 'C:/Users/PROGRAMACAO-5/.gemini/antigravity/brain/317ce3f1-c779-4db8-b333-1bfe89db9a91/screenshot_cad_assembly_pbr_tank.png' });
    console.log('Saved screenshot_cad_assembly_pbr_tank.png');
  }

  // 3. Screenshot of Tab 6: Conexões (Chicote DuPont/JST, AWG e Waypoints)
  const tabConnections = page.getByRole('button', { name: '6. Conexões', exact: true });
  if (await tabConnections.count() > 0) {
    await tabConnections.first().click();
    await page.waitForTimeout(1200);
    await page.screenshot({ path: 'C:/Users/PROGRAMACAO-5/.gemini/antigravity/brain/317ce3f1-c779-4db8-b333-1bfe89db9a91/screenshot_cad_connections_schedule.png' });
    console.log('Saved screenshot_cad_connections_schedule.png');
  }

  // 4. Screenshot of Tab 7: Sensor & Água (Acoplamento acústico e hidrostática)
  const tabSensors = page.getByRole('button', { name: '7. Sensor & Água', exact: true });
  if (await tabSensors.count() > 0) {
    await tabSensors.first().click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'C:/Users/PROGRAMACAO-5/.gemini/antigravity/brain/317ce3f1-c779-4db8-b333-1bfe89db9a91/screenshot_cad_sensors_water_pbr.png' });
    console.log('Saved screenshot_cad_sensors_water_pbr.png');
  }

  // 5. Screenshot of Tab 8: BOM & Assets (12 Itens e Tolerâncias)
  const tabBom = page.getByRole('button', { name: '8. BOM & Assets', exact: true });
  if (await tabBom.count() > 0) {
    await tabBom.first().click();
    await page.waitForTimeout(1200);
    await page.screenshot({ path: 'C:/Users/PROGRAMACAO-5/.gemini/antigravity/brain/317ce3f1-c779-4db8-b333-1bfe89db9a91/screenshot_cad_bom_official.png' });
    console.log('Saved screenshot_cad_bom_official.png');
  }

  // 6. Screenshot of Tab 9: Testes (78 Testes Aprovados)
  const tabTests = page.getByRole('button', { name: '9. Testes', exact: true });
  if (await tabTests.count() > 0) {
    await tabTests.first().click();
    await page.waitForTimeout(1200);
    await page.screenshot({ path: 'C:/Users/PROGRAMACAO-5/.gemini/antigravity/brain/317ce3f1-c779-4db8-b333-1bfe89db9a91/screenshot_cad_tests_78passed.png' });
    console.log('Saved screenshot_cad_tests_78passed.png');
  }

  // 7. Screenshot of Tab 4: PCB 2D with engineering banner
  const tabPcb = page.getByRole('button', { name: '4. PCB 2D', exact: true });
  if (await tabPcb.count() > 0) {
    await tabPcb.first().click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'C:/Users/PROGRAMACAO-5/.gemini/antigravity/brain/317ce3f1-c779-4db8-b333-1bfe89db9a91/screenshot_cad_pcb2d_disclaimer.png' });
    console.log('Saved screenshot_cad_pcb2d_disclaimer.png');
  }

  await browser.close();
  console.log('Finished capturing all engineering evidence screenshots successfully.');
}

main().catch(console.error);
