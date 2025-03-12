export interface Repository {
  name: string;
  url: string;
  stars: number;
  forks: number;
  lastUpdated: Date;
  score: number;
}

export interface RESPONSE_ITEMS {
  name: string;
  url: string;
  stargazerCount: number;
  forkCount: number;
  updatedAt: Date;
}


export interface GraphQLResponse<T> {
  data: {
    search: {
      nodes: T[];
      pageInfo: PageInfo;
    };
  };
  errors?: { message: string }[];
}

export interface PageInfo {
  endCursor: string | null;
  hasNextPage: boolean;
}