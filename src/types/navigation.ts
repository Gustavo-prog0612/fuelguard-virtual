export type AppRoute = 
  | 'overview'     // 0. Visão Geral (Permity Dashboard: Portfolio, AI risks, compliance gauge, gates)
  | 'bench'        // 1. Bancada (Canvas interativo, fiação, pinagem e validador elétrico)
  | 'signals'      // 2. Sinais (Corte do tanque 2D com eco, indicadores e séries temporais)
  | 'events'       // 3. Eventos (Console serial UART 115200 e timeline cronológica monotônica)
  | 'tests'        // 4. Testes (Cenários pré-configurados, semente PRNG e injeção de falhas)
  | 'docs'         // 5. Documentação & Design (Guia físico, laboratório tipográfico A/B/C/D)
  | 'cad';         // 6. Projeto CAD & PCB (Esquemático, PCB 2D, Gêmeo 3D tscircuit)

export interface NavItem {
  id: AppRoute;
  label: string;
  iconName: string;
  description: string;
  shortcut: string;
}
