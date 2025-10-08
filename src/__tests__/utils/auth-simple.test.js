import { isAuthenticated, requireAuth } from '../../utils/auth.js';

// Mock the logout function to avoid JSDOM navigation issues
jest.mock('../../utils/auth.js', () => ({
  ...jest.requireActual('../../utils/auth.js'),
  logout: jest.fn()
}));

describe('Auth Utilities - Core Functions', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('isAuthenticated', () => {
    test('returns true when token exists in localStorage', () => {
      localStorage.setItem('token', 'mock-token');
      expect(isAuthenticated()).toBe(true);
    });

    test('returns false when token does not exist in localStorage', () => {
      expect(isAuthenticated()).toBe(false);
    });

    test('returns false when token is empty string', () => {
      localStorage.setItem('token', '');
      expect(isAuthenticated()).toBe(false);
    });

    test('returns false when token is null', () => {
      localStorage.removeItem('token'); // Ensure no token exists
      expect(isAuthenticated()).toBe(false);
    });
  });

  describe('requireAuth', () => {
    // Mock window.location for this specific test suite
    const mockLocation = {
      href: 'http://localhost/'
    };
    
    beforeEach(() => {
      delete window.location;
      window.location = mockLocation;
    });

    test('returns true when user is authenticated', () => {
      localStorage.setItem('token', 'valid-token');
      expect(requireAuth()).toBe(true);
    });

    test('redirects to home and returns false when user is not authenticated', () => {
      localStorage.removeItem('token');
      const result = requireAuth();
      expect(result).toBe(false);
      expect(window.location.href).toBe('http://localhost/');
    });

    test('does not redirect when user is authenticated', () => {
      localStorage.setItem('token', 'valid-token');
      const originalHref = window.location.href;
      requireAuth();
      expect(window.location.href).toBe(originalHref);
    });
  });

  describe('localStorage operations', () => {
    test('can set and get tokens from localStorage', () => {
      const testToken = 'test-token-123';
      localStorage.setItem('token', testToken);
      expect(localStorage.getItem('token')).toBe(testToken);
    });

    test('can remove tokens from localStorage', () => {
      localStorage.setItem('token', 'test-token');
      localStorage.removeItem('token');
      expect(localStorage.getItem('token')).toBe(null);
    });

    test('can clear localStorage completely', () => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', 'test-user');
      localStorage.clear();
      expect(localStorage.getItem('token')).toBe(null);
      expect(localStorage.getItem('user')).toBe(null);
    });
  });
});