# Limitações conhecidas

- O tanque/tampa e qualquer módulo sem lote confirmado permanecem bloqueados; nenhuma cota site-specific é exibida como medição.
- A simulação de água e ToF não substitui calibração acústica, ensaio de estanqueidade ou validação com combustível.
- O viewer não prova clearance, DRC, EMC, dissipação, vibração ou segurança veicular.
- O snapshot não contém a PCB adaptadora FuelGuard. O botão de exportação `.kicad_pcb` permanece bloqueado para impedir um arquivo sintético com aparência de fabricação.
- `circuit-json-to-gltf` não foi forçado como dependência da aplicação porque sua árvore atual declara peer `zod@3`, enquanto o projeto usa `zod@4`; deve ser isolado em pipeline quando o contrato de PCB for criado.
