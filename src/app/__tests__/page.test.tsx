import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import filterSlice from '@/lib/store/filterSlice';
import { githubApi } from '@/lib/store/githubApi';
import { hackerNewsApi } from '@/lib/store/hackerNewsApi';
import DashboardPage from '@/app/page';

// Mock the API hooks
jest.mock('@/lib/store/githubApi', () => ({
  ...jest.requireActual('@/lib/store/githubApi'),
  useGetTrendingReposQuery: () => ({
    data: [
      { id: 1, name: 'Repo 1', description: 'Description 1', stargazers_count: 100, language: 'TypeScript', html_url: '' },
      { id: 2, name: 'Repo 2', description: 'Description 2', stargazers_count: 200, language: 'JavaScript', html_url: '' },
    ],
    isLoading: false,
    error: null,
  }),
}));

jest.mock('@/lib/store/hackerNewsApi', () => ({
  ...jest.requireActual('@/lib/store/hackerNewsApi'),
  useGetTopStoryIdsQuery: () => ({
    data: [1, 2, 3],
    isLoading: false,
    error: null,
  }),
  useGetStoryDetailsQuery: (id: number) => ({
    data: { id, title: `Story ${id}`, by: 'author', score: 10 },
    isLoading: false,
    error: null,
  }),
}));

const createMockStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      [githubApi.reducerPath]: githubApi.reducer,
      [hackerNewsApi.reducerPath]: hackerNewsApi.reducer,
      filter: filterSlice,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(githubApi.middleware, hackerNewsApi.middleware),
    preloadedState,
  });
};

describe('DashboardPage', () => {
  let store: ReturnType<typeof createMockStore>;

  beforeEach(() => {
    store = createMockStore();
  });

  it('hides the language filter when switching to Hacker News tab', async () => {
    render(
      <Provider store={store}>
        <DashboardPage />
      </Provider>
    );

    // Initially, the language filter should be visible
    expect(screen.getByText('Language')).toBeInTheDocument();

    // Click on the Hacker News tab
    userEvent.click(screen.getByText('Hacker News'));

    // The language filter should now be hidden
    await waitFor(() => {
      expect(screen.queryByText('Language')).not.toBeInTheDocument();
    });
  });
});