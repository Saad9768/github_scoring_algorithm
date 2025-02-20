export interface Repository {
  name: string;
  stars: number;
  forks: number;
  lastUpdated: Date;
  score: number;
}

export interface API_RESPONSE {
  total_count: number;
  incomplete_results: number;
  items: ITEMS[];
}

export interface ITEMS {
  name: string;
  stargazers_count: number;
  forks_count: number;
  updated_at: Date;
}
