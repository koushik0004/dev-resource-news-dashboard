import React from 'react';
import { render, screen } from '@testing-library/react';
import { RepoSkeleton } from '../RepoSkeleton';

// Mock the Skeleton component from shadcn/ui
jest.mock('@/components/ui/skeleton', () => ({
  Skeleton: (props: any) => <div data-testid="skeleton" {...props} />,
}));

describe('RepoSkeleton', () => {
  it('renders multiple skeleton loaders', () => {
    render(<RepoSkeleton />);
    // There is one Skeleton in CardHeader
    // There are 5 Skeletons in TableHeader (for TableHead)
    // There are 5 rows, each with 5 Skeletons in TableBody (for TableCell)
    // Total Skeletons: 1 + 5 + (5 * 5) = 31
    expect(screen.getAllByTestId('skeleton')).toHaveLength(31);
  });
});
