import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { HackerNewsTab } from '../HackerNewsTab';
import { StorySkeleton } from '../StorySkeleton';
import { ApiErrorFallback } from '../../ApiErrorFallback';
import { StoryRow } from '../StoryRow';

// Mock child components
jest.mock('../StorySkeleton', () => ({
  StorySkeleton: () => <div data-testid="story-skeleton">Loading Stories...</div>,
}));
jest.mock('../../ApiErrorFallback', () => ({
  ApiErrorFallback: ({ error }: any) => <div data-testid="api-error-fallback">Error: {error.message}</div>,
}));
jest.mock('../StoryRow', () => ({
  StoryRow: ({ id, searchQuery }: { id: number; searchQuery: string }) => (
    <tr data-testid={`story-row-${id}`}>
      <td>Story {id}</td>
      <td>Author {id}</td>
      <td>Score {id}</td>
    </tr>
  ),
}));

const mockStoryIds = [1, 2, 3];

describe('HackerNewsTab', () => {
  it('renders StorySkeleton when loading', () => {
    render(<HackerNewsTab storyIds={[]} isLoading={true} error={undefined} searchQuery="" />);
    expect(screen.getByTestId('story-skeleton')).toBeInTheDocument();
  });

  it('renders ApiErrorFallback when there is an error', () => {
    const mockError = { status: 500, message: 'HN Error' };
    render(<HackerNewsTab storyIds={[]} isLoading={false} error={mockError} searchQuery="" />);
    expect(screen.getByTestId('api-error-fallback')).toBeInTheDocument();
    expect(screen.getByText('Error: HN Error')).toBeInTheDocument();
  });

  it('renders story rows correctly when not loading and no error', () => {
    render(<HackerNewsTab storyIds={mockStoryIds} isLoading={false} error={undefined} searchQuery="test" />);
    expect(screen.getByText('Top Stories')).toBeInTheDocument();
    
    const tableBody = screen.getByRole('rowgroup'); // This typically targets tbody
    expect(within(tableBody).getByTestId('story-row-1')).toBeInTheDocument();
    expect(within(tableBody).getByText('Story 1')).toBeInTheDocument();
    expect(within(tableBody).getByText('Author 1')).toBeInTheDocument();
    expect(within(tableBody).getByText('Score 1')).toBeInTheDocument();

    expect(within(tableBody).getByTestId('story-row-2')).toBeInTheDocument();
    expect(within(tableBody).getByTestId('story-row-3')).toBeInTheDocument();
  });
});
