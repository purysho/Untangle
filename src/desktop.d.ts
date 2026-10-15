interface AIStatus {
  running: boolean;
  starting: boolean;
  message: string;
}
interface AIRequest {
  problem: string;
  answer: string;
  verified: string;
  evidence: Array<{ source: string; text: string }>;
}
interface Window {
  untangleAI?: {
    status: () => Promise<AIStatus>;
    start: () => Promise<AIStatus>;
    stop: () => Promise<AIStatus>;
    explain: (request: AIRequest) => Promise<string>;
  };
}
declare module "*?url" {
  const url: string;
  export default url;
}
