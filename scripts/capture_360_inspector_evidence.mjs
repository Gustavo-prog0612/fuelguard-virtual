import { chromium } from 'playwright';

async function main() {
  console.log('Launching browser to capture comprehensive 360 inspector evidence...');
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
    await page.waitForTimeout(1200);
  }

  // 1. Bancada Física com suporte fixado, pilares PN532 e fiação mecatrônica suave
  const tabAssembly = page.getByRole('button', { name: '2. Bancada Física', exact: true });
  if (await tabAssembly.count() > 0) {
    await tabAssembly.first().click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'C:/Users/PROGRAMACAO-5/.gemini/antigravity/brain/317ce3f1-c779-4db8-b333-1bfe89db9a91/evidence_01_bench_grounded_cables.png' });
    console.log('Saved evidence_01_bench_grounded_cables.png');

    // 2. Inspecionar ESP32-S3 em 360° com Simulador de Firmware
    const espBtn = page.getByRole('button', { name: /ESP32-S3 DevKitC-1 v1.1/i }).first();
    if (await espBtn.isVisible()) {
      console.log('Clicking ESP32-S3 inspection button...');
      await espBtn.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'C:/Users/PROGRAMACAO-5/.gemini/antigravity/brain/317ce3f1-c779-4db8-b333-1bfe89db9a91/evidence_02_inspector_esp32_demo.png' });
      console.log('Saved evidence_02_inspector_esp32_demo.png');

      // Testar clique em "Especificações & Pinagem"
      const specsTab = page.getByRole('button', { name: /Especificações & Pinagem/i }).first();
      if (await specsTab.isVisible()) {
        await specsTab.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'C:/Users/PROGRAMACAO-5/.gemini/antigravity/brain/317ce3f1-c779-4db8-b333-1bfe89db9a91/evidence_02b_inspector_esp32_specs.png' });
        console.log('Saved evidence_02b_inspector_esp32_specs.png');
      }

      // Fechar modal
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
    }

    // 3. Inspecionar PN532 V4 em 360° com Simulador RFID
    const nfcBtn = page.getByRole('button', { name: /Leitor NFC PN532/i }).first();
    if (await nfcBtn.isVisible()) {
      console.log('Clicking PN532 inspection button...');
      await nfcBtn.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'C:/Users/PROGRAMACAO-5/.gemini/antigravity/brain/317ce3f1-c779-4db8-b333-1bfe89db9a91/evidence_03_inspector_pn532_demo.png' });
      console.log('Saved evidence_03_inspector_pn532_demo.png');

      // Fechar modal
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
    }

    // 4. Inspecionar Sensor Ultrassônico SEN0311 em 360° com Simulador ToF
    const sensorBtn = page.getByRole('button', { name: /Sensor SEN0311/i }).first();
    if (await sensorBtn.isVisible()) {
      console.log('Clicking SEN0311 inspection button...');
      await sensorBtn.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'C:/Users/PROGRAMACAO-5/.gemini/antigravity/brain/317ce3f1-c779-4db8-b333-1bfe89db9a91/evidence_04_inspector_sen0311_demo.png' });
      console.log('Saved evidence_04_inspector_sen0311_demo.png');

      // Fechar modal
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
    }

    // 5. Inspecionar Reed Switch MC-38 em 360° com Simulador de Interlock
    const reedBtn = page.getByRole('button', { name: /Reed Switch MC-38/i }).first();
    if (await reedBtn.isVisible()) {
      console.log('Clicking Reed Switch inspection button...');
      await reedBtn.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'C:/Users/PROGRAMACAO-5/.gemini/antigravity/brain/317ce3f1-c779-4db8-b333-1bfe89db9a91/evidence_05_inspector_reed_demo.png' });
      console.log('Saved evidence_05_inspector_reed_demo.png');

      // Fechar modal
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
    }
  }

  await browser.close();
  console.log('Completed capturing all 360 inspector evidence successfully.');
}

main().catch(console.error);
