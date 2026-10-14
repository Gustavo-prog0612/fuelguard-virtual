# Contribuindo com o FuelGuard

Obrigado por contribuir. O FuelGuard é um gêmeo digital de referência para uma bancada de hardware; toda alteração deve preservar a distinção entre geometria digital, evidência documental e validação física.

## Ambiente local

Requisitos: Node.js 22 ou compatível com o workflow de CI.

```bash
npm ci
npm run dev
```

Antes de abrir um Pull Request, execute:

```bash
npm run verify
```

O comando executa typecheck, testes Vitest e build de produção.

## Escopo das contribuições

- Não marque um asset como exato sem fonte rastreável ou evidência de medição.
- Não transforme a PCB adaptadora em fabricável sem esquemático, footprints e revisão ERC/DRC reais.
- Toda conexão 3D deve terminar em terminais físicos definidos no registro de fiação.
- Alterações de física do tanque devem atualizar os testes de consistência de volume e distância.
- Prefira mudanças pequenas e focadas, com testes ou documentação correspondente.

## Fluxo de Pull Request

1. Crie uma branch curta a partir de `main`.
2. Faça uma alteração focada e use um commit Conventional Commits.
3. Atualize testes ou documentação quando o comportamento mudar.
4. Rode `npm run verify` localmente.
5. Abra o Pull Request usando o template e descreva limitações ou evidências pendentes.

## Áreas adequadas para primeira contribuição

- documentação e rastreabilidade de assets;
- testes unitários de cabos, colisões e geometria;
- acessibilidade do modal de inspeção 3D;
- exemplos de integração com Three.js, tscircuit ou KiCad;
- melhorias de desempenho que mantenham o resultado visual.

Issues sobre hardware físico devem informar o modelo, revisão, fonte ou medição usada. Uma simulação visual não substitui essa evidência.
