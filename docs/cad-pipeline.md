# Pipeline CAD recomendado

| Etapa | Ferramenta | Uso no FuelGuard |
|---|---|---|
| Topologia | tscircuit / Circuit JSON | Componentes, portas, nets e esquemático documental da referência de engenharia. |
| PCB para GLTF | circuit-json-to-gltf | Somente após existir `pcb_board` real; sem `drawFauxBoard`. |
| Encapsulamentos | jscad-electronics | Passivos e CIs genéricos; não módulos comerciais completos. |
| Colisão/seleção | three-mesh-bvh | Consultas de malha no viewer e auditorias geométricas. |
| STEP/IGES/BREP | OCCT Import JS | Pré-processamento ou importação controlada, não caminho principal de runtime. |
| Peças paramétricas | CadQuery | Frasco, tampa, suportes e espaçadores; exportar STEP/DXF antes do runtime. |
| Revisão KiCad | KiCanvas | Revisão adicional; não substitui KiCad/DRC. |
| Render técnico | PcbDraw | Depois de existir PCB KiCad real. |
| Outputs CI | KiBot | Gerbers, drill, BOM, CPL e verificações reprodutíveis. |
| Render final | three-gpu-pathtracer | Imagens estáticas; não usar na navegação comum. |
