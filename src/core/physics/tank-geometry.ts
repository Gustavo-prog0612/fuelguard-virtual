/**
 * FuelGuard Virtual Test Bench — Geometria do Tanque & Calibração Volumétrica
 * Modelagem do recipiente aberto com água didático e curvas V(h).
 */

export interface CalibrationPoint {
  hCm: number;
  volL: number;
}

export class TankGeometry {
  public static readonly DEFAULT_H_REF_CM = 16.0; // FG-TANK-6L-R1: 160 mm internos
  public static readonly DEFAULT_BASE_AREA_M2 = 0.04; // 200 x 200 mm internos

  private hrefCm: number;
  private baseAreaM2: number;
  private calibrationCurve: CalibrationPoint[];

  constructor(
    hrefCm: number = TankGeometry.DEFAULT_H_REF_CM,
    baseAreaM2: number = TankGeometry.DEFAULT_BASE_AREA_M2,
    customPoints?: CalibrationPoint[]
  ) {
    this.hrefCm = hrefCm;
    this.baseAreaM2 = baseAreaM2;
    this.calibrationCurve = customPoints || [
      { hCm: 0, volL: 0 },
      { hCm: 2.5, volL: 1.0 },
      { hCm: 5.0, volL: 2.0 },
      { hCm: 7.5, volL: 3.0 },
      { hCm: 10.0, volL: 4.0 },
      { hCm: 12.5, volL: 5.0 },
      { hCm: 16.0, volL: 6.4 },
    ];
  }

  public getHref(): number {
    return this.hrefCm;
  }

  public setHref(h: number): void {
    this.hrefCm = Math.max(3.0, Math.min(450.0, h));
  }

  /**
   * Calcula o nível da água a partir da distância acústica medida d.
   * h = Href - d
   */
  public distanceToWaterHeight(distanceCm: number): number {
    const rawHeight = this.hrefCm - distanceCm;
    return Math.max(0, Math.min(this.hrefCm, rawHeight));
  }

  /**
   * Calcula a distância acústica teórica para uma dada coluna d'água.
   * d = Href - h
   */
  public waterHeightToDistance(waterHeightCm: number): number {
    const d = this.hrefCm - waterHeightCm;
    return Math.max(0, d);
  }

  /**
   * Calcula o volume de água em Litros por geometria prismática:
   * V(L) = Area(m²) * h(m) * 1000 L/m³
   */
  public calculateTheoreticalVolume(waterHeightCm: number): number {
    const heightM = waterHeightCm / 100.0;
    const volL = this.baseAreaM2 * heightM * 1000.0;
    return Number(volL.toFixed(1));
  }

  /**
   * Interpolação linear da tabela de calibração empírica da bancada física.
   */
  public calculateCalibratedVolume(waterHeightCm: number): number {
    const pts = this.calibrationCurve;
    if (pts.length === 0) return this.calculateTheoreticalVolume(waterHeightCm);
    if (waterHeightCm <= pts[0].hCm) return pts[0].volL;
    if (waterHeightCm >= pts[pts.length - 1].hCm) return pts[pts.length - 1].volL;

    for (let i = 0; i < pts.length - 1; i++) {
      const p1 = pts[i];
      const p2 = pts[i + 1];
      if (waterHeightCm >= p1.hCm && waterHeightCm <= p2.hCm) {
        const factor = (waterHeightCm - p1.hCm) / (p2.hCm - p1.hCm);
        const interpolated = p1.volL + factor * (p2.volL - p1.volL);
        return Number(interpolated.toFixed(1));
      }
    }

    return this.calculateTheoreticalVolume(waterHeightCm);
  }

  public getCalibrationCurve(): CalibrationPoint[] {
    return [...this.calibrationCurve];
  }
}
