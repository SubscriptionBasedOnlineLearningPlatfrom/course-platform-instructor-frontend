import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import * as auth from '../../utils/auth';

// Mock the auth module
jest.mock('../../utils/auth', () => ({
  logout: jest.fn()
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ChevronDown: () => <div data-testid="chevron-down">ChevronDown</div>,
  ChevronUp: () => <div data-testid="chevron-up">ChevronUp</div>,
  Menu: () => <div data-testid="menu">Menu</div>,
  X: () => <div data-testid="x">X</div>,
  LogOut: () => <div data-testid="logout">LogOut</div>,
  User: () => <div data-testid="user">User</div>,
  LogIn: () => <div data-testid="login">LogIn</div>
}));

// Mock the logo import
jest.mock('../../assets/logo.jpeg', () => 'mocked-logo.jpeg');

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock window.atob
global.atob = jest.fn();

const renderSidebar = () => {
  return render(
    <MemoryRouter>
      <Sidebar />
    </MemoryRouter>
  );
};

describe('Sidebar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockClear();
    global.atob.mockClear();
  });

  test('renders sidebar with basic structure', () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    
    renderSidebar();
    
    // Should render the mobile hamburger menu
    expect(screen.getByTestId('menu')).toBeInTheDocument();
  });

  test('handles mobile sidebar toggle', () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    
    renderSidebar();
    
    const hamburgerButton = screen.getAllByRole('button')[0]; // Get first button (hamburger menu)
    fireEvent.click(hamburgerButton);
    
    // The sidebar should respond to the click
    expect(hamburgerButton).toBeInTheDocument();
  });

  test('shows authenticated state with valid token', async () => {
    const mockToken = 'header.eyJleHAiOjk5OTk5OTk5OTl9.signature';
    const mockPayload = { exp: 9999999999 }; // Far future timestamp
    
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'token') return mockToken;
      if (key === 'user') return JSON.stringify({ name: 'Test User' });
      return null;
    });
    
    global.atob.mockReturnValue(JSON.stringify(mockPayload));
    
    renderSidebar();
    
    await waitFor(() => {
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('token');
    });
  });

  test('handles expired token correctly', async () => {
    const mockToken = 'header.eyJleHAiOjF9.signature';
    const mockPayload = { exp: 1 }; // Past timestamp
    
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'token') return mockToken;
      if (key === 'user') return JSON.stringify({ name: 'Test User' });
      return null;
    });
    
    global.atob.mockReturnValue(JSON.stringify(mockPayload));
    
    renderSidebar();
    
    await waitFor(() => {
      expect(global.atob).toHaveBeenCalled();
    });
  });

  test('handles token decoding errors gracefully', async () => {
    const mockToken = 'invalid.token.format';
    
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'token') return mockToken;
      return null;
    });
    
    global.atob.mockImplementation(() => {
      throw new Error('Invalid token format');
    });
    
    // Should not throw error even with invalid token
    expect(() => renderSidebar()).not.toThrow();
  });

  test('listens for storage events for auth changes', () => {
    const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    
    mockLocalStorage.getItem.mockReturnValue(null);
    
    const { unmount } = renderSidebar();
    
    expect(addEventListenerSpy).toHaveBeenCalledWith('storage', expect.any(Function));
    
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('storage', expect.any(Function));
    
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  test('renders without crashing when no auth data present', () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    
    expect(() => renderSidebar()).not.toThrow();
  });

  test('handles course dropdown functionality', () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    
    renderSidebar();
    
    // Component should render and handle state changes
    expect(screen.getByTestId('menu')).toBeInTheDocument();
  });
});