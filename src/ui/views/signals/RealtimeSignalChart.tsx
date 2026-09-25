import React, { useEffect, useRef } from 'react';

export interface SignalSample {
  simTimeMs: number;
  rawDistanceCm: number;
  filteredDistanceCm: number;
  waterHeightCm: number;
  isOutlier: boolean;
}

interface RealtimeSignalChartProps {
  samples: SignalSample[];
  hrefCm?: number;
}

export const RealtimeSignalChart: React.FC<RealtimeSignalChartProps> = ({
  samples,
  hrefCm = 100,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Fundo instrumental
    ctx.fillStyle = '#090d13';
    ctx.fillRect(0, 0, width, height);

    // Margens
    const paddingLeft = 45;
    const paddingRight = 20;
    const paddingTop = 25;
    const paddingBottom = 30;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    // Grade milimétrica
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;

    // Linhas horizontais (0 a 100 cm)
    const yTicks = [0, 20, 40, 60, 80, 100];
    ctx.font = '9px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'right';

    yTicks.forEach((val) => {
      const y = paddingTop + chartHeight - (val / hrefCm) * chartHeight;
      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(paddingLeft + chartWidth, y);
      ctx.stroke();

      ctx.fillText(`${val}cm`, paddingLeft - 6, y + 3);
    });

    // Zona Cega (0 a 20 cm) no gráfico
    const blindY = paddingTop + chartHeight - (20 / hrefCm) * chartHeight;
    ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
    ctx.fillRect(paddingLeft, blindY, chartWidth, paddingTop + chartHeight - blindY);

    ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(paddingLeft, blindY);
    ctx.lineTo(paddingLeft + chartWidth, blindY);
    ctx.stroke();
    ctx.setLineDash([]);

    if (samples.length < 2) {
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'center';
      ctx.fillText('Aguardando amostragem de telemetria...', width / 2, height / 2);
      return;
    }

    const n = samples.length;
    const stepX = chartWidth / Math.max(n - 1, 1);

    // 1. Curva Bruta (Raw Distance com Ruído)
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    samples.forEach((s, i) => {
      const x = paddingLeft + i * stepX;
      const y = paddingTop + chartHeight - (s.rawDistanceCm / hrefCm) * chartHeight;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // 2. Pontos de Outlier Rejeitados
    samples.forEach((s, i) => {
      if (s.isOutlier) {
        const x = paddingLeft + i * stepX;
        const y = paddingTop + chartHeight - (s.rawDistanceCm / hrefCm) * chartHeight;
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // 3. Curva Filtrada (Filtro Mediano 5 Amostras)
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    samples.forEach((s, i) => {
      const x = paddingLeft + i * stepX;
      const y = paddingTop + chartHeight - (s.filteredDistanceCm / hrefCm) * chartHeight;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Ponto mais recente
    const last = samples[samples.length - 1];
    const lastX = paddingLeft + (samples.length - 1) * stepX;
    const lastY = paddingTop + chartHeight - (last.filteredDistanceCm / hrefCm) * chartHeight;

    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
    ctx.fill();

    // Bordas dos Eixos
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(paddingLeft, paddingTop);
    ctx.lineTo(paddingLeft, paddingTop + chartHeight);
    ctx.lineTo(paddingLeft + chartWidth, paddingTop + chartHeight);
    ctx.stroke();

    // Rótulos de tempo no eixo X
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'center';
    ctx.fillText('Histórico Recente (Janela Deslizante de Amostras)', paddingLeft + chartWidth / 2, height - 8);
  }, [samples, hrefCm]);

  return (
    <div className="w-full h-full flex flex-col justify-between">
      <div className="relative w-full h-full rounded-sm overflow-hidden border border-inst-border bg-[#090d13]">
        <canvas
          ref={canvasRef}
          width={640}
          height={260}
          className="w-full h-full block"
          style={{ imageRendering: 'crisp-edges' }}
        />
      </div>
    </div>
  );
};
