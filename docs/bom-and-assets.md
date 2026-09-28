# BOM e assets

`hardware/bom/bom.json`, `hardware/real-hardware-catalog.json` e `hardware/assets/asset-manifest.json` são os contratos canônicos da referência de engenharia. Cada item declara part number, dimensões documentadas, origem, classe de confiança e gate de evidência.

- A: fonte oficial ou geometria verificada;
- B: biblioteca padronizada/datasheet, ainda sujeita à revisão da variante;
- C: modelo paramétrico de módulo comercial que precisa de medição;
- D: geometria site-specific ou ainda não comprovada; não apta para fabricação.

Encapsulamentos genéricos como SOIC, QFN, resistores e capacitores podem ser gerados com `jscad-electronics`. Um modelo genérico não substitui o modelo completo de um PN532 V4, SEN0311 ou ESP32 DevKit específico.
