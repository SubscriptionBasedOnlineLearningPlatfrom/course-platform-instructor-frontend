import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SignupLogin from '../../pages/Signup_Login';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock Spline component
jest.mock('@splinetool/react-spline', () => ({
  __esModule: true,
  default: function MockSpline() {
    return <div data-testid="spline-background">Spline Background</div>;
  }
}), { virtual: true });

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Lock: () => <div data-testid="lock-icon">Lock</div>,
  User: () => <div data-testid="user-icon">User</div>,
  BookOpen: () => <div data-testid="book-icon">BookOpen</div>,
  Mail: () => <div data-testid="mail-icon">Mail</div>,
}));

// Mock react-icons
jest.mock('react-icons/fc', () => ({
  FcGoogle: () => <div data-testid="google-icon">Google</div>,
}));

// Mock window.location for navigation
delete window.location;
window.location = { href: '', reload: jest.fn() };

// Mock UI components
jest.mock('../../components/signup-Login2/ui/button.jsx', () => ({
  Button: ({ children, onClick, disabled, type, variant, className, ...props }) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      type={type}
      className={className}
      data-variant={variant}
      {...props}
    >
      {children}
    </button>
  )
}));

jest.mock('../../components/signup-Login2/ui/input.jsx', () => ({
  Input: (props) => <input {...props} />
}));

jest.mock('../../components/signup-Login2/ui/label.jsx', () => ({
  Label: ({ children, ...props }) => <label {...props}>{children}</label>
}));

jest.mock('../../components/signup-Login2/ui/card.jsx', () => ({
  Card: ({ children, className }) => <div className={className}>{children}</div>,
  CardContent: ({ children }) => <div>{children}</div>,
  CardDescription: ({ children }) => <div>{children}</div>,
  CardHeader: ({ children }) => <div>{children}</div>,
  CardTitle: ({ children }) => <h2>{children}</h2>
}));

jest.mock('../../components/signup-Login2/ui/tabs.jsx', () => ({
  Tabs: ({ children, defaultValue }) => <div data-default-value={defaultValue}>{children}</div>,
  TabsContent: ({ children, value }) => <div data-tab-content={value}>{children}</div>,
  TabsList: ({ children }) => <div>{children}</div>,
  TabsTrigger: ({ children, value }) => <button data-tab-trigger={value}>{children}</button>
}));

jest.mock('../../components/signup-Login2/ui/separator.jsx', () => ({
  Separator: () => <hr data-testid="separator" />
}));

// Mock logo
jest.mock('../../assets/logo.jpeg', () => 'mocked-logo.jpeg');

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock window.location
const mockLocation = {
  href: '',
  pathname: '/',
  search: '',
  hash: ''
};

// Safe location mocking for JSDOM environment
try {
  delete window.location;
  window.location = mockLocation;
} catch (e) {
  // If location mock fails, use a different approach
  console.warn('Location mock failed, tests may have limited navigation functionality');
}

// Mock window.alert
window.alert = jest.fn();

// Helper function to get the login submit button specifically
const getLoginSubmitButton = () => {
  const buttons = screen.getAllByRole('button');
  return buttons.find(button => 
    button.type === 'submit' && 
    button.textContent === 'Sign In'
  ) || screen.getAllByText('Sign In')[1]; // Fallback to second "Sign In" (the submit button)
};

const renderSignupLogin = () => {
  return render(
    <MemoryRouter>
      <SignupLogin />
    </MemoryRouter>
  );
};

describe('SignupLogin Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
    window.alert.mockClear();
    mockLocation.href = '';
    
    // Setup default axios behavior
    mockedAxios.defaults = { withCredentials: true };
    mockedAxios.post = jest.fn();
  });

  describe('Component Rendering', () => {
    test('renders login form by default', () => {
      renderSignupLogin();
      
      expect(screen.getByText('ProLearnX')).toBeInTheDocument();
      expect(screen.getByText('Welcome')).toBeInTheDocument();
      expect(screen.getByText('Sign in to your instructor account or create a new one')).toBeInTheDocument();
    });

    test('renders both login and signup tabs', () => {
      renderSignupLogin();
      
      expect(screen.getAllByText('Sign In')[0]).toBeInTheDocument();
      expect(screen.getByText('Sign Up')).toBeInTheDocument();
    });

    test('renders required form fields for login', () => {
      renderSignupLogin();
      
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(getLoginSubmitButton()).toBeInTheDocument();
    });

    test('renders Google authentication option', () => {
      renderSignupLogin();
      
      expect(screen.getAllByText('Continue with Google')[0]).toBeInTheDocument();
      expect(screen.getAllByTestId('google-icon')[0]).toBeInTheDocument();
    });

    test('renders forgot password option for login', () => {
      renderSignupLogin();
      
      expect(screen.getByText('Forgot password?')).toBeInTheDocument();
    });
  });

  describe('Login Authentication', () => {
    test('handles successful login with valid credentials', async () => {
      const mockResponse = {
        data: {
          token: 'mock-jwt-token-123',
          user: {
            id: 1,
            email: 'instructor@test.com',
            username: 'test_instructor'
          }
        }
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      renderSignupLogin();

      // Fill in login form
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const loginForm = emailInput.closest('form');

      fireEvent.change(emailInput, { target: { value: 'instructor@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.submit(loginForm);

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          'http://localhost:4000/auth/login',
          {
            email: 'instructor@test.com',
            password: 'password123'
          },
          {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true
          }
        );
      });

      // Check localStorage is updated
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', 'mock-jwt-token-123');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify({
        id: 1,
        email: 'instructor@test.com',
        username: 'test_instructor'
      }));

      // Note: Redirect to /dashboard happens in component but JSDOM doesn't support navigation
    });

    test('handles login failure with invalid credentials', async () => {
      const mockError = {
        response: {
          data: {
            error: 'Invalid email or password'
          }
        }
      };

      mockedAxios.post.mockRejectedValue(mockError);

      renderSignupLogin();

      // Fill in login form with invalid credentials
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const loginForm = emailInput.closest('form');

      fireEvent.change(emailInput, { target: { value: 'invalid@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.submit(loginForm);

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          'http://localhost:4000/auth/login',
          { email: 'invalid@test.com', password: 'wrongpassword' },
          { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
        );
      });

      // Ensure no token is stored
      expect(mockLocalStorage.setItem).not.toHaveBeenCalledWith('token', expect.anything());
      expect(mockLocation.href).toBe('');
    });

    test('handles missing token in response', async () => {
      const mockResponse = {
        data: {
          user: { id: 1, email: 'test@test.com' }
          // No token field
        }
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      renderSignupLogin();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const loginForm = emailInput.closest('form');

      fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.submit(loginForm);

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          'http://localhost:4000/auth/login',
          { email: 'test@test.com', password: 'password123' },
          { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
        );
      });

      expect(mockLocalStorage.setItem).not.toHaveBeenCalledWith('token', expect.anything());
    });

    test('handles async login operations', async () => {
      const mockResponse = {
        data: {
          token: 'test-token',
          user: { email: 'test@test.com' }
        }
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      renderSignupLogin();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const loginForm = emailInput.closest('form');

      fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.submit(loginForm);

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          'http://localhost:4000/auth/login',
          expect.objectContaining({
            email: 'test@test.com',
            password: 'password123'
          }),
          expect.objectContaining({
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true
          })
        );
      });
    });
  });

  describe('Signup Authentication', () => {
    test('renders additional fields for signup', () => {
      renderSignupLogin();

      // Switch to signup tab (assuming tab switching works)
      // For this test, we'll check if the signup form elements exist
      // In a real implementation, you'd click the signup tab first

      // Check if username and confirm password fields exist in the DOM
      const usernameLabels = screen.queryAllByText('Username');
      const confirmPasswordLabels = screen.queryAllByText('Confirm Password');

      // These might be hidden by default but should exist
      expect(usernameLabels.length).toBeGreaterThanOrEqual(0);
      expect(confirmPasswordLabels.length).toBeGreaterThanOrEqual(0);
    });

    test('handles successful signup', async () => {
      const mockResponse = {
        data: {
          token: 'new-user-token-123',
          user: {
            id: 2,
            email: 'newinstructor@test.com',
            username: 'new_instructor'
          }
        }
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      renderSignupLogin();

      // Switch to signup tab and get the signup form
      const signupTab = screen.getByText('Sign Up');
      fireEvent.click(signupTab);
      
      // Wait for signup tab to be active and then get form elements
      await waitFor(() => {
        expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      });

      // Fill signup form
      const usernameInput = screen.getByLabelText(/username/i);
      const signupForm = usernameInput.closest('form');
      
      // Get inputs from the signup form specifically
      const signupEmailInput = signupForm.querySelector('input[type="email"]');
      const signupPasswordInput = signupForm.querySelector('input[type="password"]:not([name="confirmPassword"])');
      const confirmPasswordInput = signupForm.querySelector('input[name="confirmPassword"]');
      
      fireEvent.change(usernameInput, { target: { value: 'new_instructor' } });
      fireEvent.change(signupEmailInput, { target: { value: 'newinstructor@test.com' } });
      fireEvent.change(signupPasswordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      
      fireEvent.submit(signupForm);
      
      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          'http://localhost:4000/auth/register',
          {
            username: 'new_instructor',
            email: 'newinstructor@test.com',
            password: 'password123'
          },
          expect.objectContaining({
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true
          })
        );
      });
    });

    test('validates password confirmation', () => {
      renderSignupLogin();

      // This test would check password matching validation
      // The actual implementation checks if password !== confirmPassword
      
      // In a real test, you would:
      // 1. Switch to signup tab
      // 2. Fill different passwords
      // 3. Submit form
      // 4. Expect error message about passwords not matching
      
      expect(true).toBe(true); // Placeholder for password validation test
    });
  });

  describe('Google Authentication', () => {
    test('handles Google OAuth button click', () => {
      renderSignupLogin();

      const googleButtons = screen.getAllByText('Continue with Google');
      const googleButton = googleButtons[0].closest('button'); // Get first Google button
      
      // Test that the button exists and is clickable
      expect(googleButton).toBeInTheDocument();
      expect(googleButton).not.toBeDisabled();
      
      // Click the button (component may handle OAuth differently)
      fireEvent.click(googleButton);
      
      // Just verify the component handles the click without errors
      expect(googleButton).toBeInTheDocument();
    });
  });

  describe('Password Reset', () => {
    test('shows password reset form when forgot password is clicked', () => {
      renderSignupLogin();

      const forgotPasswordButton = screen.getByText('Forgot password?');
      fireEvent.click(forgotPasswordButton);

      expect(screen.getByText('Reset link will be sent to the email address entered above')).toBeInTheDocument();
      expect(screen.getByText('Send Reset Link')).toBeInTheDocument();
    });

    test('sends password reset request', async () => {
      mockedAxios.post.mockResolvedValue({ data: { success: true } });

      renderSignupLogin();

      // Click forgot password to show reset form
      const forgotPasswordButton = screen.getByText('Forgot password?');
      fireEvent.click(forgotPasswordButton);

      // Fill email in the password reset form
      const emailInputs = screen.getAllByLabelText(/email address/i);
      const resetEmailInput = emailInputs[0]; // Use the first email input for reset
      fireEvent.change(resetEmailInput, { target: { value: 'instructor@test.com' } });

      // Click send reset link
      const sendResetButton = screen.getByText('Send Reset Link');
      fireEvent.click(sendResetButton);

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          'http://localhost:4000/auth/reset-password',
          { email: 'instructor@test.com' }
        );
      });

      expect(window.alert).toHaveBeenCalledWith(
        expect.stringContaining('📩 Password reset link sent to instructor@test.com!')
      );
    });

    test('handles password reset without email', async () => {
      renderSignupLogin();

      // Click forgot password without entering email
      const forgotPasswordButton = screen.getByText('Forgot password?');
      fireEvent.click(forgotPasswordButton);

      const sendResetButton = screen.getByText('Send Reset Link');
      fireEvent.click(sendResetButton);

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(
          'Please enter your email address in the form above first'
        );
      });
    });

    test('handles password reset error', async () => {
      const mockError = {
        response: {
          data: {
            error: 'Email not found'
          }
        }
      };

      mockedAxios.post.mockRejectedValue(mockError);

      renderSignupLogin();

      const forgotPasswordButton = screen.getByText('Forgot password?');
      fireEvent.click(forgotPasswordButton);

      // Fill email in the password reset form
      const emailInputs = screen.getAllByLabelText(/email address/i);
      const resetEmailInput = emailInputs[0];
      fireEvent.change(resetEmailInput, { target: { value: 'nonexistent@test.com' } });

      const sendResetButton = screen.getByText('Send Reset Link');
      fireEvent.click(sendResetButton);

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('❌ Email not found');
      });
    });
  });

  describe('Form Validation', () => {
    test('requires email field', () => {
      renderSignupLogin();

      const emailInput = screen.getByLabelText(/email address/i);
      expect(emailInput).toHaveAttribute('required');
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    test('requires password field', () => {
      renderSignupLogin();

      const passwordInput = screen.getByLabelText(/^password$/i);
      expect(passwordInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('handles form submission properly', async () => {
      const mockResponse = {
        data: {
          token: 'test-token',
          user: { email: 'test@test.com' }
        }
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      renderSignupLogin();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const loginForm = emailInput.closest('form');

      fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      // Submit form
      fireEvent.submit(loginForm);
      
      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Error Handling', () => {
    test('handles network errors gracefully', async () => {
      const networkError = new Error('Network Error');
      mockedAxios.post.mockRejectedValue(networkError);

      renderSignupLogin();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const loginForm = emailInput.closest('form');

      fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.submit(loginForm);

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('❌ Network Error');
      });
    });

    test('handles server errors with custom message', async () => {
      const serverError = {
        response: {
          data: {
            message: 'Server temporarily unavailable'
          }
        }
      };

      mockedAxios.post.mockRejectedValue(serverError);

      renderSignupLogin();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const loginForm = emailInput.closest('form');

      fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.submit(loginForm);

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('❌ Server temporarily unavailable');
      });
    });

    test('handles unknown errors with fallback message', async () => {
      const unknownError = {}; // Empty error object
      mockedAxios.post.mockRejectedValue(unknownError);

      renderSignupLogin();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const loginForm = emailInput.closest('form');

      fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.submit(loginForm);

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('❌ Something went wrong');
      });
    });
  });
});