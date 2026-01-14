export type Page = 'home' | 'success' | 'stats' | 'admin';

export interface Vote {
  option: string;
  timestamp: string;
}

export interface VoteCount {
  name: string;
  value: number;
}
