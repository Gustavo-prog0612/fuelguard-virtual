import { describe, expect, it } from 'vitest';
import { buildRealPcbElements, computePcbStats } from '@/circuit-cad/pcb-builder';

describe('Proposta de PCB 2D — integridade do Circuit JSON', () => {
  it('mantém cada segmento ligado a um source_trace e a uma source_net existente', () => {
    const elements = buildRealPcbElements();
    const traces = elements.filter((element: any) => element.type === 'pcb_trace') as any[];
    const sourceTraces = new Map(
      elements
        .filter((element: any) => element.type === 'source_trace')
        .map((element: any) => [element.source_trace_id, element]),
    );
    const sourceNets = new Set(
      elements
        .filter((element: any) => element.type === 'source_net')
        .map((element: any) => element.source_net_id),
    );

    expect(traces.length).toBeGreaterThan(0);
    for (const trace of traces) {
      const sourceTrace = sourceTraces.get(trace.source_trace_id);
      expect(sourceTrace, `${trace.pcb_trace_id} sem source_trace`).toBeDefined();
      expect(sourceTrace.connected_source_net_ids.length).toBeGreaterThan(0);
      expect(sourceTrace.connected_source_net_ids.every((netId: string) => sourceNets.has(netId))).toBe(true);
      expect(trace.route.length).toBeGreaterThanOrEqual(2);
      expect(trace.route.every((point: any) => ['top', 'bottom'].includes(point.layer))).toBe(true);
    }
  });

  it('expõe as dimensões e estatísticas da proposta sem declarar fabricação liberada', () => {
    const elements = buildRealPcbElements();
    const board = elements.find((element: any) => element.type === 'pcb_board') as any;
    const stats = computePcbStats(elements);

    expect(board.width).toBe(120);
    expect(board.height).toBe(80);
    expect(board.thickness).toBe(1.6);
    expect(stats.layers).toBe(2);
    expect(stats.mountingHoles).toBe(4);
  });
});
