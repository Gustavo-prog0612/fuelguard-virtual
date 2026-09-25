/**
 * FuelGuard Virtual Test Bench — Interactive 3D ViewCube
 * Renderiza um cubo de navegação espacial (estilo tscircuit / CAD profissional)
 * sincronizado com a rotação da câmera, permitindo cliques para alinhar vistas.
 */

import React, { useRef, useEffect, useState } from 'react';

interface ViewCubeProps {
  rotX: number;
  rotY: number;
  onSelectView: (targetRotX: number, targetRotY: number) => void;
}

interface FaceDef {
  name: string;
  normal: [number, number, number];
  center: [number, number, number];
  targetRotX: number;
  targetRotY: number;
  color: string;
}

export const ViewCube: React.FC<ViewCubeProps> = ({ rotX, rotY, onSelectView }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredFace, setHoveredFace] = useState<string | null>(null);

  const FACES: FaceDef[] = [
    { name: 'TOP', normal: [0, 1, 0], center: [0, 1, 0], targetRotX: Math.PI / 2 - 0.05, targetRotY: 0, color: '#e2e8f0' },
    { name: 'FRONT', normal: [0, 0, 1], center: [0, 0, 1], targetRotX: 0, targetRotY: 0, color: '#cbd5e1' },
    { name: 'RIGHT', normal: [1, 0, 0], center: [1, 0, 0], targetRotX: 0, targetRotY: -Math.PI / 2, color: '#94a3b8' },
    { name: 'LEFT', normal: [-1, 0, 0], center: [-1, 0, 0], targetRotX: 0, targetRotY: Math.PI / 2, color: '#94a3b8' },
    { name: 'BACK', normal: [0, 0, -1], center: [0, 0, -1], targetRotX: 0, targetRotY: Math.PI, color: '#64748b' },
    { name: 'BOTTOM', normal: [0, -1, 0], center: [0, -1, 0], targetRotX: -Math.PI / 2 + 0.05, targetRotY: 0, color: '#475569' },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    ctx.clearRect(0, 0, size, size);

    const cx = size / 2;
    const cy = size / 2;
    const s = 24; // meia aresta do cubo

    // Vértices do cubo 3D unitário (-1 a +1)
    const vertices: [number, number, number][] = [
      [-s, -s, -s],
      [s, -s, -s],
      [s, s, -s],
      [-s, s, -s],
      [-s, -s, s],
      [s, -s, s],
      [s, s, s],
      [-s, s, s],
    ];

    // Rotação 3D combinada
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);

    const project = (x: number, y: number, z: number): [number, number, number] => {
      // Rotação Y
      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;
      // Rotação X
      const y2 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;
      return [cx + x1, cy - y2, z2];
    };

    const projectedVertices = vertices.map((v) => project(v[0], v[1], v[2]));

    // Definição dos 6 polígonos das faces
    const facePolys = [
      { name: 'TOP', indices: [3, 2, 6, 7], normal: [0, 1, 0] },
      { name: 'BOTTOM', indices: [0, 1, 5, 4], normal: [0, -1, 0] },
      { name: 'FRONT', indices: [4, 5, 6, 7], normal: [0, 0, 1] },
      { name: 'BACK', indices: [1, 0, 3, 2], normal: [0, 0, -1] },
      { name: 'RIGHT', indices: [5, 1, 2, 6], normal: [1, 0, 0] },
      { name: 'LEFT', indices: [0, 4, 7, 3], normal: [-1, 0, 0] },
    ];

    // Calcula profundidade Z média e visibilidade
    const renderedFaces = facePolys
      .map((f) => {
        // Rotação da normal para determinar visibilidade
        const nx = f.normal[0];
        const ny = f.normal[1];
        const nz = f.normal[2];
        const nz1 = nx * sinY + nz * cosY;
        const nz2 = ny * sinX + nz1 * cosX;

        const avgZ = f.indices.reduce((sum, idx) => sum + projectedVertices[idx][2], 0) / 4;
        return {
          ...f,
          visible: nz2 > 0, // Normal apontando para o observador
          depth: avgZ,
        };
      })
      .filter((f) => f.visible)
      .sort((a, b) => a.depth - b.depth);

    // Desenha as faces visíveis ordenadas por profundidade
    renderedFaces.forEach((face) => {
      const pts = face.indices.map((idx) => projectedVertices[idx]);
      const isHover = hoveredFace === face.name;

      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i][0], pts[i][1]);
      }
      ctx.closePath();

      // Cor de preenchimento
      ctx.fillStyle = isHover ? '#22c55e' : '#1e293b';
      ctx.fill();

      ctx.strokeStyle = isHover ? '#86efac' : '#475569';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Centro do polígono para desenhar o texto da face
      const faceCenterX = pts.reduce((sum, p) => sum + p[0], 0) / 4;
      const faceCenterY = pts.reduce((sum, p) => sum + p[1], 0) / 4;

      ctx.font = 'bold 9px "IBM Plex Mono", monospace';
      ctx.fillStyle = isHover ? '#022c22' : '#f8fafc';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(face.name, faceCenterX, faceCenterY);
    });
  }, [rotX, rotY, hoveredFace]);

  const handleCanvasClick = (_e: React.MouseEvent<HTMLCanvasElement>) => {
    // Se clicou com uma face selecionada
    if (hoveredFace) {
      const faceDef = FACES.find((f) => f.name === hoveredFace);
      if (faceDef) {
        onSelectView(faceDef.targetRotX, faceDef.targetRotY);
        return;
      }
    }

    // Clique geral para resetar isométrica
    onSelectView(0.35, -0.55);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Detecta se está perto do centro superior (TOP), centro (FRONT), etc.
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const dx = x - cx;
    const dy = y - cy;

    if (Math.abs(dx) < 25 && dy < -10) setHoveredFace('TOP');
    else if (Math.abs(dx) < 25 && dy > 10) setHoveredFace('FRONT');
    else if (dx > 10) setHoveredFace('RIGHT');
    else if (dx < -10) setHoveredFace('LEFT');
    else setHoveredFace(null);
  };

  return (
    <div className="flex flex-col items-center">
      <canvas
        ref={canvasRef}
        width={80}
        height={80}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredFace(null)}
        className="cursor-pointer drop-shadow-md hover:scale-105 transition-transform"
        title="ViewCube: Clique para alinhar a visão da placa"
      />
      <button
        onClick={() => onSelectView(0.35, -0.55)}
        className="text-[9px] font-mono text-inst-secondary hover:text-fuelguard-green transition mt-0.5"
      >
        [Isométrica]
      </button>
    </div>
  );
};
