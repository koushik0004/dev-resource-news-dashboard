import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { StoryRow } from '../StoryRow';
import { useGetStoryDetailsQuery } from '@/lib/store/hackerNewsApi';
import { ApiErrorFallback } from '../../ApiErrorFallback';
import { ResourceDetailDialog } from '../../ResourceDetailDialog';

// Mock the API hook
jest.mock('@/lib/store/hackerNewsApi', () => ({
  useGetStoryDetailsQuery: jest.fn(),
}));

// Mock child components
jest.mock('../../ApiErrorFallback', () => ({
  ApiErrorFallback: ({ error }: any) => <div data-testid="api-error-fallback">Error: {error.message}</div>,
}));
jest.mock('../../ResourceDetailDialog', () => ({
  ResourceDetailDialog: ({ open, onClose, title, description, url }: any) => (
    <div data-testid="resource-detail-dialog" style={{ display: open ? 'block' : 'none' }}>
      <h2>{title}</h2>
      <p>{description}</p>
      <a href={url}>{url}</a>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

const mockUseGetStoryDetailsQuery = useGetStoryDetailsQuery as jest.Mock;

describe('StoryRow', () => {
  const defaultStory = {
    id: 1,
    title: 'Test Story Title',
    by: 'testauthor',
    score: 100,
    url: 'http://test.url',
  };

  beforeEach(() => {
    mockUseGetStoryDetailsQuery.mockClear();
  });

  it('renders null when loading', () => {
    mockUseGetStoryDetailsQuery.mockReturnValue({ data: undefined, isLoading: true, error: undefined });
    const { container } = render(<table><tbody><StoryRow id={1} searchQuery="" /></tbody></table>);
    expect(container.querySelector('tr')).toBeNull();
  });

  it('renders ApiErrorFallback when there is an error', () => {
    const mockError = { status: 500, message: 'HN Story Error' };
    mockUseGetStoryDetailsQuery.mockReturnValue({ data: undefined, isLoading: false, error: mockError });
    render(<table><tbody><StoryRow id={1} searchQuery="" /></tbody></table>);
    expect(screen.getByTestId('api-error-fallback')).toBeInTheDocument();
    expect(screen.getByText('Error: HN Story Error')).toBeInTheDocument();
  });

  it('renders story details correctly when data is available', async () => {
    mockUseGetStoryDetailsQuery.mockReturnValue({ data: defaultStory, isLoading: false, error: undefined });
    render(<table><tbody><StoryRow id={1} searchQuery="" /></tbody></table>);

    await waitFor(() => {
      const row = screen.getByRole('row');
      expect(within(row).getByText(defaultStory.title)).toBeInTheDocument();
      expect(within(row).getByText(defaultStory.by)).toBeInTheDocument();
      expect(within(row).getByText(defaultStory.score.toString())).toBeInTheDocument();
      expect(within(row).getByRole('button', { name: 'View' })).toBeInTheDocument();
    });
  });

  it('does not render if searchQuery does not match story title', async () => {
    mockUseGetStoryDetailsQuery.mockReturnValue({ data: defaultStory, isLoading: false, error: undefined });
    const { container } = render(<table><tbody><StoryRow id={1} searchQuery="non-matching query" /></tbody></table>);

    await waitFor(() => {
      expect(container.querySelector('tr')).toBeNull();
    });
  });

  it('renders if searchQuery matches story title (case-insensitive)', async () => {
    mockUseGetStoryDetailsQuery.mockReturnValue({ data: defaultStory, isLoading: false, error: undefined });
    render(<table><tbody><StoryRow id={1} searchQuery="story" /></tbody></table>);

    await waitFor(() => {
      const row = screen.getByRole('row');
      expect(within(row).getByText(defaultStory.title)).toBeInTheDocument();
    });
  });

  it('opens ResourceDetailDialog with correct data when "View" is clicked', async () => {
    mockUseGetStoryDetailsQuery.mockReturnValue({ data: defaultStory, isLoading: false, error: undefined });
    render(<table><tbody><StoryRow id={1} searchQuery="" /></tbody></table>);

    await waitFor(() => {
      const row = screen.getByRole('row');
      fireEvent.click(within(row).getByRole('button', { name: 'View' }));
    });

    const dialog = screen.getByTestId('resource-detail-dialog');
    expect(dialog).toHaveStyle('display: block');
    expect(within(dialog).getByText(defaultStory.title)).toBeInTheDocument();
    expect(within(dialog).getByText(`Author: ${defaultStory.by}, Score: ${defaultStory.score}`)).toBeInTheDocument();
    expect(within(dialog).getByText(defaultStory.url)).toBeInTheDocument();
  });

  it('closes ResourceDetailDialog when close button is clicked', async () => {
    mockUseGetStoryDetailsQuery.mockReturnValue({ data: defaultStory, isLoading: false, error: undefined });
    render(<table><tbody><StoryRow id={1} searchQuery="" /></tbody></table>);

    await waitFor(() => {
      const row = screen.getByRole('row');
      fireEvent.click(within(row).getByRole('button', { name: 'View' }));
    });
    
    const dialog = screen.getByTestId('resource-detail-dialog');
    expect(dialog).toHaveStyle('display: block');

    fireEvent.click(within(dialog).getByRole('button', { name: 'Close' }));
    expect(dialog).toHaveStyle('display: none');
  });

  it('displays "No URL" button if story has no URL', async () => {
    const storyWithoutUrl = { ...defaultStory, url: undefined };
    mockUseGetStoryDetailsQuery.mockReturnValue({ data: storyWithoutUrl, isLoading: false, error: undefined });
    render(<table><tbody><StoryRow id={1} searchQuery="" /></tbody></table>);

    await waitFor(() => {
      const row = screen.getByRole('row');
      expect(within(row).getByRole('button', { name: 'No URL' })).toBeInTheDocument();
      expect(within(row).getByRole('button', { name: 'No URL' })).toBeDisabled();
    });
  });
});
