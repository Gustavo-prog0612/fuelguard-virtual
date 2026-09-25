"""
FuelGuard Virtual Test Bench — Ajuste e Calibração Volumétrica Empírica V(h)
Calcula a curva volumétrica e coeficientes de regressão a partir de ensaios de bancada com proveta graduada.
"""

from typing import List, Tuple, Dict


def fit_linear_regression(points: List[Tuple[float, float]]) -> Dict[str, float]:
    """Ajusta reta V(h) = a * h + b por Mínimos Quadrados."""
    n = len(points)
    if n < 2:
        raise ValueError("Necessário pelo menos 2 pontos de calibração.")

    sum_x = sum(p[0] for p in points)
    sum_y = sum(p[1] for p in points)
    sum_xx = sum(p[0] ** 2 for p in points)
    sum_xy = sum(p[0] * p[1] for p in points)

    slope = (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x ** 2)
    intercept = (sum_y - slope * sum_x) / n

    # Coeficiente de determinação R²
    y_mean = sum_y / n
    ss_tot = sum((p[1] - y_mean) ** 2 for p in points)
    ss_res = sum((p[1] - (slope * p[0] + intercept)) ** 2 for p in points)
    r_squared = 1.0 - (ss_res / ss_tot) if ss_tot > 0 else 1.0

    return {
        "slope_L_per_cm": slope,
        "intercept_L": intercept,
        "r_squared": r_squared,
    }


def calibrate_standard_open_tank() -> Dict[str, any]:
    # Pontos de calibração empírica medidos em bancada didática com galão de água
    empirical_points = [
        (0.0, 0.0),
        (10.0, 100.2),
        (20.0, 200.5),
        (30.0, 301.0),
        (40.0, 400.8),
        (50.0, 501.2),
        (60.0, 601.0),
        (70.0, 700.5),
        (80.0, 801.0),
        (90.0, 900.5),
        (100.0, 1000.0),
    ]

    fit = fit_linear_regression(empirical_points)

    print("==========================================================================")
    print(" FUELGUARD — CALIBRAÇÃO VOLUMÉTRICA EMPÍRICA DO TANQUE COM ÁGUA ABERTA")
    print("==========================================================================")
    print(f"Número de Pontos Medidos: {len(empirical_points)}")
    print(f"Reta Ajustada: V(h) = {fit['slope_L_per_cm']:.4f} * h + ({fit['intercept_L']:.4f}) [Litros]")
    print(f"Coeficiente R²: {fit['r_squared']:.6f} (Excelente linearidade prismática)")
    print("--------------------------------------------------------------------------")
    print(f"{'Altura h (cm)':<15} | {'Vol Medido (L)':<18} | {'Vol Calculado (L)':<18} | {'Resíduo (L)':<12}")
    print("--------------------------------------------------------------------------")
    for h, v_meas in empirical_points:
        v_calc = fit['slope_L_per_cm'] * h + fit['intercept_L']
        res = v_meas - v_calc
        print(f"{h:<15.1f} | {v_meas:<18.2f} | {v_calc:<18.2f} | {res:<12.2f}")
    print("==========================================================================")

    return fit


if __name__ == "__main__":
    calibrate_standard_open_tank()
