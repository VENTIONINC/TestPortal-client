// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

type YAxisConfig = { domain: [number, number]; ticks: number[] };

const NICE_MULTIPLIERS = [1, 2, 5, 10];

/**
 * Compute a nice Y-axis domain and evenly spaced integer ticks.
 * Uses a Wilkinson/D3-style nice step: {1, 2, 5, 10} × 10^n.
 */
export function computeYAxisTicks(max: number, tickCount = 6): YAxisConfig {
  const safeMax = Number.isFinite(max) && max > 0 ? max : 1;

  if (safeMax <= 1) {
    return { domain: [0, 1], ticks: [0, 1] };
  }

  const intervals = Math.max(tickCount - 1, 1);
  const roughStep = safeMax / intervals;
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const residual = roughStep / magnitude;

  let niceMultiplier = NICE_MULTIPLIERS[NICE_MULTIPLIERS.length - 1];
  for (const candidate of NICE_MULTIPLIERS) {
    if (residual <= candidate) {
      niceMultiplier = candidate;
      break;
    }
  }

  // Integer ticks only — never use a fractional step for count axes
  const step = Math.max(niceMultiplier * magnitude, 1);
  const niceMax = Math.ceil(safeMax / step) * step;
  const ticks = Array.from({ length: Math.round(niceMax / step) + 1 }, (_, i) => i * step);

  return { domain: [0, niceMax], ticks };
}
