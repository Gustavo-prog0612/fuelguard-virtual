/**
 * FuelGuard Virtual Test Bench — Modelo de Oscilação Hidrodinâmica Amortecida (Slosh)
 * Simula as ondas de superfície decorrentes de abastecimento brusco de água ou agitação da bancada.
 */

export class SloshDampingModel {
  private initialAmplitudeCm: number = 0;
  private naturalFreqRadSec: number; // wn = 2 * pi * f (~2.5 Hz para água em galão de bancada)
  private dampingRatio: number; // zeta (~0.08 para amortecimento viscoso da água)
  private startTimeSec: number = 0;
  private isActive: boolean = false;

  constructor(frequencyHz: number = 2.5, dampingRatio: number = 0.08) {
    this.naturalFreqRadSec = 2 * Math.PI * frequencyHz;
    this.dampingRatio = dampingRatio;
  }

  /**
   * Dispara uma perturbação no nível superficial da água.
   * @param amplitudeCm Amplitude de pico da onda inicial em cm.
   * @param currentTimeSec Tempo atual da simulação em segundos.
   */
  public triggerSlosh(amplitudeCm: number, currentTimeSec: number): void {
    this.initialAmplitudeCm = amplitudeCm;
    this.startTimeSec = currentTimeSec;
    this.isActive = true;
  }

  /**
   * Calcula o deslocamento instantâneo da superfície da água no instante t.
   * y(t) = A0 * exp(-zeta * wn * dt) * cos(wd * dt)
   */
  public getDisplacement(currentTimeSec: number): number {
    if (!this.isActive || this.initialAmplitudeCm === 0) return 0;

    const dt = currentTimeSec - this.startTimeSec;
    if (dt < 0) return 0;

    // Frequência amortecida: wd = wn * sqrt(1 - zeta^2)
    const wd = this.naturalFreqRadSec * Math.sqrt(Math.max(0, 1 - this.dampingRatio * this.dampingRatio));
    const envelope = this.initialAmplitudeCm * Math.exp(-this.dampingRatio * this.naturalFreqRadSec * dt);

    // Se o envelope caiu abaixo de 0.05 cm, encerra a perturbação
    if (Math.abs(envelope) < 0.05) {
      this.isActive = false;
      return 0;
    }

    return envelope * Math.cos(wd * dt);
  }

  public isSloshing(): boolean {
    return this.isActive;
  }

  public reset(): void {
    this.initialAmplitudeCm = 0;
    this.isActive = false;
  }
}
