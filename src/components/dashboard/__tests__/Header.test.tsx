import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from '../Header';

describe('Header', () => {
  it('renders the correct title', () => {
    render(<Header />);
    expect(screen.getByText('Developer Resource Dashboard')).toBeInTheDocument();
  });
});
