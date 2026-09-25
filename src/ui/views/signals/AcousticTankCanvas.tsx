import React, { useEffect, useRef, useState } from 'react';

interface AcousticTankCanvasProps {
  waterHeightCm: number;
  hrefCm: number;
  inBlindZone: boolean;
  echoValid: boolean;
  soundSpeedMps: number;
  isAgitated?: boolean;
  onTriggerSlosh?: () => void;
}

export const AcousticTankCanvas: React.FC<AcousticTankCanvasProps> = ({
  waterHeightCm,
  hrefCm,
  inBlindZone,
  echoValid,
  soundSpeedMps,
  onTriggerSlosh,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [sloshAmp, setSloshAmp] = useState<number>(0);
  const animFrameRef = useRef<number | null>(null);
  const wavePhaseRef = useRef<number>(0);
  const pulseYRef = useRef<number>(0);
  const isEchoRef = useRef<boolean>(false);

  // Manipulador de perturbação da água
  const triggerAgitation = () => {
    setSloshAmp(4.0); // 4 cm de amplitude inicial
    if (onTriggerSlosh) onTriggerSlosh();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      // Amortecimento do slosh: zeta = 0.08, omega = 2.5 Hz
      setSloshAmp((prev) => {
        if (prev <= 0.05) return 0;
        return prev * Math.exp(-0.8 * dt);
      });

      wavePhaseRef.current += dt * 8.0;

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Fundo técnico do instrumento
      ctx.fillStyle = '#090d13';
      ctx.fillRect(0, 0, width, height);

      // Grade milimétrica sutil
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Parâmetros de escala do tanque
      const tankTop = 45;
      const tankBottom = height - 25;
      const tankHeightPx = tankBottom - tankTop;
      const tankLeft = 35;
      const tankRight = width - 45;
      const tankWidth = tankRight - tankLeft;

      // Nível d'água em pixels
      const clampedWaterCm = Math.max(0, Math.min(hrefCm, waterHeightCm));
      const waterHeightPx = (clampedWaterCm / hrefCm) * tankHeightPx;
      const waterY = tankBottom - waterHeightPx;

      // 1. Zona Cega (0 a 20 cm abaixo do transdutor)
      const blindZonePx = (20 / hrefCm) * tankHeightPx;
      ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
      ctx.fillRect(tankLeft, tankTop, tankWidth, blindZonePx);

      // Hachura da Zona Cega
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.2)';
      ctx.lineWidth = 1;
      for (let i = -tankWidth; i < tankWidth + blindZonePx; i += 12) {
        ctx.beginPath();
        ctx.moveTo(tankLeft + Math.max(0, i), tankTop);
        ctx.lineTo(tankLeft + Math.min(tankWidth, i + blindZonePx), tankTop + blindZonePx);
        ctx.stroke();
      }

      // Linha tracejada limite da zona cega
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(tankLeft, tankTop + blindZonePx);
      ctx.lineTo(tankRight, tankTop + blindZonePx);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = '9px "IBM Plex Mono", monospace';
      ctx.fillStyle = inBlindZone ? '#ef4444' : 'rgba(239, 68, 68, 0.7)';
      ctx.fillText('ZONA CEGA (20 cm)', tankLeft + 8, tankTop + 14);

      // 2. Cone de Emissão Acústica (~55°)
      const centerX = tankLeft + tankWidth / 2;
      const coneBottomY = Math.min(tankBottom, waterY);
      const halfConeWidth = Math.min(tankWidth / 2 - 5, (coneBottomY - tankTop) * 0.45);

      const coneGrad = ctx.createLinearGradient(centerX, tankTop, centerX, coneBottomY);
      coneGrad.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
      coneGrad.addColorStop(1, 'rgba(56, 189, 248, 0.03)');

      ctx.fillStyle = coneGrad;
      ctx.beginPath();
      ctx.moveTo(centerX, tankTop);
      ctx.lineTo(centerX + halfConeWidth, coneBottomY);
      ctx.lineTo(centerX - halfConeWidth, coneBottomY);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(centerX, tankTop);
      ctx.lineTo(centerX + halfConeWidth, coneBottomY);
      ctx.moveTo(centerX, tankTop);
      ctx.lineTo(centerX - halfConeWidth, coneBottomY);
      ctx.stroke();
      ctx.setLineDash([]);

      // 3. Frentes de Onda Ultrassônica (40 kHz)
      pulseYRef.current += dt * (soundSpeedMps * 0.4);
      if (pulseYRef.current > coneBottomY - tankTop) {
        pulseYRef.current = 0;
        isEchoRef.current = !isEchoRef.current;
      }

      const waveRadius = pulseYRef.current;
      if (waveRadius > 5 && waveRadius < coneBottomY - tankTop) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const startAngle = Math.PI / 4;
        const endAngle = (3 * Math.PI) / 4;
        ctx.arc(centerX, tankTop, waveRadius, startAngle, endAngle);
        ctx.stroke();

        // Eco de retorno
        if (echoValid && waveRadius > 15) {
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          const echoRadius = (coneBottomY - tankTop) - waveRadius * 0.6;
          if (echoRadius > 5) {
            ctx.arc(centerX, coneBottomY, echoRadius, (5 * Math.PI) / 4, (7 * Math.PI) / 4);
            ctx.stroke();
          }
        }
      }

      // 4. Coluna d'Água com Superfície Ondulada (Slosh)
      if (waterHeightPx > 0) {
        const waterGrad = ctx.createLinearGradient(0, waterY, 0, tankBottom);
        waterGrad.addColorStop(0, 'rgba(14, 165, 233, 0.35)');
        waterGrad.addColorStop(1, 'rgba(3, 105, 161, 0.6)');

        ctx.fillStyle = waterGrad;
        ctx.beginPath();
        ctx.moveTo(tankLeft, tankBottom);
        ctx.lineTo(tankLeft, waterY);

        // Curva da onda senoidal de slosh
        const numPoints = 30;
        for (let i = 0; i <= numPoints; i++) {
          const x = tankLeft + (i / numPoints) * tankWidth;
          const waveOffset =
            Math.sin((i / numPoints) * Math.PI * 2 + wavePhaseRef.current) *
            sloshAmp *
            (tankHeightPx / hrefCm);
          ctx.lineTo(x, waterY + waveOffset);
        }

        ctx.lineTo(tankRight, tankBottom);
        ctx.closePath();
        ctx.fill();

        // Linha da crista da água
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i <= numPoints; i++) {
          const x = tankLeft + (i / numPoints) * tankWidth;
          const waveOffset =
            Math.sin((i / numPoints) * Math.PI * 2 + wavePhaseRef.current) *
            sloshAmp *
            (tankHeightPx / hrefCm);
          if (i === 0) ctx.moveTo(x, waterY + waveOffset);
          else ctx.lineTo(x, waterY + waveOffset);
        }
        ctx.stroke();
      }

      // 5. Paredes e Fundo do Tanque
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(tankLeft, tankTop);
      ctx.lineTo(tankLeft, tankBottom);
      ctx.lineTo(tankRight, tankBottom);
      ctx.lineTo(tankRight, tankTop);
      ctx.stroke();

      // 6. Transdutor JSN-SR04T no Topo
      const transWidth = 70;
      const transHeight = 22;
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.fillRect(centerX - transWidth / 2, tankTop - transHeight, transWidth, transHeight);
      ctx.strokeRect(centerX - transWidth / 2, tankTop - transHeight, transWidth, transHeight);

      // Cúpula piezoelétrica JSN
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(centerX, tankTop, 12, 0, Math.PI);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(centerX - 18, tankTop - 11, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 9px "IBM Plex Sans", sans-serif';
      ctx.fillText('JSN-SR04T', centerX - 8, tankTop - 8);

      // 7. Régua de Cotas Lateral
      ctx.fillStyle = '#64748b';
      ctx.font = '9px "IBM Plex Mono", monospace';
      ctx.textAlign = 'right';

      const ticks = [0, 20, 40, 60, 80, 100];
      ticks.forEach((tickCm) => {
        const y = tankTop + (tickCm / hrefCm) * tankHeightPx;
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(tankRight, y);
        ctx.lineTo(tankRight + 5, y);
        ctx.stroke();

        ctx.fillText(`${tickCm}cm`, width - 5, y + 3);
      });

      // Rótulo da distância atual medida
      const distCm = hrefCm - clampedWaterCm;
      ctx.textAlign = 'left';
      ctx.fillStyle = inBlindZone ? '#ef4444' : '#38bdf8';
      ctx.font = 'bold 10px "IBM Plex Mono", monospace';
      ctx.fillText(`d = ${distCm.toFixed(1)} cm`, tankLeft + 8, waterY - 8);

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [waterHeightCm, hrefCm, inBlindZone, echoValid, soundSpeedMps, sloshAmp]);

  return (
    <div className="flex flex-col items-center space-y-3 w-full">
      <div className="relative w-full rounded-sm overflow-hidden border border-inst-border bg-[#090d13] shadow-inner">
        <canvas
          ref={canvasRef}
          width={300}
          height={320}
          className="w-full h-auto block"
          style={{ imageRendering: 'crisp-edges' }}
        />

        {inBlindZone && (
          <div className="absolute top-2 left-2 right-2 bg-rose-950/90 border border-rose-600 p-1.5 rounded-xs text-center text-[10px] font-mono text-rose-200 font-bold animate-pulse">
            ALERTA: NÍVEL DENTRO DA ZONA CEGA (&lt; 20 cm)
          </div>
        )}
      </div>

      {/* Botão didático para perturbação de superfície */}
      <button
        type="button"
        onClick={triggerAgitation}
        className="w-full py-1.5 px-3 bg-inst-surface border border-inst-border hover:bg-inst-subtle text-inst-primary text-xs font-mono font-medium rounded-xs transition shadow-xs flex items-center justify-center gap-2"
        title="Simula abastecimento ou vibração provocando oscilação harmônica amortecida da água"
      >
        <span>Perturbar Superfície (Slosh)</span>
        {sloshAmp > 0.1 && (
          <span className="text-[10px] font-mono text-fuelguard-green font-bold animate-pulse">
            ±{sloshAmp.toFixed(1)}cm
          </span>
        )}
      </button>
    </div>
  );
};
