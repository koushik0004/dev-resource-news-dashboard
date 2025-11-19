import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface HNStory {
  id: number;
  title: string;
  url: string;
  by: string;
  score: number;
}

export const hackerNewsApi = createApi({
  reducerPath: 'hackerNewsApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://hacker-news.firebaseio.com/v0/' }),
  endpoints: (builder) => ({
    getTopStoryIds: builder.query<number[], void>({
      query: () => 'topstories.json',
    }),
    getStoryDetails: builder.query<HNStory, number>({
      query: (id) => `item/${id}.json`,
    }),
  }),
});

export const { useGetTopStoryIdsQuery, useGetStoryDetailsQuery } = hackerNewsApi;
