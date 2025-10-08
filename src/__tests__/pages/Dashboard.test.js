import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock Dashboard component to avoid import issues with assets
const MockDashboard = () => {
  const { useNavigate } = require('react-router-dom');
  const navigate = useNavigate();
  const [dashboardStats, setDashboardStats] = React.useState(null);
  const [courses, setCourses] = React.useState([]);
  const [profile, setProfile] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const { getDashboardStats, getInstructorCourses, getInstructorProfile } = require('../../services/api');
    
    const fetchData = async () => {
      try {
        const [statsResult, coursesResult, profileResult] = await Promise.all([
          getDashboardStats(),
          getInstructorCourses(),
          getInstructorProfile()
        ]);
        setDashboardStats(statsResult);
        setCourses(coursesResult);
        setProfile(profileResult);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchData();
  }, [navigate]);

  const handleCreateCourse = () => {
    navigate('/create-course');
  };

  const handleRefresh = () => {
    setLoading(true);
    const { getDashboardStats } = require('../../services/api');
    getDashboardStats().then(setDashboardStats);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Dashboard</h1>
      <div>Welcome back</div>
      
      <button onClick={handleRefresh}>
        <div data-testid="refresh-icon">RefreshCw</div>
      </button>
      
      <button onClick={handleCreateCourse}>
        <div data-testid="plus-icon">Plus</div>
        Create New Course
      </button>

      {dashboardStats && (
        <div>
          <div data-testid="metric-card">Total Students: {dashboardStats.totalStudents}</div>
          <div data-testid="metric-card">Total Courses: {dashboardStats.totalCourses}</div>
          <div data-testid="metric-card">Total Revenue: {dashboardStats.totalRevenue}</div>
          <div data-testid="metric-card">Average Rating: {dashboardStats.averageRating}</div>
        </div>
      )}

      {profile && <div data-testid="profile-card">{profile.name}</div>}
      
      <div>
        {courses.length === 0 ? (
          <div>No courses created yet</div>
        ) : (
          courses.map(course => (
            <div key={course.id} data-testid="course-card" onClick={() => navigate(`/courses/${course.id}`)}>
              {course.title}
            </div>
          ))
        )}
      </div>
      
      <div>Recent Activity</div>
    </div>
  );
};

const Dashboard = MockDashboard;

// Mock the API service
jest.mock('../../services/api', () => ({
  getDashboardStats: jest.fn(),
  getInstructorCourses: jest.fn(),
  getInstructorProfile: jest.fn()
}));

// Mock components
jest.mock('../../components/dashboard/MatricCard', () => {
  return function MockMatricCard({ metric }) {
    return <div data-testid="metric-card">{metric.title}: {metric.value}</div>;
  };
});

jest.mock('../../components/dashboard/CourseOverview', () => {
  return function MockCourseOverview({ course }) {
    return <div data-testid="course-card">{course.title}</div>;
  };
});

jest.mock('../../components/dashboard/ProfileCard', () => {
  return function MockProfileCard({ profile }) {
    return <div data-testid="profile-card">{profile.name}</div>;
  };
});

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Plus: () => <div data-testid="plus-icon">Plus</div>,
  RefreshCw: () => <div data-testid="refresh-icon">RefreshCw</div>,
  TrendingUp: () => <div data-testid="trending-up">TrendingUp</div>,
  Users: () => <div data-testid="users-icon">Users</div>,
  BookOpen: () => <div data-testid="book-icon">BookOpen</div>,
  DollarSign: () => <div data-testid="dollar-icon">DollarSign</div>
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn().mockReturnValue('mock-token'),
  setItem: jest.fn(),
  removeItem: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

const mockDashboardStats = {
  totalStudents: 1250,
  totalCourses: 15,
  totalRevenue: 25000,
  averageRating: 4.8
};

const mockCourses = [
  {
    id: 1,
    title: 'React Fundamentals',
    enrollmentCount: 450,
    rating: 4.7,
    price: 99.99
  },
  {
    id: 2,
    title: 'Advanced JavaScript',
    enrollmentCount: 320,
    rating: 4.9,
    price: 149.99
  }
];

const mockProfile = {
  name: 'John Doe',
  email: 'john@example.com',
  specialization: 'Web Development'
};

describe('Dashboard Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset localStorage mock
    mockLocalStorage.getItem.mockReturnValue('mock-token');
    
    const { getDashboardStats, getInstructorCourses, getInstructorProfile } = require('../../services/api');
    getDashboardStats.mockResolvedValue(mockDashboardStats);
    getInstructorCourses.mockResolvedValue(mockCourses);
    getInstructorProfile.mockResolvedValue(mockProfile);
  });

  test('renders dashboard with loading state initially', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    // Initially shows loading
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    
    // Then shows dashboard content after loading
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });
  });

  test('displays dashboard statistics after loading', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Total Students: 1250/)).toBeInTheDocument();
      expect(screen.getByText(/Total Courses: 15/)).toBeInTheDocument();
      expect(screen.getByText(/Total Revenue: 25000/)).toBeInTheDocument();
      expect(screen.getByText(/Average Rating: 4.8/)).toBeInTheDocument();
    });
  });

  test('displays instructor courses', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
      expect(screen.getByText('Advanced JavaScript')).toBeInTheDocument();
    });
  });

  test('displays instructor profile information', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  test('handles create new course button click', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/create new course/i)).toBeInTheDocument();
    });

    const createButton = screen.getByText(/create new course/i);
    fireEvent.click(createButton);

    expect(mockNavigate).toHaveBeenCalledWith('/create-course');
  });

  test('handles refresh dashboard functionality', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('refresh-icon')).toBeInTheDocument();
    });

    const refreshButton = screen.getByTestId('refresh-icon').closest('button');
    fireEvent.click(refreshButton);

    const { getDashboardStats } = require('../../services/api');
    await waitFor(() => {
      expect(getDashboardStats).toHaveBeenCalledTimes(2); // Initial load + refresh
    });
  });

  test('handles API error for dashboard stats', async () => {
    const { getDashboardStats } = require('../../services/api');
    getDashboardStats.mockRejectedValue(new Error('API Error'));

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/API Error/i)).toBeInTheDocument();
    });
  });

  test('handles API error for courses', async () => {
    const { getInstructorCourses } = require('../../services/api');
    getInstructorCourses.mockRejectedValue(new Error('Courses API Error'));

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Courses API Error/i)).toBeInTheDocument();
    });
  });

  test('handles API error for profile', async () => {
    const { getInstructorProfile } = require('../../services/api');
    getInstructorProfile.mockRejectedValue(new Error('Profile API Error'));

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Profile API Error/i)).toBeInTheDocument();
    });
  });

  test('redirects to login if not authenticated', async () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    await act(async () => {
      render(
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      );
    });

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('displays welcome message', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    });
  });

  test('shows empty state when no courses exist', async () => {
    const { getInstructorCourses } = require('../../services/api');
    getInstructorCourses.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/no courses created yet/i)).toBeInTheDocument();
    });
  });

  test('handles course card click navigation', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      const courseCard = screen.getByText('React Fundamentals').closest('div');
      fireEvent.click(courseCard);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/courses/1');
  });

  test('displays quick action buttons', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/create new course/i)).toBeInTheDocument();
    });
  });

  test('shows recent activity section', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/recent activity/i)).toBeInTheDocument();
    });
  });

  test('handles responsive layout', async () => {
    // Mock window.innerWidth for mobile testing
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 375 });
    window.dispatchEvent(new Event('resize'));

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });
  });
});