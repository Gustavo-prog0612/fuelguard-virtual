import benchLayout from '@/../hardware/assembly/bench-layout.json';
import cableRoutes from '@/../hardware/assembly/cable-routes.json';
import measurementRegister from '@/../hardware/measurements/measurement-register.json';
import adapterInputs from '@/../hardware/pcb/fuelguard-adapter/design-inputs.json';
import { HARDWARE_TEST_DEFINITIONS, TestResult } from '@/../hardware/tests/TestDefinition';
import { FUELGUARD_BOARD_STATUS } from '@/../hardware/board-status';
import { CircuitJsonBuilder } from '@/circuit-cad/circuit-json-builder';
import { DrcChecker } from '@/circuit-cad/drc-checker';
import { CARRIER_CAD_ASSET_MANIFEST } from '@/circuit-cad/carrier-assets';

const result = (id: string, status: TestResult['status'], message: string, evidenceRef: string): TestResult => ({
  ...HARDWARE_TEST_DEFINITIONS.find((test) => test.id === id)!,
  status,
  message,
  evidenceRef,
});

export function runEngineeringVerification(): TestResult[] {
  const builder = new CircuitJsonBuilder();
  const nominal = builder.buildNominalBenchCircuit();
  const faulty = builder.buildFaultyBenchCircuit();
  const nominalDrc = DrcChecker.runChecks(nominal.circuit_elements);
  const faultyDrc = DrcChecker.runChecks(faulty.circuit_elements);
  const sourceTraces = nominal.circuit_elements.filter((element) => element.type === 'source_trace') as any[];

  const layoutOk = benchLayout.objects.every((object) => object.supportPoint && object.supportPoint.contactY >= 0 && object.boundingBoxMm.width > 0 && object.boundingBoxMm.height > 0 && object.boundingBoxMm.depth > 0);
  const cableOk = cableRoutes.cables.every((cable) => cable.origin.component && cable.destination.component && cable.terminals.start && cable.terminals.end && cable.waypoints.length >= 3 && cable.visualDiameterMm > 0 && cable.estimatedLengthMm > 0);
  const carrierAssetsWithoutSource = CARRIER_CAD_ASSET_MANIFEST.filter((entry) => !entry.sourceUrl || !entry.license);
  const carrierAssetsPending = CARRIER_CAD_ASSET_MANIFEST.filter((entry) => entry.assetStatus !== 'verified');
  const pendingMeasurements = measurementRegister.records.filter((record) => record.status !== 'APPROVED_BY_MEASUREMENT');
  const connectorSelectionsPending = adapterInputs.connectorDecisions.filter((connector) => connector.selection === null);

  return [
    result('ARCH-001', 'PENDING', `Arquitetura da adaptadora: ${connectorSelectionsPending.length} conectores sem MPN/footprint e alimentação ainda pendente.`, 'docs/adr/0002-adapter-pcb-input-freeze.md + hardware/pcb/fuelguard-adapter/design-inputs.json'),
    result('MEAS-001', 'PENDING', `${pendingMeasurements.length}/${measurementRegister.records.length} registros de metrologia aguardam evidência física aprovada.`, 'hardware/measurements/measurement-register.json'),
    result('ELEC-001', nominalDrc.some((violation) => violation.severity === 'ERROR') || !faultyDrc.some((violation) => violation.id === 'DRC-V01-FATAL') ? 'FAIL' : 'PASS', 'ERC nominal sem erro fatal; injeção controlada de UART em 5 V foi detectada pelo DRC.', 'src/circuit-cad/drc-checker.ts + tests/electrical/netlist-consistency.test.ts'),
    result('ELEC-002', sourceTraces.some((trace) => trace.connected_source_port_ids?.includes('port_level_tx') && trace.connected_source_port_ids?.includes('port_esp32_gpio16')) ? 'PASS' : 'FAIL', 'Topologia nominal contém TX do SEN0311 em GPIO16/UART1_RX e não usa TRIG/ECHO legado.', 'hardware/nets/NetDefinition.ts + fuelguard/hardware/circuit/nets.ts'),
    result('MECH-001', layoutOk ? 'PASS' : 'FAIL', layoutOk ? `${benchLayout.objects.length} objetos têm apoio e bounding box em milímetros.` : 'Há objeto sem apoio ou dimensão válida.', 'hardware/assembly/bench-layout.json'),
    result('MECH-002', cableOk ? 'PASS' : 'FAIL', cableOk ? `${cableRoutes.cables.length} rotas têm origem, destino, terminais e waypoints.` : 'Há rota sem terminação ou geometria suficiente.', 'hardware/assembly/cable-routes.json'),
    result('FLUID-001', 'PENDING', 'O confinamento da água e qualquer curva volumétrica exigem recipiente real, ensaio físico e medição aprovados.', 'hardware/assets/asset-manifest.json#TK1'),
    result('ASSET-001', carrierAssetsWithoutSource.length ? 'FAIL' : carrierAssetsPending.length ? 'PENDING' : 'PASS', carrierAssetsWithoutSource.length ? `${carrierAssetsWithoutSource.length} asset(s) Carrier sem fonte ou licença registrada.` : carrierAssetsPending.length ? `${CARRIER_CAD_ASSET_MANIFEST.length - carrierAssetsPending.length}/${CARRIER_CAD_ASSET_MANIFEST.length} assets Carrier verificados; ${carrierAssetsPending.length} permanecem pendentes/aproximados.` : `${CARRIER_CAD_ASSET_MANIFEST.length} assets Carrier possuem fonte, licença e verificação.`, 'src/circuit-cad/carrier-assets.ts + public/assets/cad/carrier/**/asset.json'),
    result('PCB-001', 'PENDING', `PCB adaptadora: ${FUELGUARD_BOARD_STATUS.pcbReadiness}. ${FUELGUARD_BOARD_STATUS.blockingItems[0]}`, 'hardware/board-status.ts + docs/decision-log.md'),
  ];
}
