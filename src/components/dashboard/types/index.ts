export type TestStatus = 'passed' | 'failed' | 'runs';

export interface TestStat {
  label: string;
  value: number;
  status: TestStatus;
  icon: React.ElementType;
  color: string;
}

export interface TestDescriptionData {
  title: string;
  stats: TestStat[];
  totalRuns: number;
  passRate: number;
  passRateDelta: number;
}

export interface TestDescriptionProps {
  data?: TestDescriptionData;
  isGrid?: boolean;
}
