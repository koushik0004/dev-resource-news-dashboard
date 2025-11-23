import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { GithubTab } from '../GithubTab';
import { RepoSkeleton } from '../RepoSkeleton';
import { ApiErrorFallback } from '../../ApiErrorFallback';
import { ResourceDetailDialog } from '../../ResourceDetailDialog';

// Mock child components
jest.mock('../RepoSkeleton', () => ({
  RepoSkeleton: () => <div data-testid="repo-skeleton">Loading Repos...</div>,
}));
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

const mockRepos = [
  { id: 1, name: 'repo-1', description: 'Description 1', stargazers_count: 100, language: 'TypeScript', html_url: 'url-1' },
  { id: 2, name: 'repo-2', description: 'Description 2', stargazers_count: 200, language: 'JavaScript', html_url: 'url-2' },
];

describe('GithubTab', () => {
  it('renders RepoSkeleton when loading', () => {
    render(<GithubTab repos={[]} isLoading={true} error={undefined} />);
    expect(screen.getByTestId('repo-skeleton')).toBeInTheDocument();
  });

  it('renders ApiErrorFallback when there is an error', () => {
    const mockError = { status: 500, message: 'Server Error' };
    render(<GithubTab repos={[]} isLoading={false} error={mockError} />);
    expect(screen.getByTestId('api-error-fallback')).toBeInTheDocument();
    expect(screen.getByText('Error: Server Error')).toBeInTheDocument();
  });

  it('renders repo data correctly when not loading and no error', () => {
    render(<GithubTab repos={mockRepos} isLoading={false} error={undefined} />);
    expect(screen.getByText('Trending Repositories')).toBeInTheDocument();
    
    // Use within to scope the search to the table body
    const tableBody = screen.getByRole('rowgroup'); // This typically targets tbody
    expect(within(tableBody).getByText('repo-1')).toBeInTheDocument();
    expect(within(tableBody).getByText('Description 1')).toBeInTheDocument();
    expect(within(tableBody).getByText('100')).toBeInTheDocument();
    expect(within(tableBody).getByText('TypeScript')).toBeInTheDocument();
    expect(within(tableBody).getByText('repo-2')).toBeInTheDocument();
    expect(within(tableBody).getByText('Description 2')).toBeInTheDocument();
    expect(within(tableBody).getByText('200')).toBeInTheDocument();
    expect(within(tableBody).getByText('JavaScript')).toBeInTheDocument();
  });

  it('opens ResourceDetailDialog with correct data when "View" is clicked', () => {
    render(<GithubTab repos={mockRepos} isLoading={false} error={undefined} />);
    
    const viewButtons = screen.getAllByRole('button', { name: 'View' });
    fireEvent.click(viewButtons[0]);

    const dialog = screen.getByTestId('resource-detail-dialog');
    expect(dialog).toHaveStyle('display: block');
    expect(within(dialog).getByText('repo-1')).toBeInTheDocument();
    expect(within(dialog).getByText('Description 1')).toBeInTheDocument();
    expect(within(dialog).getByText('url-1')).toBeInTheDocument();
  });

  it('closes ResourceDetailDialog when close button is clicked', () => {
    render(<GithubTab repos={mockRepos} isLoading={false} error={undefined} />);
    
    const viewButtons = screen.getAllByRole('button', { name: 'View' });
    fireEvent.click(viewButtons[0]);

    const dialog = screen.getByTestId('resource-detail-dialog');
    expect(dialog).toHaveStyle('display: block');
    
    fireEvent.click(within(dialog).getByRole('button', { name: 'Close' }));
    expect(dialog).toHaveStyle('display: none');
  });
});
