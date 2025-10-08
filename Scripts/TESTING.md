# Jest Testing Guide for Instructor Frontend

## Overview
This guide covers the comprehensive Jest testing setup for the course platform instructor frontend application.

## Test Structure

```
src/
  __tests__/
    components/          # Component tests
    pages/              # Page component tests
    utils/              # Utility function tests
    services/           # API service tests
    integration/        # Integration tests
    utils/
      testUtils.js      # Test utilities and helpers
  setupTests.js         # Test configuration
```

## Running Tests

### Basic Commands
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests in CI mode
npm run test:ci
```

### Test-Specific Commands
```bash
# Run specific test file
npm test -- Sidebar.test.jsx

# Run tests matching pattern
npm test -- --testNamePattern="auth"

# Run tests for specific directory
npm test -- __tests__/components/

# Update snapshots
npm test -- --updateSnapshot
```

## Test Categories

### 1. Component Tests
Test individual React components for:
- Rendering correctly
- Handling props
- User interactions
- State changes
- Event handling

### 2. Integration Tests
Test component interactions:
- Authentication flows
- Navigation
- API integration
- Form submissions

### 3. Utility Tests
Test helper functions:
- Authentication utilities
- API helpers
- Data formatters

### 4. API Tests
Test service layer:
- API calls
- Error handling
- Response processing
- Authentication headers

## Testing Patterns

### Component Testing Pattern
```javascript
describe('ComponentName', () => {
  test('renders correctly', () => {
    // Test rendering
  });
  
  test('handles user interactions', () => {
    // Test user events
  });
  
  test('handles props correctly', () => {
    // Test prop handling
  });
});
```

### Async Testing Pattern
```javascript
test('handles async operations', async () => {
  // Setup
  const mockApi = jest.fn().mockResolvedValue(data);
  
  // Action
  render(<Component />);
  
  // Assertion
  await waitFor(() => {
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Mock Patterns
```javascript
// Mock modules
jest.mock('../services/api');

// Mock localStorage
beforeEach(() => {
  localStorage.clear();
});

// Mock fetch
global.fetch = jest.fn();
```

## Coverage Goals

- **Statements**: 70%
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%

## Best Practices

### 1. Test Organization
- One test file per component/module
- Group related tests with `describe`
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

### 2. Mocking Strategy
- Mock external dependencies
- Mock API calls
- Use real implementations for utilities when possible
- Mock browser APIs (localStorage, fetch, etc.)

### 3. Test Data
- Use factories for test data
- Keep test data minimal but realistic
- Use the test utilities provided

### 4. Assertions
- Test behavior, not implementation
- Use semantic queries (getByRole, getByLabelText)
- Test accessibility where applicable

## Common Test Scenarios

### Authentication Testing
```javascript
test('shows login form when not authenticated', () => {
  // Clear authentication
  localStorage.clear();
  
  render(<Component />);
  
  expect(screen.getByText('Login')).toBeInTheDocument();
});

test('shows dashboard when authenticated', () => {
  // Setup authentication
  setupAuthenticatedUser();
  
  render(<Component />);
  
  expect(screen.getByText('Dashboard')).toBeInTheDocument();
});
```

### Form Testing
```javascript
test('submits form with valid data', async () => {
  const user = userEvent.setup();
  const mockSubmit = jest.fn();
  
  render(<Form onSubmit={mockSubmit} />);
  
  await user.type(screen.getByLabelText('Name'), 'Test Name');
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  
  expect(mockSubmit).toHaveBeenCalledWith({
    name: 'Test Name'
  });
});
```

### API Testing
```javascript
test('handles API errors gracefully', async () => {
  const mockApi = jest.fn().mockRejectedValue(new Error('API Error'));
  
  render(<Component />);
  
  await waitFor(() => {
    expect(screen.getByText('Error loading data')).toBeInTheDocument();
  });
});
```

## Debugging Tests

### Common Issues
1. **Async operations**: Use `waitFor` or `findBy` queries
2. **Missing mocks**: Mock all external dependencies
3. **DOM queries**: Use appropriate query methods
4. **Cleanup**: Clear mocks and localStorage between tests

### Debug Commands
```bash
# Run single test with verbose output
npm test -- --verbose ComponentName.test.jsx

# Run tests with debug info
DEBUG=true npm test

# Run with coverage and open in browser
npm run test:coverage && open coverage/lcov-report/index.html
```

## Performance Tips

1. Use `screen` queries instead of container queries
2. Mock heavy dependencies
3. Use `beforeEach` for common setup
4. Group related tests in `describe` blocks
5. Use `test.only` for focused development

## Continuous Integration

The tests are configured to run in CI with:
- Coverage reporting
- Junit output
- No watch mode
- Fail on coverage below thresholds

## Example Test Files

See the `__tests__` directory for complete examples of:
- Component tests (`Sidebar.test.jsx`)
- Page tests (`Dashboard.test.jsx`)
- Utility tests (`auth.test.js`)
- Integration tests (`AppIntegration.test.jsx`)