# Riscos atuais e controles

| Risco | Impacto | Controle |
|---|---|---|
| SEN0311 recebido com probe/cabo diferente | suporte ou prensa-cabo incorretos | medir unidade, cabo, terminal e raio mínimo antes da tampa |
| PN532 V4 com header/furação diferente | encaixe e comunicação SPI falham | confirmar V4, gênero, altura, furos e keepout da antena |
| MC-38 variante NO/NC divergente | interlock invertido | fixar vendedor/MPN, testar continuidade e gap |
| 5 V aplicado ao GPIO16 | dano ao ESP32-S3 | operar SEN0311 em 3,3 V; DRC e teste de tensão antes da conexão |
| Buzzer ativo com corrente/polaridade incompatível | reset ou dano de saída | medir corrente e revisar driver/limite do GPIO14 |
| Tanque com tolerância ou vazamento | volume e segurança inválidos | fabricar, testar vazamento e calibrar com proveta |
| MB-102 diferente do nominal | bancada 3D e fios não encaixam | medir exemplar recebido |
| PCB liberada sem ERC/DRC/Gerbers revisados | falha de fabricação | manter `not-designed` até todos os outputs da mesma revisão |

O projeto é de baixa tensão e água de demonstração. Não há circuito automotivo, combustível ou homologação neste escopo.
