/**
 * FuelGuard Virtual Test Bench — Modelo Virtual do Módulo PN532 (NFC / RFID 13,56 MHz)
 * Comunicação SPI 3,3V com o ESP32-S3 e controle de sessão por UID.
 */

export interface NfcTag {
  uid: string;
  name: string;
  authorized: boolean;
  role: string;
}

export const KNOWN_TAGS: Record<string, NfcTag> = {
  '04:3A:7F:2C:5D': {
    uid: '04:3A:7F:2C:5D',
    name: 'Operador Didático Autorizado',
    authorized: true,
    role: 'Técnico de Bancada',
  },
  '04:9B:11:3E:8A': {
    uid: '04:9B:11:3E:8A',
    name: 'Tag Não Autorizada / Desconhecida',
    authorized: false,
    role: 'Visitante Não Cadastrado',
  },
};

export class VirtualPN532 {
  private presentTag: NfcTag | null = null;
  private sessionActive: boolean = false;
  private lastReadTimeMs: number = 0;

  /**
   * Apresenta uma tag NFC na área de alcance da antena (campo RF de 13,56 MHz).
   */
  public presentTagByUid(uid: string, currentTimeMs: number): {
    tag: NfcTag;
    isAuthorized: boolean;
    sessionStarted: boolean;
  } {
    const tag = KNOWN_TAGS[uid] || {
      uid,
      name: 'Tag Desconhecida',
      authorized: false,
      role: 'Desconhecido',
    };

    this.presentTag = tag;
    this.lastReadTimeMs = currentTimeMs;

    if (tag.authorized) {
      this.sessionActive = true;
      return { tag, isAuthorized: true, sessionStarted: true };
    } else {
      this.sessionActive = false;
      return { tag, isAuthorized: false, sessionStarted: false };
    }
  }

  /**
   * Remove a tag do campo da antena.
   */
  public removeTag(): void {
    this.presentTag = null;
    this.sessionActive = false;
  }

  public isTagPresent(): boolean {
    return this.presentTag !== null;
  }

  public getActiveTag(): NfcTag | null {
    return this.presentTag;
  }

  public getLastReadTimeMs(): number {
    return this.lastReadTimeMs;
  }

  public isSessionActive(): boolean {
    return this.sessionActive;
  }
}
