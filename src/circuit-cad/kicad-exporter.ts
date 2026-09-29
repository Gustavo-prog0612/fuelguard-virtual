/**
 * Guardas de exportação KiCad.
 *
 * A fonte KiCad ainda não existe neste repositório. Manter um gerador textual
 * aqui criaria um esquemático/PCB fictício e poderia ser confundido com um
 * artefato de fabricação; por isso as exportações ficam bloqueadas até o gate.
 */

import { CircuitJsonPackage } from './circuit-json-builder';

export class KiCadExporter {
  public static generateKiCadSchematic(_pkg: CircuitJsonPackage): string {
    return 'Exportação bloqueada: crie e revise o esquemático KiCad real após aprovar medidas, MPNs, conectores e footprints.';
  }

  public static generateKiCadPcb(_pkg: CircuitJsonPackage): string {
    return 'Exportação bloqueada: a PCB KiCad real ainda não existe; ERC, DRC, roteamento e Gerbers devem vir da mesma revisão.';
  }

  public static triggerDownload(filename: string, content: string, mimeType: string = 'text/plain'): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
