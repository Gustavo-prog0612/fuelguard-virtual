"""
FuelGuard Virtual Test Bench — Benchmark Comparativo de Filtros Digitais
Compara o Filtro Mediano (5 amostras) adotado no firmware contra Média Móvel e Filtro de Kalman 1D
sob condições realistas de ruído gaussiano e reflexões ultrassônicas espúrias (outliers).
"""

import math
import random
from typing import List, Dict, Tuple


def generate_synthetic_acoustic_data(
    n_points: int = 100,
    true_distance_cm: float = 42.0,
    noise_sigma: float = 0.35,
    n_spikes: int = 6,
    seed: int = 42,
) -> Tuple[List[float], List[float]]:
    """Gera sinal com ruído térmico gaussiano e spikes impulsivos de bolhas/reflexões."""
    random.seed(seed)
    ground_truth = [true_distance_cm] * n_points
    raw_measurements = []

    # Índices aleatórios para inserção de outliers
    spike_indices = set(random.sample(range(5, n_points - 5), n_spikes))

    for i in range(n_points):
        # Ruído térmico do ar (distribuição normal via Box-Muller)
        u1 = random.random()
        u2 = random.random()
        z0 = math.sqrt(-2.0 * math.log(max(1e-12, u1))) * math.cos(2.0 * math.pi * u2)
        noise = z0 * noise_sigma

        val = true_distance_cm + noise

        # Injeção de outliers (ex: salto abrupto para 85 cm ou 12 cm)
        if i in spike_indices:
            val += random.choice([+40.0, -25.0])

        raw_measurements.append(val)

    return ground_truth, raw_measurements


class MovingAverageFilter:
    def __init__(self, window_size: int = 5):
        self.window_size = window_size
        self.window: List[float] = []

    def update(self, val: float) -> float:
        self.window.append(val)
        if len(self.window) > self.window_size:
            self.window.pop(0)
        return sum(self.window) / len(self.window)


class MedianFilter:
    def __init__(self, window_size: int = 5):
        self.window_size = window_size
        self.window: List[float] = []

    def update(self, val: float) -> float:
        self.window.append(val)
        if len(self.window) > self.window_size:
            self.window.pop(0)
        sorted_win = sorted(self.window)
        mid = len(sorted_win) // 2
        if len(sorted_win) % 2 != 0:
            return sorted_win[mid]
        return (sorted_win[mid - 1] + sorted_win[mid]) / 2.0


class KalmanFilter1D:
    def __init__(self, q: float = 1e-4, r: float = 0.12, initial_x: float = 42.0):
        self.q = q
        self.r = r
        self.x = initial_x
        self.p = 1.0

    def update(self, measurement: float) -> float:
        # Predição
        self.p = self.p + self.q

        # Atualização (Ganho de Kalman)
        k = self.p / (self.p + self.r)
        self.x = self.x + k * (measurement - self.x)
        self.p = (1.0 - k) * self.p
        return self.x


def evaluate_filter(
    ground_truth: List[float], estimates: List[float]
) -> Dict[str, float]:
    errors = [abs(e - g) for e, g in zip(estimates, ground_truth)]
    squared_errors = [(e - g) ** 2 for e, g in zip(estimates, ground_truth)]

    mse = sum(squared_errors) / len(squared_errors)
    mae = sum(errors) / len(errors)
    max_err = max(errors)

    return {
        "mse": mse,
        "rmse": math.sqrt(mse),
        "mae": mae,
        "max_error": max_err,
    }


def run_benchmark():
    ground_truth, raw = generate_synthetic_acoustic_data(n_points=120, true_distance_cm=42.0)

    ma_filter = MovingAverageFilter(window_size=5)
    med_filter = MedianFilter(window_size=5)
    kalman_filter = KalmanFilter1D(q=1e-4, r=0.15, initial_x=42.0)

    ma_outputs = [ma_filter.update(x) for x in raw]
    med_outputs = [med_filter.update(x) for x in raw]
    kalman_outputs = [kalman_filter.update(x) for x in raw]

    eval_raw = evaluate_filter(ground_truth, raw)
    eval_ma = evaluate_filter(ground_truth, ma_outputs)
    eval_med = evaluate_filter(ground_truth, med_outputs)
    eval_kalman = evaluate_filter(ground_truth, kalman_outputs)

    print("==========================================================================")
    print(" FUELGUARD — BENCHMARK DE FILTROS DIGITAIS PARA SENSOR ACÚSTICO JSN-SR04T")
    print("==========================================================================")
    print(f"Condições: 120 amostras | d_real = 42.0 cm | Ruído térmico: sigma = 0.35 cm | 6 Spikes")
    print("--------------------------------------------------------------------------")
    print(f"{'Algoritmo':<22} | {'MSE (cm²)':<12} | {'RMSE (cm)':<12} | {'Erro Máx (cm)':<14}")
    print("--------------------------------------------------------------------------")
    print(f"{'Sinal Bruto (Sem Filtro)':<22} | {eval_raw['mse']:<12.4f} | {eval_raw['rmse']:<12.4f} | {eval_raw['max_error']:<14.2f}")
    print(f"{'Média Móvel (5 Amostras)':<22} | {eval_ma['mse']:<12.4f} | {eval_ma['rmse']:<12.4f} | {eval_ma['max_error']:<14.2f}")
    print(f"{'Kalman 1D (Q=1e-4, R=0.15)':<22} | {eval_kalman['mse']:<12.4f} | {eval_kalman['rmse']:<12.4f} | {eval_kalman['max_error']:<14.2f}")
    print(f"{'Filtro Mediano (Oficial)':<22} | {eval_med['mse']:<12.4f} | {eval_med['rmse']:<12.4f} | {eval_med['max_error']:<14.2f}")
    print("==========================================================================")
    print("CONCLUSÃO TÉCNICA:")
    print(" - O Filtro Mediano possui o menor Erro Máximo porque descarta os outliers")
    print("   completamente da janela sem 'espalhar' o erro nas amostras seguintes.")
    print(" - A Média Móvel é vulnerável a spikes, gerando distorção prolongada.")
    print("==========================================================================")

    return {
        "raw": eval_raw,
        "moving_average": eval_ma,
        "kalman": eval_kalman,
        "median": eval_med,
    }


if __name__ == "__main__":
    run_benchmark()
