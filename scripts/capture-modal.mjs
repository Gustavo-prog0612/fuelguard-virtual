import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BRAIN_DIR = 'C:\\Users\\PROGRAMACAO-5\\.gemini\\antigravity\\brain\\317ce3f1-c779-4db8-b333-1bfe89db9a91';

async function main() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  await page.goto('http://127.0.0.1:5174/');
  await page.waitForTimeout(1500);

  // Navega para Projeto CAD
  await page.keyboard.press('6');
  await page.waitForTimeout(800);

  // Alterna para RP2040
  await page.click('button:has-text("RP2040 Motor Controller")');
  await page.waitForTimeout(800);

  // Vai para a aba 3D
  await page.click('button:has-text("3. Placa PCB (3D)")');
  await page.waitForTimeout(1500);

  // Clica em "Render 3D"
  await page.click('button:has-text("Render 3D")');
  await page.waitForTimeout(800);

  await page.screenshot({ path: 'screenshot_cad_rp2040_modal.png' });
  console.log('✓ screenshot_cad_rp2040_modal.png capturada');

  await browser.close();

  if (fs.existsSync('screenshot_cad_rp2040_modal.png')) {
    const dest = path.join(BRAIN_DIR, 'screenshot_cad_rp2040_modal.png');
    fs.copyFileSync('screenshot_cad_rp2040_modal.png', dest);
    console.log(`✓ Copiado para o brain: ${dest}`);
  }
}

main().catch(console.error);
