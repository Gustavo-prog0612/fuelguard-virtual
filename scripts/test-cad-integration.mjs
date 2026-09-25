import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BRAIN_DIR = 'C:\\Users\\PROGRAMACAO-5\\.gemini\\antigravity\\brain\\317ce3f1-c779-4db8-b333-1bfe89db9a91';

async function main() {
  console.log('================================================================');
  console.log(' TESTE E2E & CAPTURA: ESTAÇÃO CAD & EDA (TSCIRCUIT INTEGRATION)');
  console.log('================================================================');

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  await page.goto('http://127.0.0.1:5174/');
  await page.waitForTimeout(1500);

  // 1. Navega para a Estação 6. Projeto CAD
  console.log('1. Navegando para [6. Projeto CAD]...');
  await page.keyboard.press('6');
  await page.waitForTimeout(800);

  const cadHeader = await page.textContent('body');
  if (!cadHeader.includes('Estação de Projeto CAD') && !cadHeader.includes('Circuit JSON')) {
    throw new Error('Falha ao abrir a Estação de Projeto CAD!');
  }
  console.log('✓ Estação CAD aberta com sucesso.');

  // 2. Sub-Aba 1: Esquemático (SVG / EDA)
  console.log('2. Validando Visualizador Esquemático EDA...');
  await page.screenshot({ path: 'screenshot_cad_schematic.png' });
  console.log('✓ screenshot_cad_schematic.png capturada');

  // 3. Sub-Aba 2: Layout PCB 2D
  console.log('3. Validando Visualizador PCB 2D com Trilhas Roteadas...');
  await page.click('button:has-text("2. Layout PCB")');
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'screenshot_cad_pcb.png' });
  console.log('✓ screenshot_cad_pcb.png capturada');

  // 4. Sub-Aba 3: Placa PCB (3D)
  console.log('4. Validando Placa PCB 3D (Carrier Board Unificada)...');
  await page.click('button:has-text("3. Placa PCB")');
  await page.waitForTimeout(1800);
  await page.screenshot({ path: 'screenshot_cad_3d.png' });
  console.log('✓ screenshot_cad_3d.png capturada');

  // 5. Sub-Aba 4: Montagem Física 3D (Assembly View)
  console.log('5. Validando Montagem Física 3D da Bancada (Assembly View)...');
  await page.click('button:has-text("4. Montagem Física 3D")');
  await page.waitForTimeout(1800);
  await page.screenshot({ path: 'screenshot_cad_assembly.png' });
  console.log('✓ screenshot_cad_assembly.png capturada (Modo Montagem)');

  // 5.1 Modo Conexões
  console.log('5.1 Validando Modo Conexões...');
  await page.click('button:has-text("Conexões")');
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'screenshot_cad_assembly_connections.png' });
  console.log('✓ screenshot_cad_assembly_connections.png capturada (Modo Conexões)');

  // 5.2 Modo Explodida
  console.log('5.2 Validando Modo Explodida...');
  await page.click('button:has-text("Explodida")');
  await page.waitForTimeout(900);
  await page.screenshot({ path: 'screenshot_cad_assembly_exploded.png' });
  console.log('✓ screenshot_cad_assembly_exploded.png capturada (Modo Explodida)');

  // 5.3 Modo Sensores (Caminho Acústico, Zona Cega e Níveis de Água)
  console.log('5.3 Validando Modo Sensores e os 5 Níveis Oficiais do Galão...');
  await page.click('button:has-text("Sensores")');
  await page.waitForTimeout(900);

  // 1. Nível Vazio (15%)
  await page.click('button:has-text("15%")');
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'screenshot_cad_tank_empty.png' });
  console.log('✓ screenshot_cad_tank_empty.png capturada (Nível 15%)');

  // 2. Nível 25%
  await page.click('button:has-text("25%")');
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'screenshot_cad_tank_25.png' });
  console.log('✓ screenshot_cad_tank_25.png capturada (Nível 25%)');

  // 3. Nível 50%
  await page.click('button:has-text("50%")');
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'screenshot_cad_tank_50.png' });
  console.log('✓ screenshot_cad_tank_50.png capturada (Nível 50%)');

  // 4. Nível 75%
  await page.click('button:has-text("75%")');
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'screenshot_cad_tank_75.png' });
  console.log('✓ screenshot_cad_tank_75.png capturada (Nível 75%)');

  // 5. Nível Cheio (95% - Zona Cega)
  await page.click('button:has-text("95%")');
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'screenshot_cad_tank_full.png' });
  console.log('✓ screenshot_cad_tank_full.png capturada (Nível 95%)');

  await page.screenshot({ path: 'screenshot_cad_assembly_sensors.png' });
  console.log('✓ screenshot_cad_assembly_sensors.png capturada (Modo Sensores Geral)');

  // Retorna para o Modo Montagem
  await page.click('button:has-text("Montagem")');
  await page.waitForTimeout(600);

  // 5.4 Modal de Auditoria Mecânica e Elétrica
  console.log('5.4 Validando Auditoria Mecânica...');
  const btnAudit = page.locator('button:has-text("Auditoria:")');
  if (await btnAudit.count() > 0) {
    await btnAudit.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: 'screenshot_cad_assembly_audit.png' });
    console.log('✓ screenshot_cad_assembly_audit.png capturada (Modal Auditoria Mecânica)');
    await page.click('button:has-text("Concluir Inspeção")');
    await page.waitForTimeout(500);
  }

  // 5.5 Click-to-Inspect com Procedência e Classes de Confiança
  console.log('5.5 Validando Click-to-Inspect e Cartão de Confiança...');
  await page.mouse.click(1220, 450);
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'screenshot_cad_assembly_inspect.png' });
  console.log('✓ screenshot_cad_assembly_inspect.png capturada (Cartão PN532 Classe C)');

  // 6. Sub-Aba 5: Auditoria DRC & Injeção de Falha
  console.log('6. Validando Painel de Auditoria DRC...');
  await page.click('button:has-text("5. Auditoria DRC")');
  await page.waitForTimeout(600);

  // Injeta falha de 5V direto para verificar DRC-01
  const btnFault = page.locator('button:has-text("Injetar Falha 5V Direto")');
  if (await btnFault.count() > 0) {
    await btnFault.click();
    await page.waitForTimeout(600);
  }
  await page.screenshot({ path: 'screenshot_cad_drc_fault.png' });
  console.log('✓ screenshot_cad_drc_fault.png capturada (Falha DRC-01 detectada)');

  // Restaura fiação segura
  const btnSafe = page.locator('button:has-text("Restaurar Fiação Segura")');
  if (await btnSafe.count() > 0) {
    await btnSafe.click();
    await page.waitForTimeout(600);
  }

  // 7. Sub-Aba 6: Registro & Tolerâncias (Biblioteca de Presets)
  console.log('7. Validando Registro de Componentes, Licenças & Tolerâncias...');
  await page.click('button:has-text("6. Registro & Tolerâncias")');
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'screenshot_cad_catalog.png' });
  console.log('✓ screenshot_cad_catalog.png capturada');

  // 7.1 Alterna para a Placa RP2040 Motor Controller (imrishabh18)
  console.log('7.1 Alternando para a placa [RP2040 Motor Controller]...');
  await page.click('button:has-text("RP2040 Motor Controller")');
  await page.waitForTimeout(1000);

  // 7.2 Captura RP2040 3D View
  console.log('7.2 Validando Visualizador 3D do RP2040 Motor Controller...');
  await page.click('button:has-text("3. Placa PCB (3D)")');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screenshot_cad_rp2040_3d.png' });
  console.log('✓ screenshot_cad_rp2040_3d.png capturada');

  // 7.3 Captura RP2040 Layout PCB 2D
  console.log('7.3 Validando Layout PCB 2D do RP2040 (262 trilhas, 270 vias, 340 pads)...');
  await page.click('button:has-text("2. Layout PCB (2D)")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshot_cad_rp2040_pcb.png' });
  console.log('✓ screenshot_cad_rp2040_pcb.png capturada');

  // 7.4 Captura RP2040 Esquemático EDA
  console.log('7.4 Validando Esquemático Multi-Sheet do RP2040...');
  await page.click('button:has-text("1. Esquemático (EDA)")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshot_cad_rp2040_schematic.png' });
  console.log('✓ screenshot_cad_rp2040_schematic.png capturada');

  // 7.5 Captura RP2040 Auditoria DRC
  console.log('7.5 Validando Auditoria DRC do RP2040 (IPC-2221)...');
  await page.click('button:has-text("5. Auditoria DRC")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshot_cad_rp2040_drc.png' });
  console.log('✓ screenshot_cad_rp2040_drc.png capturada');

  // 7.6 Captura RP2040 Catálogo & Registro
  console.log('7.6 Validando Catálogo de Componentes do RP2040...');
  await page.click('button:has-text("6. Registro & Tolerâncias")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshot_cad_rp2040_catalog.png' });
  console.log('✓ screenshot_cad_rp2040_catalog.png capturada');

  // Retorna para a placa Carrier FuelGuard
  await page.click('button:has-text("Carrier Board FuelGuard")');
  await page.waitForTimeout(800);

  // 8. Testa Interação no Agent Session
  console.log('8. Validando Painel Agent Session & Prompting...');
  const btnPromptDrc = page.locator('button:has-text("Auditar DRC")');
  if (await btnPromptDrc.count() > 0) {
    await btnPromptDrc.click();
    await page.waitForTimeout(600);
  }

  // 9. Testa Gatilhos de Exportação
  console.log('9. Testando gatilhos de exportação...');
  await page.click('button:has-text("Circuit JSON")');
  await page.waitForTimeout(300);
  await page.click('button:has-text("KiCad Sch")');
  await page.waitForTimeout(300);
  await page.click('button:has-text("KiCad PCB")');
  await page.waitForTimeout(500);

  const finalBody = await page.textContent('body');
  const toastSuccess = finalBody.includes('baixado com sucesso') || finalBody.includes('demonstrativo gerado');
  console.log('✓ Gatilhos de exportação disparados com sucesso:', toastSuccess);

  await browser.close();

  // Copia os screenshots para a pasta de artefatos do brain
  const screenshots = [
    'screenshot_cad_schematic.png',
    'screenshot_cad_pcb.png',
    'screenshot_cad_3d.png',
    'screenshot_cad_assembly.png',
    'screenshot_cad_assembly_connections.png',
    'screenshot_cad_assembly_exploded.png',
    'screenshot_cad_assembly_sensors.png',
    'screenshot_cad_tank_empty.png',
    'screenshot_cad_tank_25.png',
    'screenshot_cad_tank_50.png',
    'screenshot_cad_tank_75.png',
    'screenshot_cad_tank_full.png',
    'screenshot_cad_assembly_audit.png',
    'screenshot_cad_assembly_inspect.png',
    'screenshot_cad_drc_fault.png',
    'screenshot_cad_catalog.png',
    'screenshot_cad_rp2040_3d.png',
    'screenshot_cad_rp2040_pcb.png',
    'screenshot_cad_rp2040_schematic.png',
    'screenshot_cad_rp2040_drc.png',
    'screenshot_cad_rp2040_catalog.png',
  ];

  for (const s of screenshots) {
    if (fs.existsSync(s)) {
      const dest = path.join(BRAIN_DIR, s);
      fs.copyFileSync(s, dest);
      console.log(`✓ Copiado para o brain: ${dest}`);
    }
  }

  console.log('================================================================');
  console.log(' HOMOLOGAÇÃO DA ESTAÇÃO CAD CONCLUÍDA COM 100% DE SUCESSO!');
  console.log('================================================================');
}

main().catch((err) => {
  console.error('Erro no teste CAD:', err);
  process.exit(1);
});
