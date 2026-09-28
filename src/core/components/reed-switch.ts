/**
 * FuelGuard Virtual Test Bench — Modelo do Reed Switch da Tampa
 * Simula rebotes mecânicos transitórios (contact chatter) e o algoritmo de debounce de 50 ms no firmware.
 */

export interface ReedSwitchStatus {
  rawContactClosed: boolean;
  debouncedClosed: boolean;
  isDebouncing: boolean;
  bouncesRecorded: number;
}

export class VirtualReedSwitch {
  public static readonly DEBOUNCE_TIME_MS = 50.0;
  public static readonly CHATTER_DURATION_MS = 15.0;

  // Estado físico real do ímã (fechado = tampa no lugar, aberto = tampa aberta)
  private magnetPresent: boolean = true;
  private rawClosed: boolean = true;
  private debouncedClosed: boolean = true;

  // Variáveis de controle de rebote mecânico
  private chatterEndTimeMs: number = 0;
  private debounceStartTimeMs: number = 0;
  private bouncesCount: number = 0;

  /**
   * Altera a posição da tampa (abrir / fechar).
   * Desencadeia rajada mecânica de rebotes por 15 ms.
   */
  public setLidState(closed: boolean, currentTimeMs: number): void {
    if (this.magnetPresent === closed) return;

    this.magnetPresent = closed;
    this.chatterEndTimeMs = currentTimeMs + VirtualReedSwitch.CHATTER_DURATION_MS;
    this.debounceStartTimeMs = currentTimeMs;
    this.bouncesCount = 0;
  }

  /**
   * Atualização monotônica chamada a cada tick de 20 ms do Web Worker.
   */
  public update(currentTimeMs: number): {
    stateChanged: boolean;
    currentDebounced: boolean;
    bouncedThisTick: boolean;
  } {
    let bouncedThisTick = false;

    // Se estiver na janela de repique mecânico (0 a 15 ms após movimento)
    if (currentTimeMs < this.chatterEndTimeMs) {
      // Alterna o contato de forma oscilatória determinística
      this.rawClosed = !this.rawClosed;
      this.bouncesCount += 1;
      bouncedThisTick = true;
      this.debounceStartTimeMs = currentTimeMs; // Reinicia a janela de debounce enquanto há ruído
    } else {
      // Estabeleceu o contato no valor final
      this.rawClosed = this.magnetPresent;
    }

    // Algoritmo de Debounce por Software (50 ms contínuos no mesmo estado)
    let stateChanged = false;
    if (this.rawClosed !== this.debouncedClosed) {
      const timeInState = currentTimeMs - this.debounceStartTimeMs;
      if (timeInState >= VirtualReedSwitch.DEBOUNCE_TIME_MS) {
        this.debouncedClosed = this.rawClosed;
        stateChanged = true;
      }
    }

    return {
      stateChanged,
      currentDebounced: this.debouncedClosed,
      bouncedThisTick,
    };
  }

  public getStatus(): ReedSwitchStatus {
    return {
      rawContactClosed: this.rawClosed,
      debouncedClosed: this.debouncedClosed,
      isDebouncing: this.rawClosed !== this.debouncedClosed,
      bouncesRecorded: this.bouncesCount,
    };
  }

  public isLidClosed(): boolean {
    return this.debouncedClosed;
  }
}
