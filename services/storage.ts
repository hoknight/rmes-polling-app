import { STORAGE_KEY } from '../constants';
import { Vote, VoteCount } from '../types';

const DEFAULT_OPTIONS = [
  "滿足所有持分者需要",
  "全體參與",
  "凝聚全校共識",
  "清晰的教學目標",
  "協同效應",
  "可見的教學成效",
  "整合內化",
  "與天主聖神一起工作"
];

const DEFAULT_TITLE = "目標與策略";
const DEFAULT_PASSWORD = "admin123";

export interface AppConfig {
  enableMultiSelect: boolean;
  maxSelections: number;
}

const DEFAULT_CONFIG: AppConfig = {
  enableMultiSelect: false,
  maxSelections: 3
};

export const getTitle = (): string => {
  return localStorage.getItem('app_title') || DEFAULT_TITLE;
};

export const saveTitle = (title: string) => {
  localStorage.setItem('app_title', title);
};

export const getPassword = (): string => {
  return localStorage.getItem('admin_password') || DEFAULT_PASSWORD;
};

export const savePassword = (password: string) => {
  localStorage.setItem('admin_password', password);
};

export const getAppConfig = (): AppConfig => {
  const stored = localStorage.getItem('app_config');
  if (stored) {
    try {
      return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
    } catch (e) {
      console.error("Failed to parse config", e);
    }
  }
  return DEFAULT_CONFIG;
};

export const saveAppConfig = (config: AppConfig) => {
  localStorage.setItem('app_config', JSON.stringify(config));
};

export const getOptions = (): string[] => {
  const stored = localStorage.getItem('app_options');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse options", e);
    }
  }
  return DEFAULT_OPTIONS;
};

export const saveOptions = (options: string[]) => {
  localStorage.setItem('app_options', JSON.stringify(options));
};

export const getVotes = (): Vote[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as Vote[];
  } catch (e) {
    console.error("Failed to parse votes", e);
    return [];
  }
};

export const saveVote = (optionOrOptions: string | string[]): void => {
  const votes = getVotes();
  const timestamp = new Date().toISOString();
  
  if (Array.isArray(optionOrOptions)) {
    optionOrOptions.forEach(option => {
      votes.push({ option, timestamp });
    });
  } else {
    votes.push({ option: optionOrOptions, timestamp });
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(votes));
};

export const clearVotes = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

export const getVoteStats = (): VoteCount[] => {
  const votes = getVotes();
  const options = getOptions();
  
  // Initialize counts with 0 for all current options
  const counts: Record<string, number> = {};
  options.forEach(opt => counts[opt] = 0);

  votes.forEach(vote => {
    // Only count votes for currently valid options
    if (counts[vote.option] !== undefined) {
      counts[vote.option]++;
    } 
  });

  return Object.entries(counts).map(([name, value]) => ({
    name,
    value
  }));
};

export const getTotalVotes = (): number => {
  return getVotes().length;
};