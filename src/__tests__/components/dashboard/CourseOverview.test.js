import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CourseOverview } from '../../../components/dashboard/CourseOverview';

// Mock UI components
jest.mock('../../../components/dashboard1/ui/card.jsx', () => ({
  Card: ({ children, className, ...props }) => (
    <div className={className} data-testid="course-overview-card" {...props}>
      {children}
    </div>
  )
}));

jest.mock('../../../components/dashboard1/ui/button.jsx', () => ({
  Button: ({ children, onClick, className, variant, size, ...props }) => (
    <button onClick={onClick} className={className} data-variant={variant} data-size={size} {...props}>
      {children}
    </button>
  )
}));

// Mock React Router
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: ({ children, to, ...props }) => (
    <a href={to} {...props}>
      {children}
    </a>
  )
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Users: () => <div data-testid="users-icon">Users</div>,
  BookOpen: () => <div data-testid="book-open-icon">BookOpen</div>,
  Star: () => <div data-testid="star-icon">Star</div>,
  Plus: () => <div data-testid="plus-icon">Plus</div>,
  ArrowRight: () => <div data-testid="arrow-right-icon">ArrowRight</div>,
  Loader2: ({ className }) => <div className={className} data-testid="loader-icon">Loader2</div>
}));

// Mock the API
jest.mock('../../../services/api', () => ({
  courseAPI: {
    getInstructorCourses: jest.fn()
  }
}));

const { courseAPI } = require('../../../services/api');

const renderCourseOverview = () => {
  return render(
    <MemoryRouter>
      <CourseOverview />
    </MemoryRouter>
  );
};

describe('CourseOverview Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    courseAPI.getInstructorCourses.mockClear();
  });

  test('renders loading state correctly', async () => {
    // Mock API to never resolve to test loading state
    courseAPI.getInstructorCourses.mockImplementation(() => new Promise(() => {}));
    
    renderCourseOverview();
    
    expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
    expect(screen.getByText('Loading your courses...')).toBeInTheDocument();
  });

  test('renders empty state when no courses', async () => {
    courseAPI.getInstructorCourses.mockResolvedValue({ data: [] });
    
    renderCourseOverview();
    
    await waitFor(() => {
      expect(screen.getByText('No courses yet')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Start creating your first course to share your knowledge!')).toBeInTheDocument();
    expect(screen.getByTestId('book-open-icon')).toBeInTheDocument();
  });

  test('renders courses list when data exists', async () => {
    const mockCourses = [
      {
        course_id: 1,
        course_title: 'React Basics',
        course_description: 'Learn React fundamentals',
        category: 'Programming',
        level: 'Beginner',
        created_at: '2024-01-01T00:00:00Z',
        status: 'published'
      },
      {
        course_id: 2,
        course_title: 'Advanced JavaScript',
        course_description: 'Master JavaScript concepts',
        category: 'Programming',
        level: 'Advanced',
        created_at: '2024-01-02T00:00:00Z',
        status: 'draft'
      }
    ];

    courseAPI.getInstructorCourses.mockResolvedValue({ data: mockCourses });
    
    renderCourseOverview();
    
    await waitFor(() => {
      expect(screen.getByText('React Basics')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Advanced JavaScript')).toBeInTheDocument();
    expect(screen.getByText('Your Courses (2)')).toBeInTheDocument();
  });

  test('handles API error correctly', async () => {
    courseAPI.getInstructorCourses.mockRejectedValue(new Error('Network error'));
    
    renderCourseOverview();
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load courses')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  test('handles unauthorized error', async () => {
    const unauthorizedError = new Error('Unauthorized');
    unauthorizedError.message = 'Unauthorized';
    courseAPI.getInstructorCourses.mockRejectedValue(unauthorizedError);
    
    renderCourseOverview();
    
    await waitFor(() => {
      expect(screen.getByText('Please login to view your courses')).toBeInTheDocument();
    });
  });

  test('retry button is rendered correctly', async () => {
    // Test that retry button appears and can be clicked
    courseAPI.getInstructorCourses.mockRejectedValue(new Error('Network error'));
    
    renderCourseOverview();
    
    // Wait for error state to show
    await waitFor(() => {
      expect(screen.getByText('Failed to load courses')).toBeInTheDocument();
    });
    
    const retryButton = screen.getByText('Try Again');
    expect(retryButton).toBeInTheDocument();
    expect(retryButton).toBeEnabled();
    
    // Verify clicking doesn't crash (functional test)
    fireEvent.click(retryButton);
    expect(courseAPI.getInstructorCourses).toHaveBeenCalledTimes(2);
  });

  test('displays create course links', async () => {
    courseAPI.getInstructorCourses.mockResolvedValue({ data: [] });
    
    renderCourseOverview();
    
    await waitFor(() => {
      const createLinks = screen.getAllByText(/Create/);
      expect(createLinks.length).toBeGreaterThan(0);
    });
    
    const createCourseLinks = screen.getAllByRole('link');
    const createCourseLink = createCourseLinks.find(link => 
      link.getAttribute('href') === '/create-course'
    );
    expect(createCourseLink).toBeInTheDocument();
  });

  test('renders without crashing', () => {
    courseAPI.getInstructorCourses.mockResolvedValue({ data: [] });
    
    expect(() => renderCourseOverview()).not.toThrow();
  });
});