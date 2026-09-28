import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Esp32Node } from './nodes/Esp32Node';
import { Sen0311Node as LevelSensorNode } from './nodes/Sen0311Node';
import { BuzzerNode } from './nodes/BuzzerNode';
import { Pn532Node } from './nodes/Pn532Node';
import { ReedNode } from './nodes/ReedNode';
import { LedNode } from './nodes/LedNode';
import { WIRE_COLORS } from '@/electrical/pin-definitions';
import { CircuitConnection, SAFE_CANONICAL_WIRING, FAULT_5V_DIRECT_WIRING } from '@/electrical/circuit-validator';

interface InteractiveBenchCanvasProps {
  onConnectionsChange: (connections: CircuitConnection[]) => void;
  isSimulatedFault: boolean;
  onSetFault: (fault: boolean) => void;
}

// Nós Iniciais da Bancada
const INITIAL_NODES: Node[] = [
  // 1. ESP32-S3 (Esquerda)
  {
    id: 'node_esp32',
    type: 'esp32',
    position: { x: 40, y: 80 },
    data: {},
  },
  // 2. Sensor de nível A02YYUW / SEN0311 (Centro Superior)
  {
    id: 'node_level',
    type: 'level',
    position: { x: 380, y: 40 },
    data: {},
  },
  // 3. PN532 Breakout NFC (Direita Meio)
  {
    id: 'node_pn532',
    type: 'pn532',
    position: { x: 700, y: 320 },
    data: {},
  },
  // 4. Reed Switch da Tampa (Extrema Direita)
  {
    id: 'node_reed',
    type: 'reed',
    position: { x: 1020, y: 40 },
    data: {},
  },
  // 5. LED Verde + 220R (Extrema Direita Inferior)
  {
    id: 'node_led',
    type: 'led',
    position: { x: 1020, y: 320 },
    data: {},
  },
  { id: 'node_buzzer', type: 'buzzer', position: { x: 1020, y: 470 }, data: {} },
];

function convertWiringToEdges(wiring: CircuitConnection[]): Edge[] {
  return wiring.map((w) => {
    let strokeColor = WIRE_COLORS[w.wireType || 'gnd'] || '#4b5563';
    let strokeWidth = 2;
    let animated = false;

    if (w.wireType === 'fault') {
      strokeColor = '#dc2626';
      strokeWidth = 3.5;
      animated = true;
    }

    return {
      id: w.id,
      source: getNodeByPin(w.sourcePinId),
      target: getNodeByPin(w.targetPinId),
      sourceHandle: w.sourcePinId,
      targetHandle: w.targetPinId,
      style: {
        stroke: strokeColor,
        strokeWidth,
      },
      animated,
    };
  });
}

function getNodeByPin(pinId: string): string {
  if (pinId.startsWith('esp_')) return 'node_esp32';
  if (pinId.startsWith('level_')) return 'node_level';
  if (pinId.startsWith('buzzer_')) return 'node_buzzer';
  if (pinId.startsWith('nfc_')) return 'node_pn532';
  if (pinId.startsWith('reed_')) return 'node_reed';
  if (pinId.startsWith('led_')) return 'node_led';
  return 'node_esp32';
}

function convertEdgesToWiring(edges: Edge[]): CircuitConnection[] {
  return edges.map((e) => ({
    id: e.id,
    sourcePinId: e.sourceHandle || '',
    targetPinId: e.targetHandle || '',
    wireType: e.id.includes('fault') ? 'fault' : 'gnd',
  }));
}

export const InteractiveBenchCanvas: React.FC<InteractiveBenchCanvasProps> = ({
  onConnectionsChange,
  isSimulatedFault,
  onSetFault,
}) => {
  const [nodes, , onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    convertWiringToEdges(isSimulatedFault ? FAULT_5V_DIRECT_WIRING : SAFE_CANONICAL_WIRING)
  );

  const nodeTypes = useMemo(
    () => ({
      esp32: Esp32Node,
      level: LevelSensorNode,
      buzzer: BuzzerNode,
      pn532: Pn532Node,
      reed: ReedNode,
      led: LedNode,
    }),
    []
  );

  // Manipulador de nova conexão (drag & drop de jumper)
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => {
        const newEdges = addEdge(
          {
            ...params,
            style: { stroke: '#0f5132', strokeWidth: 2 },
          },
          eds
        );
        onConnectionsChange(convertEdgesToWiring(newEdges));
        return newEdges;
      });
    },
    [onConnectionsChange, setEdges]
  );

  // Efeito ao alternar falha
  React.useEffect(() => {
    const targetWiring = isSimulatedFault ? FAULT_5V_DIRECT_WIRING : SAFE_CANONICAL_WIRING;
    setEdges(convertWiringToEdges(targetWiring));
    onConnectionsChange(targetWiring);
  }, [isSimulatedFault, onConnectionsChange, setEdges]);

  return (
    <div className="w-full h-full relative select-none">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.4}
        maxZoom={1.5}
        className="bg-inst-canvas"
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="var(--color-border-strong)" />
        <MiniMap
          nodeStrokeWidth={2}
          className="!bg-inst-surface !border-inst-border !rounded-sm !shadow-xs"
          maskColor="rgba(0, 0, 0, 0.15)"
        />
      </ReactFlow>

      {/* Barra Flutuante de Ações da Fiação */}
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-2 bg-inst-surface/90 backdrop-blur-xs border border-inst-border p-1.5 rounded-sm shadow-xs font-mono text-xs">
        <button
          onClick={() => onSetFault(false)}
          className={`px-2.5 py-1 rounded-xs transition font-semibold flex items-center gap-1.5 ${
            !isSimulatedFault
              ? 'bg-fuelguard-green text-white shadow-xs'
              : 'text-inst-secondary hover:text-inst-primary hover:bg-inst-subtle'
          }`}
        >
          Fiação Padrão Segura
        </button>

        <button
          onClick={() => onSetFault(true)}
          className={`px-2.5 py-1 rounded-xs transition font-semibold flex items-center gap-1.5 ${
            isSimulatedFault
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-inst-secondary hover:text-[#b91c1c] hover:bg-rose-50 dark:hover:bg-rose-950/40'
          }`}
        >
          {isSimulatedFault ? 'Falha Ativa: UART 5V no GPIO16' : 'Injetar Falha UART 5V'}
        </button>

        <button
          onClick={() => {
            setEdges([]);
            onConnectionsChange([]);
          }}
          className="px-2 py-1 rounded-xs text-inst-muted hover:text-inst-primary hover:bg-inst-subtle transition"
          title="Desconectar todos os jumpers para montagem manual"
        >
          Limpar Fiação
        </button>

      </div>
    </div>
  );
};
