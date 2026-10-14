# Modal de inspeção 360°

O inspetor 360° abre a partir da bancada 3D e da BOM para examinar uma referência de componente sem declarar que ela é um CAD liberado para fabricação. A classe de evidência, a origem do asset e as pendências continuam visíveis no próprio modal.

## Teclado e foco

- Ao abrir, o foco vai para **Fechar modal de inspeção**.
- `Tab` e `Shift+Tab` circulam apenas entre os controles do diálogo.
- `Esc` fecha a inspeção e devolve o foco ao controle que a abriu.
- O painel declara `role="dialog"`, `aria-modal="true"` e uma instrução de teclado para tecnologias assistivas.

Essa interação isola a navegação do diálogo. Ela não substitui inspeção física, medição de lote, nem validação do asset CAD para fabricação.
