# Prontidão para fabricação

## Estado atual

O conjunto atual é `engineering-reference` e a placa adaptadora está `not-designed`. Portanto ainda não há autorização para fabricar ou chamar a placa de “roteada”, “DRC verde” ou “pronta”. A referência usa peças comerciais documentadas, mas mantém bloqueios para lote, medição e integração do tanque real.

## Gate obrigatório da PCB adaptadora

1. Esquemático KiCad/Circuit JSON revisado e ERC sem violações críticas.
2. Footprints e modelos dos módulos congelados; conectores e pinagem aprovados.
3. Contorno, furos, camadas, stackup, classes de rede e regras do fabricante definidos.
4. Roteamento real revisado e DRC executado com KiBot.
5. Gerbers, drill, BOM, CPL e Interactive HTML BOM exportados e arquivados.
6. Render técnico PcbDraw/KiCanvas revisado por outra pessoa.

`circuit-json-to-gltf` só entra depois do item 3 para converter uma PCB real; `three-gpu-pathtracer` fica reservado para render estático, não para navegação.
