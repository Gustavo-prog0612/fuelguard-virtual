import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BRAIN_DIR = 'C:\\Users\\PROGRAMACAO-5\\.gemini\\antigravity\\brain\\317ce3f1-c779-4db8-b333-1bfe89db9a91';

async function main() {
  console.log('Iniciando captura das evidências visuais do Marco M6...');
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  await page.goto('http://127.0.0.1:4173/');
  await page.waitForTimeout(1200);

  // 1. View 1: Bancada Didática
  await page.keyboard.press('1');
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'screenshot_m6_bench.png' });
  console.log('✓ screenshot_m6_bench.png capturada');

  // 2. View 2: Sinais Acústicos & Osciloscópio
  await page.keyboard.press('2');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshot_m6_signals.png' });
  console.log('✓ screenshot_m6_signals.png capturada');

  // 3. View 4: Estação de Testes
  await page.keyboard.press('4');
  await page.waitForTimeout(800);
  // Clica em um teste para gerar eventos
  const btnAuth = page.locator('button:has-text("Aproximar Tag Autorizada")');
  if (await btnAuth.count() > 0) {
    await btnAuth.scrollIntoViewIfNeeded();
    await btnAuth.click();
    await page.waitForTimeout(600);
  }
  await page.screenshot({ path: 'screenshot_m6_tests.png' });
  console.log('✓ screenshot_m6_tests.png capturada');

  // 4. View 3: Terminal de Eventos UART & Timeline
  await page.keyboard.press('3');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshot_m6_events.png' });
  console.log('✓ screenshot_m6_events.png capturada');

  // 5. View 5: Guia Físico & Transição Real
  await page.keyboard.press('5');
  await page.waitForTimeout(600);
  const subTab = page.locator('button:has-text("Guia Físico")');
  if (await subTab.count() > 0) {
    await subTab.click();
    await page.waitForTimeout(600);
  }
  await page.screenshot({ path: 'screenshot_m6_guide.png' });
  console.log('✓ screenshot_m6_guide.png capturada');

  await browser.close();

  // Copia as capturas para o diretório de artifacts do brain
  const filesToCopy = [
    'screenshot_m6_bench.png',
    'screenshot_m6_signals.png',
    'screenshot_m6_tests.png',
    'screenshot_m6_events.png',
    'screenshot_m6_guide.png',
  ];

  for (const f of filesToCopy) {
    if (fs.existsSync(f)) {
      const dest = path.join(BRAIN_DIR, f);
      fs.copyFileSync(f, dest);
      console.log(`✓ Copiado para o brain: ${dest}`);
    }
  }

  console.log('Todas as evidências do Marco M6 foram capturadas e salvas com sucesso!');
}

main().catch((err) => {
  console.error('Erro na captura:', err);
  process.exit(1);
});
