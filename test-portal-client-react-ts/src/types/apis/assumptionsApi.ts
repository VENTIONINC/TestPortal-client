export interface CreateAssumptionRequest {
  madeBy: 'user';
  score: number;
  isConfirmed: boolean;
  issueId: number;
  resultErrorId: number;
}

export interface ConfirmAssumptionRequest {
  id: number;
  madeBy: 'user';
  isConfirmed: boolean;
}
