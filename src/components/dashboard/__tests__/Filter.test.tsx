import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Filter from '../Filter';
import filterSlice, { setLanguageFilter, setSearchQuery } from '@/lib/store/filterSlice';
import { githubApi } from '@/lib/store/githubApi';
import { hackerNewsApi } from '@/lib/store/hackerNewsApi';

// Mock filterSlice actions
jest.mock('@/lib/store/filterSlice', () => ({
  setSearchQuery: jest.fn((payload) => ({ type: 'filter/setSearchQuery', payload })),
  setLanguageFilter: jest.fn((payload) => ({ type: 'filter/setLanguageFilter', payload })),
}));

// Create a mock store for testing
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

// Mock shadcn/ui Select components
// This mock is simplified to allow testing the onValueChange prop and text content.
jest.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <select data-testid="mock-select" value={value} onChange={(e) => onValueChange(e.target.value)}>
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: any) => <button data-testid="select-trigger">{children}</button>,
  SelectContent: ({ children }: any) => <div data-testid="select-content">{children}</div>,
  SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
  SelectValue: ({ placeholder }: any) => <span data-testid="select-value">{placeholder}</span>,
}));


const mockSetSearchQuery = setSearchQuery as jest.Mock;
const mockSetLanguageFilter = setLanguageFilter as jest.Mock;

describe('Filter', () => {
  let store: ReturnType<typeof createMockStore>;

  beforeEach(() => {
    store = createMockStore();
    mockSetSearchQuery.mockClear();
    mockSetLanguageFilter.mockClear();
  });

  it('renders search input correctly', () => {
    render(
      <Provider store={store}>
        <Filter searchQuery="" activeTab="github" languageFilter="" languages={[]} />
      </Provider>
    );
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('dispatches setSearchQuery on search input change', async () => {
    render(
      <Provider store={store}>
        <Filter searchQuery="" activeTab="github" languageFilter="" languages={[]} />
      </Provider>
    );
    const searchInput = screen.getByPlaceholderText('Search...');
    await userEvent.type(searchInput, 'test query');
    expect(mockSetSearchQuery).toHaveBeenLastCalledWith('test query');
    // Verify that the dispatch was called with the action creator result
    // To properly test this, we need to spy on the store's dispatch method
    // For now, we are directly checking the action creator call.
  });

  it('renders language select when activeTab is github', () => {
    const languages = ['JavaScript', 'TypeScript'];
    render(
      <Provider store={store}>
        <Filter searchQuery="" activeTab="github" languageFilter="" languages={languages} />
      </Provider>
    );
    expect(screen.getByTestId('select-trigger')).toBeInTheDocument();
    expect(screen.getByText('Language')).toBeInTheDocument(); // Placeholder text
    expect(screen.getByRole('option', { name: 'JavaScript' })).toBeInTheDocument();
  });

  it('does not render language select when activeTab is not github', () => {
    const languages = ['JavaScript', 'TypeScript'];
    render(
      <Provider store={store}>
        <Filter searchQuery="" activeTab="hacker-news" languageFilter="" languages={languages} />
      </Provider>
    );
    expect(screen.queryByTestId('select-trigger')).not.toBeInTheDocument();
  });

  it('dispatches setLanguageFilter on language select change when activeTab is github', async () => {
    const languages = ['JavaScript', 'TypeScript'];
    render(
      <Provider store={store}>
        <Filter searchQuery="" activeTab="github" languageFilter="JavaScript" languages={languages} />
      </Provider>
    );
    
    // Simulate selection change on the mocked select element
    const selectElement = screen.getByTestId('mock-select');
    await userEvent.selectOptions(selectElement, 'TypeScript');

    expect(mockSetLanguageFilter).toHaveBeenCalledWith('TypeScript');
    // Verify that the dispatch was called with the action creator result
    // For now, we are directly checking the action creator call.
  });
});