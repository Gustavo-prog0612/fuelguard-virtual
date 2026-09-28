/**
 * FuelGuard Virtual Test Bench — Filtro Mediano de 5 Amostras
 * Elimina spikes e ruídos espúrios de reflexão ultrassônica no firmware do ESP32-S3.
 */

export interface FilterResult {
  median: number;
  mean: number;
  stdDev: number;
  rawSample: number;
  window: number[];
  isOutlierRejected: boolean;
}

export class MedianFilter {
  private windowSize: number;
  private buffer: number[] = [];
  private outlierThresholdCm: number;

  constructor(windowSize: number = 5, outlierThresholdCm: number = 15.0) {
    this.windowSize = windowSize;
    this.outlierThresholdCm = outlierThresholdCm;
  }

  public reset(): void {
    this.buffer = [];
  }

  public addSample(sample: number): FilterResult {
    // Insere no buffer deslizante
    this.buffer.push(sample);
    if (this.buffer.length > this.windowSize) {
      this.buffer.shift();
    }

    const currentWindow = [...this.buffer];

    // Se ainda não tiver amostras suficientes, retorna o próprio valor
    if (currentWindow.length === 1) {
      return {
        median: sample,
        mean: sample,
        stdDev: 0,
        rawSample: sample,
        window: currentWindow,
        isOutlierRejected: false,
      };
    }

    // Ordenação numérica para cálculo da mediana
    const sorted = [...currentWindow].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

    // Cálculo da média e desvio padrão da janela
    const mean = currentWindow.reduce((acc, val) => acc + val, 0) / currentWindow.length;
    const variance = currentWindow.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / currentWindow.length;
    const stdDev = Math.sqrt(variance);

    // Detecção de rejeição de outlier
    const isOutlier = Math.abs(sample - median) > this.outlierThresholdCm;

    return {
      median: Number(median.toFixed(2)),
      mean: Number(mean.toFixed(2)),
      stdDev: Number(stdDev.toFixed(2)),
      rawSample: sample,
      window: currentWindow,
      isOutlierRejected: isOutlier,
    };
  }

  public getWindow(): number[] {
    return [...this.buffer];
  }
}
