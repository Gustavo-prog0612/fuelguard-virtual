export interface FunctionalDetail {
  id: string;
  label: string;
  role: string;
  behavior: string;
  validation: string;
}

export const COMPONENT_FUNCTION_CATALOG: Record<string, FunctionalDetail[]> = {
  esp32_s3_devkit: [
    { id: 'wroom', label: 'ESP32-S3-WROOM-1', role: 'MCU, Wi-Fi e BLE', behavior: 'Executa o firmware, recebe o UART do sensor, lê o interlock e controla LED/buzzer.', validation: 'GPIO16 recebe TX; GPIO7 usa pull-up; GPIO4 e GPIO14 são saídas.' },
    { id: 'spi', label: 'Barramento SPI J1.16–J1.19', role: 'Leitor PN532', behavior: 'CS=GPIO10, MOSI=GPIO11, SCK=GPIO12 e MISO=GPIO13 em 3,3 V.', validation: 'Confirmar modo SPI por SEL0/SEL1 no Adafruit PN532 v1.6 e continuidade pino a pino.' },
    { id: 'usb-uart', label: 'Micro-USB UART', role: 'Alimentação e console', behavior: 'Fornece 5 V à DevKitC e permite flash/log serial pelo conversor USB-UART.', validation: 'Usar cabo de dados; não alimentar simultaneamente por fontes incompatíveis.' },
    { id: 'headers', label: 'Headers J1/J3 2×22', role: 'Interface mecatrônica', behavior: 'J1 concentra os pinos usados pelo FuelGuard; J3 permanece disponível para expansão.', validation: 'Pinagem baseada no guia oficial ESP32-S3-DevKitC-1 v1.1.' },
    { id: 'power', label: 'LDO 5 V → 3V3', role: 'Domínio lógico', behavior: 'O trilho +3V3 alimenta sensor e PN532; nenhum GPIO recebe 5 V.', validation: 'Medir 3,0–3,6 V antes de conectar UART.' },
  ],
  pn532_breakout: [
    { id: 'antenna', label: 'Antena NFC', role: 'Acoplamento indutivo', behavior: 'Gera o campo de 13,56 MHz para detectar cartão/tag próximo à face frontal.', validation: 'Manter a face livre de metal e respeitar o keepout do suporte.' },
    { id: 'spi-header', label: 'JP4 1×8 · SPI', role: 'Interface com ESP32', behavior: 'Usa JP4.2 SCK, JP4.3 MISO, JP4.4 MOSI e JP4.5 NSS/CS; JP4.1/JP4.8 completam a alimentação.', validation: 'Conferir SEL0/SEL1 e a ordem física do JP4 na placa Adafruit v1.6.' },
    { id: 'read-flow', label: 'Fluxo de leitura', role: 'Exemplo funcional', behavior: 'O ESP32 baixa CS, troca quadros SPI, valida o UID e autoriza ou rejeita a operação.', validation: 'Testar com UID autorizado e desconhecido no modo Eventos.' },
  ],
  a02yyuw_sen0311: [
    { id: 'transducers', label: 'Transdutores ultrassônicos', role: 'Medição de distância', behavior: 'Disparam o eco e calculam a distância entre a tampa e a superfície da água.', validation: 'Face perpendicular ao líquido; zona cega nominal de 30 mm.' },
    { id: 'uart', label: 'UART TTL 4 fios', role: 'Telemetria de nível', behavior: 'TX envia frame 0xFF + distância alta + distância baixa + checksum em 9600 8N1.', validation: 'TX → GPIO16; RX/MODE mantido em HIGH pelo trilho +3V3.' },
    { id: 'water-model', label: 'Conversão para volume', role: 'Modelo cilíndrico', behavior: 'Converte altura em volume usando π·r²·h para o tanque Ø200 × 160 mm.', validation: 'Limitar operação a aproximadamente 4,084 L para respeitar a zona cega.' },
  ],
  reed_switch: [
    { id: 'contact', label: 'Contato reed NO/NC', role: 'Interlock da tampa', behavior: 'Fecha para GND quando o ímã aproxima o sensor na posição de tampa fechada.', validation: 'Confirmar variante, gap e estado NO/NC do lote adquirido.' },
  ],
  led_indicator: [
    { id: 'status', label: 'LED verde + R3 220 Ω', role: 'Estado da bancada', behavior: 'GPIO4 fornece corrente pelo resistor limitador e acende o indicador de operação.', validation: 'Verificar polaridade e queda de tensão do LED.' },
  ],
  buzzer_active: [
    { id: 'alarm', label: 'Buzzer ativo', role: 'Alarme didático', behavior: 'GPIO14 aplica o nível de acionamento; o oscilador interno gera o tom.', validation: 'Confirmar corrente de pico e polaridade antes de liberar o GPIO.' },
  ],
};

