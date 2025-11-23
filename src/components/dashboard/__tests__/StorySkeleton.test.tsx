import React from 'react';
import { render, screen } from '@testing-library/react';
import { StorySkeleton } from '../StorySkeleton';

// Mock the Skeleton component from shadcn/ui
jest.mock('@/components/ui/skeleton', () => ({
  Skeleton: (props: any) => <div data-testid="skeleton" {...props} />,
}));

describe('StorySkeleton', () => {
  it('renders multiple skeleton loaders', () => {
    render(<StorySkeleton />);
    // There is one Skeleton in CardHeader
    // There are 4 Skeletons in TableHeader (for TableHead)
    // There are 10 rows, each with 4 Skeletons in TableBody (for TableCell)
    // Total Skeletons: 1 + 4 + (10 * 4) = 45
    expect(screen.getAllByTestId('skeleton')).toHaveLength(45);
  });
});
