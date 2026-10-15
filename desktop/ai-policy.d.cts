export interface ExplainRequest {
  problem: string;
  answer: string;
  verified: string;
  evidence: Array<{ source: string; text: string }>;
}
export function validatePrompt(value: unknown): ExplainRequest;
export function buildPrompt(value: ExplainRequest): string;
export function isTrustedSender(
  url: string,
  sameWindow: boolean,
  mainFrame: boolean,
): boolean;

export function validateGenerated(text: string, count: number): string;
