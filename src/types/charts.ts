// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

export type BarChartView = 'stacked' | 'multiple';
export type BarChartValueMode = 'count' | 'percent';

export type CategorySeries = {
  name: string;
  label: string;
  color: string;
};

export type CategoriesChartDatum = {
  date: string;
  [key: string]: number | string;
};

export type MetricsBarChartProps = {
  title?: string;
  data: CategoriesChartDatum[];
  series: CategorySeries[];
  view: BarChartView;
  onViewChange?: (view: BarChartView) => void;
  valueMode?: BarChartValueMode;
  onValueModeChange?: (mode: BarChartValueMode) => void;
  height?: number;
  yDomain?: [number, number];
  stackedBarSize?: number;
  multipleBarSize?: number;
  showLegend?: boolean;
  showToggle?: boolean;
  showValueToggle?: boolean;
};
