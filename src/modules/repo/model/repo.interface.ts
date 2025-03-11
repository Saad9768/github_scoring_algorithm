export interface Repository {
  name: string;
  url: string;
  stars: number;
  forks: number;
  lastUpdated: Date;
  score: number;
}

export interface API_RESPONSE {
  total_count: number;
  incomplete_results: boolean;
  items: ITEMS[];
}

export interface ITEMS {
  name: string;
  url: string;
  stargazers_count: number;
  forks_count: number;
  updated_at: Date;
}

export interface PagingResponse<T> {
  inCompleteResult: boolean,
  totalPages: number;
  totalElementsInPage: number;
  totalElements: number;
  items: T[];
}

