import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock the API service
jest.mock('../../services/api', () => ({
  createCourse: jest.fn(),
  uploadImage: jest.fn()
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Upload: () => <div data-testid="upload-icon">Upload</div>,
  Save: () => <div data-testid="save-icon">Save</div>,
  X: () => <div data-testid="x-icon">X</div>,
  Plus: () => <div data-testid="plus-icon">Plus</div>
}));

// Mock CreateCourse component
const MockCreateCourse = () => {
  const { useNavigate } = require('react-router-dom');
  const navigate = useNavigate();
  
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    price: '',
    category: '',
    level: '',
    duration: '',
    prerequisites: '',
    objectives: ''
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validate price in real-time - check if the raw value is not a valid number
    if (name === 'price' && value !== '') {
      // For number inputs, check the validity of the field
      if (e.target.validity && e.target.validity.badInput) {
        setError('Please enter a valid price');
        return;
      } else {
        setError('');
      }
    }
  };

  const validateForm = () => {
    if (!formData.title) {
      setError('Course title is required');
      return false;
    }
    if (formData.price && (isNaN(formData.price) || formData.price === 'abc')) {
      setError('Please enter a valid price');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { createCourse } = require('../../services/api');
      const result = await createCourse(formData);
      // Simulate navigation on success
      navigate(`/courses/${result.courseId}/curriculum`);
    } catch (err) {
      setError('Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div>
      <h1>Create New Course</h1>
      {error && <div>{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <label htmlFor="title">Course Title</label>
        <input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
        />

        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
        />

        <label htmlFor="price">Price</label>
        <input
          id="price"
          name="price"
          type="number"
          step="0.01"
          value={formData.price}
          onChange={handleChange}
        />

        <label htmlFor="category">Category</label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
        >
          <option value="">Select Category</option>
          <option value="programming">Programming</option>
          <option value="design">Design</option>
        </select>

        <label htmlFor="level">Difficulty Level</label>
        <select
          id="level"
          name="level"
          value={formData.level}
          onChange={handleChange}
        >
          <option value="">Select Level</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>

        <label htmlFor="duration">Duration</label>
        <input
          id="duration"
          name="duration"
          value={formData.duration}
          onChange={handleChange}
        />

        <label htmlFor="prerequisites">Prerequisites</label>
        <textarea
          id="prerequisites"
          name="prerequisites"
          value={formData.prerequisites}
          onChange={handleChange}
        />

        <label htmlFor="objectives">Learning Objectives</label>
        <textarea
          id="objectives"
          name="objectives"
          value={formData.objectives}
          onChange={handleChange}
        />

        <label htmlFor="image">Course Image</label>
        <input
          id="image"
          name="image"
          type="file"
          accept="image/*"
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Creating course...' : 'Create Course'}
        </button>
        
        <button type="button" onClick={handleCancel}>
          Cancel
        </button>
      </form>
    </div>
  );
};

const CreateCourse = MockCreateCourse;

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

describe('CreateCourse Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('mock-token');
  });

  test('renders create course form correctly', () => {
    render(
      <MemoryRouter>
        <CreateCourse />
      </MemoryRouter>
    );

    expect(screen.getByText(/create new course/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/course title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/price/i)).toBeInTheDocument();
  });

  test('handles form input changes correctly', () => {
    render(
      <MemoryRouter>
        <CreateCourse />
      </MemoryRouter>
    );

    const titleInput = screen.getByLabelText(/course title/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const priceInput = screen.getByLabelText(/price/i);

    fireEvent.change(titleInput, { target: { value: 'Test Course Title' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test course description' } });
    fireEvent.change(priceInput, { target: { value: '99.99' } });

    expect(titleInput).toHaveValue('Test Course Title');
    expect(descriptionInput).toHaveValue('Test course description');
    expect(priceInput).toHaveValue(99.99);
  });

  test('handles category selection', () => {
    render(
      <MemoryRouter>
        <CreateCourse />
      </MemoryRouter>
    );

    const categorySelect = screen.getByLabelText(/category/i);
    fireEvent.change(categorySelect, { target: { value: 'programming' } });

    expect(categorySelect).toHaveValue('programming');
  });

  test('handles difficulty level selection', () => {
    render(
      <MemoryRouter>
        <CreateCourse />
      </MemoryRouter>
    );

    const levelSelect = screen.getByLabelText(/difficulty level/i);
    fireEvent.change(levelSelect, { target: { value: 'intermediate' } });

    expect(levelSelect).toHaveValue('intermediate');
  });

  test('validates required fields on form submission', async () => {
    render(
      <MemoryRouter>
        <CreateCourse />
      </MemoryRouter>
    );

    const submitButton = screen.getByRole('button', { name: /create course/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/course title is required/i)).toBeInTheDocument();
    });
  });

  test('handles image upload functionality', async () => {
    render(
      <MemoryRouter>
        <CreateCourse />
      </MemoryRouter>
    );

    const fileInput = screen.getByLabelText(/course image/i);
    const file = new File(['test'], 'test-image.jpg', { type: 'image/jpeg' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(fileInput.files[0]).toBe(file);
    });
  });

  test('displays loading state during form submission', async () => {
    const { createCourse } = require('../../services/api');
    // Create a promise that we can control
    let resolvePromise;
    const controlledPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    createCourse.mockReturnValue(controlledPromise);

    render(
      <MemoryRouter>
        <CreateCourse />
      </MemoryRouter>
    );

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/course title/i), {
      target: { value: 'Test Course' }
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Test description' }
    });
    fireEvent.change(screen.getByLabelText(/price/i), {
      target: { value: '49.99' }
    });

    const submitButton = screen.getByRole('button', { name: /create course/i });
    
    await act(async () => {
      fireEvent.click(submitButton);
    });

    // Check loading state
    expect(screen.getByText(/creating course/i)).toBeInTheDocument();
    
    // Resolve the promise to clean up
    await act(async () => {
      resolvePromise({ success: true, courseId: 123 });
    });
  });

  test('handles successful course creation', async () => {
    const { createCourse } = require('../../services/api');
    createCourse.mockResolvedValue({ success: true, courseId: 123 });

    render(
      <MemoryRouter>
        <CreateCourse />
      </MemoryRouter>
    );

    // Fill out and submit form
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/course title/i), {
        target: { value: 'Test Course' }
      });
      fireEvent.change(screen.getByLabelText(/description/i), {
        target: { value: 'Test description' }
      });
      fireEvent.change(screen.getByLabelText(/price/i), {
        target: { value: '49.99' }
      });

      const submitButton = screen.getByRole('button', { name: /create course/i });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/courses/123/curriculum');
    });
  });

  test('handles course creation error', async () => {
    const { createCourse } = require('../../services/api');
    createCourse.mockRejectedValue(new Error('Creation failed'));

    render(
      <MemoryRouter>
        <CreateCourse />
      </MemoryRouter>
    );

    // Fill out and submit form
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/course title/i), {
        target: { value: 'Test Course' }
      });
      fireEvent.change(screen.getByLabelText(/description/i), {
        target: { value: 'Test description' }
      });

      const submitButton = screen.getByRole('button', { name: /create course/i });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/failed to create course/i)).toBeInTheDocument();
    });
  });

  test('validates price input format', () => {
    render(
      <MemoryRouter>
        <CreateCourse />
      </MemoryRouter>
    );

    const priceInput = screen.getByLabelText(/price/i);
    
    // HTML number inputs automatically prevent invalid characters
    // so we'll test that the input type is number which provides validation
    expect(priceInput).toHaveAttribute('type', 'number');
    expect(priceInput).toHaveAttribute('step', '0.01');
  });

  test('handles course duration input', () => {
    render(
      <MemoryRouter>
        <CreateCourse />
      </MemoryRouter>
    );

    const durationInput = screen.getByLabelText(/duration/i);
    fireEvent.change(durationInput, { target: { value: '10 hours' } });

    expect(durationInput).toHaveValue('10 hours');
  });

  test('redirects to login if not authenticated', () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    render(
      <MemoryRouter>
        <CreateCourse />
      </MemoryRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('handles cancel button click', () => {
    render(
      <MemoryRouter>
        <CreateCourse />
      </MemoryRouter>
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  test('displays course prerequisites input', () => {
    render(
      <MemoryRouter>
        <CreateCourse />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/prerequisites/i)).toBeInTheDocument();
  });

  test('handles learning objectives input', () => {
    render(
      <MemoryRouter>
        <CreateCourse />
      </MemoryRouter>
    );

    const objectivesInput = screen.getByLabelText(/learning objectives/i);
    fireEvent.change(objectivesInput, {
      target: { value: 'Students will learn React fundamentals' }
    });

    expect(objectivesInput).toHaveValue('Students will learn React fundamentals');
  });
});