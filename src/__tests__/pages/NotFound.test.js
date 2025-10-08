import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotFound from '../../pages/NotFound';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderNotFound = () => {
  return render(
    <MemoryRouter>
      <NotFound />
    </MemoryRouter>
  );
};

describe('NotFound Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
  });

  test('renders 404 error message', () => {
    renderNotFound();
    
    expect(screen.getByText(/404/)).toBeInTheDocument();
    expect(screen.getByText(/Page Not Found/i)).toBeInTheDocument();
  });

  test('displays helpful message to user', () => {
    renderNotFound();
    
    // Should provide some guidance to the user
    expect(screen.getByText(/not found/i) || screen.getByText(/doesn't exist/i)).toBeInTheDocument();
  });

  test('provides navigation back to home or dashboard', () => {
    renderNotFound();
    
    // Should have some way for users to navigate back
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });

  test('renders without crashing', () => {
    expect(() => renderNotFound()).not.toThrow();
  });

  test('has proper page structure', () => {
    renderNotFound();
    
    // Should have a main content container
    const container = screen.getByText(/404/i).closest('div');
    expect(container).toBeInTheDocument();
  });
});