# Avisos de Terceiros e Licenças de Código Aberto (Third-Party Notices)

Este documento registra as fontes, autores, modelos e licenças de software e bibliotecas de hardware de código aberto utilizadas ou referenciadas no projeto **FuelGuard Virtual Test Bench**.

---

## 1. Núcleo CAD e Especificação Circuit JSON

### tscircuit / circuit-json
- **Repositório:** [https://github.com/tscircuit/circuit-json](https://github.com/tscircuit/circuit-json)
- **Pacote:** `circuit-json` (npm)
- **Autor/Organização:** tscircuit (Seveibar & Comunidade tscircuit)
- **Licença:** MIT License
- **Texto da Licença:**
```
MIT License

Copyright (c) 2023-2026 tscircuit

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 2. Bibliotecas de Hardware e Modelagem Eletrônica

### Espressif KiCad Libraries (ESP32-S3 DevKitC-1)
- **Repositório:** [https://github.com/espressif/kicad-libraries](https://github.com/espressif/kicad-libraries)
- **Autor:** Espressif Systems (Shanghai) Co., Ltd.
- **Licença:** Creative Commons Attribution-ShareAlike 4.0 International (CC-BY-SA-4.0)
- **Uso no FuelGuard:** Referência canônica para dimensões ($68,00 \times 25,50$ mm) e pinagem (2x22 pinos, pitch 2.54 mm) da placa de desenvolvimento ESP32-S3 DevKitC-1 com módulo ESP32-S3-WROOM-1.
- **Link da Licença:** [https://creativecommons.org/licenses/by-sa/4.0/](https://creativecommons.org/licenses/by-sa/4.0/)

### KiCad Packages 3D & Footprints
- **Repositório:** [https://github.com/KiCad/kicad-packages3D](https://github.com/KiCad/kicad-packages3D)
- **Autor:** KiCad EDA Team & Contribuidores
- **Licença:** Creative Commons Attribution-ShareAlike 4.0 International (CC-BY-SA-4.0) com a **Exceção de Biblioteca KiCad** (*KiCad Library Exception*):
  > *"To the extent that the creation of an electronic design involves the use of the KiCad libraries, the creation and distribution of the resulting hardware design does not subject the hardware design to the terms of the Creative Commons Attribution-ShareAlike 4.0 License."*
- **Uso no FuelGuard:** Modelos paramétricos de componentes passivos (resistores axiais, LED 5mm, barramentos de pinos 2.54 mm).

### Adafruit PN532 RFID/NFC Breakout
- **Referência:** Adafruit Industries (Design Open Source Hardware)
- **Licença:** Creative Commons Attribution, Share-Alike (CC-BY-SA 3.0)
- **Uso no FuelGuard:** Referência aproximada para o breakout PN532 com antena integrada e pinagem SPI. Identificado na aplicação com o rótulo didático *"Modelo Didático Aproximado"*.

### Texas Instruments SN74AHCT125N
- **Fabricante:** Texas Instruments Incorporated
- **Documento:** Datasheet SCLS264O (Package Drawing N0014A)
- **Uso:** Dimensões JEDEC para encapsulamento DIP-14 ($19,30 \times 6,35$ mm, pitch 2.54 mm). Dados técnicos utilizados estritamente para interoperabilidade dimensional e especificação de níveis lógicos (3V3 TTL para 5V CMOS).

---

## 3. Isolamento e Propriedade Intelectual

1. O **FuelGuard Virtual Test Bench** é um projeto original didático e independente.
2. Não foram copiados códigos-fonte, logotipos, marcas registradas, estilos visuais ou ativos gráficos de produtos proprietários como **HeyPCB** ou do site **tscircuit.com**.
3. O design system "Instrumento de Engenharia Sereno" / "Instrumento Obsidiana" foi desenvolvido do zero para esta ferramenta.
