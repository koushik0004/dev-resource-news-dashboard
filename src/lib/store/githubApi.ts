// src/lib/store/githubApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define the interface for a single GitHub repository
export interface GithubRepo {
  id: number;
  name: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
  html_url: string;
}

// Define the shape of the API response for the search query
interface GithubSearchResponse {
  items: GithubRepo[];
}

// Create the API service
export const githubApi = createApi({
  reducerPath: 'githubApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://api.github.com/' }),
  endpoints: (builder) => ({
    getTrendingRepos: builder.query<GithubSearchResponse, void>({
      query: () => 'search/repositories?q=stars:>1&sort=stars&order=desc&per_page=10',
    }),
  }),
});

// Export hooks for usage in components
export const { useGetTrendingReposQuery } = githubApi;
