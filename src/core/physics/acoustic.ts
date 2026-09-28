/**
 * FuelGuard Virtual Test Bench — Modelagem Acústica e Termodinâmica
 * Implementa a velocidade do som no ar c(T), tempo de eco e as limitações
 * do sensor de distância DFRobot A02YYUW/SEN0311.
 */

import { Mulberry32 } from './prng';

export interface AcousticEchoResult {
  trueDistanceCm: number;
  measuredDistanceCm: number;
  echoTimeUs: number;
  soundSpeedMps: number;
  inBlindZone: boolean;
  echoValid: boolean;
  qualityFactor: number; // 0.0 a 1.0
  attenuationDb: number;
}

export class AcousticModel {
  public static readonly BLIND_ZONE_CM = 3.0;
  public static readonly MAX_RANGE_CM = 450.0;
  public static readonly TIMEOUT_US = 30000; // 30 ms

  private prng: Mulberry32;

  constructor(seed: number = 42) {
    this.prng = new Mulberry32(seed);
  }

  public setSeed(seed: number): void {
    this.prng.setSeed(seed);
  }

  /**
   * Calcula a velocidade do som no ar em função da temperatura T em Celsius.
   * Fórmula termodinâmica clássica para ar seco: c(T) = 331.3 * sqrt(1 + T / 273.15)
   */
  public calculateSpeedOfSound(temperatureC: number): number {
    const clampedT = Math.max(-20, Math.min(60, temperatureC));
    return 331.3 * Math.sqrt(1 + clampedT / 273.15);
  }

  /**
   * Converte distância física em tempo de eco bidirecional (ida e volta).
   * @param distanceCm Distância da face do transdutor à superfície em cm.
   * @param soundSpeedMps Velocidade do som em m/s.
   * @returns Tempo em microssegundos (us).
   */
  public distanceToEchoTimeUs(distanceCm: number, soundSpeedMps: number): number {
    const distanceMeters = distanceCm / 100.0;
    const timeSeconds = (2.0 * distanceMeters) / soundSpeedMps;
    return Math.round(timeSeconds * 1e6);
  }

  /**
   * Converte tempo de eco em distância física calculada.
   */
  public echoTimeToDistanceCm(echoTimeUs: number, soundSpeedMps: number): number {
    const timeSeconds = echoTimeUs / 1e6;
    const distanceMeters = (timeSeconds * soundSpeedMps) / 2.0;
    return distanceMeters * 100.0;
  }

  /**
   * Simula uma leitura ultrassônica do SEN0311 com ruído e comportamento
   * equivalente ao envelope documentado do A02YYUW.
   * @param trueDistanceCm Distância física real até a superfície d'água.
   * @param temperatureC Temperatura ambiente.
   * @param surfaceDisturbanceCm Amplitude da perturbação superficial (slosh/ondas).
   * @param noiseStdDevCm Desvio padrão do ruído gaussiano do ambiente.
   */
  public simulatePing(
    trueDistanceCm: number,
    temperatureC: number = 25.0,
    surfaceDisturbanceCm: number = 0.0,
    noiseStdDevCm: number = 0.25
  ): AcousticEchoResult {
    const c = this.calculateSpeedOfSound(temperatureC);

    // Efeito da perturbação de superfície da água
    const effectiveDistance = Math.max(0, trueDistanceCm + surfaceDisturbanceCm);

    // 1. Verificação da Zona Cega (Ring-down Piezoelétrico)
    // O SEN0311 possui zona cega documentada de aproximadamente 3 cm.
    if (effectiveDistance < AcousticModel.BLIND_ZONE_CM) {
      // 30% das vezes retorna ruído residual perto do limite, 70% perde o eco (timeout).
      const ringDownLoss = this.prng.next() > 0.3;
      if (ringDownLoss) {
        return {
          trueDistanceCm,
          measuredDistanceCm: 0,
          echoTimeUs: AcousticModel.TIMEOUT_US,
          soundSpeedMps: c,
          inBlindZone: true,
          echoValid: false,
          qualityFactor: 0.0,
          attenuationDb: 60.0,
        };
      }
      
      const chaoticDist = 3.0 + this.prng.next() * 2.0;
      return {
        trueDistanceCm,
        measuredDistanceCm: chaoticDist,
        echoTimeUs: this.distanceToEchoTimeUs(chaoticDist, c),
        soundSpeedMps: c,
        inBlindZone: true,
        echoValid: false, // Inválido por violação de especificação física
        qualityFactor: 0.15,
        attenuationDb: 40.0,
      };
    }

    // 2. Verificação de Alcance Máximo
    if (effectiveDistance > AcousticModel.MAX_RANGE_CM) {
      return {
        trueDistanceCm,
        measuredDistanceCm: 0,
        echoTimeUs: AcousticModel.TIMEOUT_US,
        soundSpeedMps: c,
        inBlindZone: false,
        echoValid: false,
        qualityFactor: 0.0,
        attenuationDb: 80.0,
      };
    }

    // 3. Atenuação acústica no ar (divergência esférica e absorção a 40 kHz)
    // Coeficiente de absorção alfa aproximado de 1.3 dB/m a 20°C e 40 kHz
    const pathLengthM = (2.0 * effectiveDistance) / 100.0;
    const attenuationDb = 20 * Math.log10(Math.max(1, effectiveDistance / 20.0)) + 1.3 * pathLengthM;

    // 4. Injeção de Ruído Gaussiano determinístico
    const gaussianNoise = this.prng.nextGaussian(0, noiseStdDevCm);
    const measuredDistance = Math.max(0, effectiveDistance + gaussianNoise);
    const echoTimeUs = this.distanceToEchoTimeUs(measuredDistance, c);

    // Fator de qualidade do eco (degrada com atenuação e perturbação superficial)
    const quality = Math.max(0.1, Math.min(1.0, 1.0 - (attenuationDb / 60.0) - Math.abs(surfaceDisturbanceCm) * 0.1));

    return {
      trueDistanceCm,
      measuredDistanceCm: Number(measuredDistance.toFixed(2)),
      echoTimeUs,
      soundSpeedMps: Number(c.toFixed(2)),
      inBlindZone: false,
      echoValid: true,
      qualityFactor: Number(quality.toFixed(2)),
      attenuationDb: Number(attenuationDb.toFixed(1)),
    };
  }
}
