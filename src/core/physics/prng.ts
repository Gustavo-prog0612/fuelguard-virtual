/**
 * FuelGuard Virtual Test Bench — PRNG Determinístico (Mulberry32)
 * Garante reprodutibilidade exata de ensaios acústicos e ruídos de bancada.
 */

export class Mulberry32 {
  private state: number;

  constructor(seed: number = 42) {
    this.state = seed >>> 0;
  }

  public setSeed(seed: number): void {
    this.state = seed >>> 0;
  }

  /**
   * Gera um número pseudo-aleatório determinístico no intervalo [0, 1).
   */
  public next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Gera ruído gaussiano (distribuição normal) via Transformada de Box-Muller.
   * @param mean Média da distribuição (padrão: 0)
   * @param stdDev Desvio padrão (sigma)
   */
  public nextGaussian(mean: number = 0, stdDev: number = 1): number {
    let u1 = this.next();
    let u2 = this.next();
    
    // Evita log(0)
    while (u1 <= 1e-15) {
      u1 = this.next();
    }

    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return mean + z0 * stdDev;
  }
}
