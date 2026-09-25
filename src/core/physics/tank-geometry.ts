/**
 * FuelGuard Virtual Test Bench — Geometria do Tanque & Calibração Volumétrica
 * Modelagem do recipiente aberto com água didático e curvas V(h).
 */

export interface CalibrationPoint {
  hCm: number;
  volL: number;
}

export class TankGeometry {
  public static readonly DEFAULT_H_REF_CM = 100.0; // 1 metro de profundidade total
  public static readonly DEFAULT_BASE_AREA_M2 = 0.1; // Base de 31.6 cm x 31.6 cm (~100 L total)

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
      { hCm: 20, volL: 20 },
      { hCm: 40, volL: 40 },
      { hCm: 60, volL: 60 },
      { hCm: 80, volL: 80 },
      { hCm: 100, volL: 100 },
    ];
  }

  public getHref(): number {
    return this.hrefCm;
  }

  public setHref(h: number): void {
    this.hrefCm = Math.max(30.0, Math.min(300.0, h));
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
