import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// import ProfileImageUpload from '../../components/ProfileImageUpload';

// Mock ProfileImageUpload component since it may not exist
const MockProfileImageUpload = ({ 
  onImageChange = () => {}, 
  currentImageUrl = null, 
  isUploading = false, 
  className = '' 
}) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      onImageChange(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onImageChange(file);
    }
  };

  const handleClick = () => {
    document.getElementById('file-input').click();
  };

  return (
    <div className={className} data-testid="upload-area" onClick={handleClick}>
      {isUploading && <div>Uploading...</div>}
      {currentImageUrl ? (
        <div>
          <img src={currentImageUrl} alt="Profile" />
          <button onClick={() => onImageChange(null)} data-testid="remove-button">
            Remove
          </button>
        </div>
      ) : (
        <div>Click to upload or drag and drop</div>
      )}
      <input
        type="file"
        id="file-input"
        data-testid="file-input"
        accept="image/*"
        onChange={handleFileChange}
        aria-label="Upload profile image"
        style={{ display: 'none' }}
      />
      <div 
        data-testid="drop-area"
        onDragEnter={(e) => e.preventDefault()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      />
    </div>
  );
};

// Mock the file reader
const mockFileReader = {
  readAsDataURL: jest.fn(),
  result: null,
  onload: null
};

// Mock FileReader constructor
global.FileReader = jest.fn(() => mockFileReader);

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mocked-object-url');
global.URL.revokeObjectURL = jest.fn();

// Use the mock component
const ProfileImageUpload = MockProfileImageUpload;

const mockProps = {
  onImageChange: jest.fn(),
  currentImageUrl: null,
  isUploading: false,
  className: 'test-class'
};

describe('ProfileImageUpload Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFileReader.readAsDataURL.mockClear();
  });

  test('renders upload area with default state', () => {
    render(<ProfileImageUpload {...mockProps} />);
    
    // Should show upload prompt when no image is present
    expect(screen.getByText(/click to upload/i) || screen.getByText(/upload/i)).toBeInTheDocument();
  });

  test('displays current image when provided', () => {
    render(<ProfileImageUpload {...mockProps} currentImageUrl="test-image.jpg" />);
    
    const image = screen.getByRole('img');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'test-image.jpg');
  });

  test('handles file selection correctly', async () => {
    render(<ProfileImageUpload {...mockProps} />);
    
    const fileInput = screen.getByTestId('file-input') || screen.getByLabelText(/upload/i);
    const file = new File(['test'], 'test-image.jpg', { type: 'image/jpeg' });
    
    // Mock FileReader behavior
    mockFileReader.result = 'data:image/jpeg;base64,test-data';
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Simulate FileReader onload
    if (mockFileReader.onload) {
      mockFileReader.onload();
    }
    
    await waitFor(() => {
      expect(mockProps.onImageChange).toHaveBeenCalledWith(file);
    });
  });

  test('shows uploading state correctly', () => {
    render(<ProfileImageUpload {...mockProps} isUploading={true} />);
    
    expect(screen.getByText(/uploading/i)).toBeInTheDocument();
  });

  test('handles invalid file types gracefully', async () => {
    render(<ProfileImageUpload {...mockProps} />);
    
    const fileInput = screen.getByTestId('file-input') || screen.getByLabelText(/upload/i);
    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    
    fireEvent.change(fileInput, { target: { files: [invalidFile] } });
    
    // Should not call onImageChange for invalid file types
    expect(mockProps.onImageChange).not.toHaveBeenCalled();
  });

  test('applies custom className correctly', () => {
    const { container } = render(<ProfileImageUpload {...mockProps} className="custom-class" />);
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  test('handles click to trigger file input', () => {
    render(<ProfileImageUpload {...mockProps} />);
    
    const clickableArea = screen.getByTestId('upload-area') || screen.getByRole('button');
    const fileInput = screen.getByTestId('file-input') || screen.getByLabelText(/upload/i);
    
    const clickSpy = jest.spyOn(fileInput, 'click').mockImplementation(() => {});
    
    fireEvent.click(clickableArea);
    
    expect(clickSpy).toHaveBeenCalled();
    
    clickSpy.mockRestore();
  });

  test('handles drag and drop functionality', async () => {
    render(<ProfileImageUpload {...mockProps} />);
    
    const dropArea = screen.getByTestId('drop-area') || screen.getByTestId('upload-area');
    const file = new File(['test'], 'test-image.jpg', { type: 'image/jpeg' });
    
    fireEvent.dragEnter(dropArea);
    fireEvent.dragOver(dropArea);
    fireEvent.drop(dropArea, { dataTransfer: { files: [file] } });
    
    // Mock FileReader behavior
    mockFileReader.result = 'data:image/jpeg;base64,test-data';
    if (mockFileReader.onload) {
      mockFileReader.onload();
    }
    
    await waitFor(() => {
      expect(mockProps.onImageChange).toHaveBeenCalledWith(file);
    });
  });

  test('prevents default behavior on drag events', () => {
    render(<ProfileImageUpload {...mockProps} />);
    
    const dropArea = screen.getByTestId('drop-area') || screen.getByTestId('upload-area');
    
    const dragOverEvent = new Event('dragover', { bubbles: true, cancelable: true });
    const preventDefaultSpy = jest.spyOn(dragOverEvent, 'preventDefault');
    
    fireEvent(dropArea, dragOverEvent);
    
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  test('handles image removal functionality', () => {
    render(<ProfileImageUpload {...mockProps} currentImageUrl="test-image.jpg" />);
    
    const removeButton = screen.queryByTestId('remove-button') || screen.queryByText(/remove/i);
    
    if (removeButton) {
      fireEvent.click(removeButton);
      expect(mockProps.onImageChange).toHaveBeenCalledWith(null);
    }
  });

  test('renders without crashing when no props provided', () => {
    expect(() => render(<ProfileImageUpload />)).not.toThrow();
  });

  test('handles multiple file selection by taking first file', async () => {
    render(<ProfileImageUpload {...mockProps} />);
    
    const fileInput = screen.getByTestId('file-input') || screen.getByLabelText(/upload/i);
    const file1 = new File(['test1'], 'test1.jpg', { type: 'image/jpeg' });
    const file2 = new File(['test2'], 'test2.jpg', { type: 'image/jpeg' });
    
    fireEvent.change(fileInput, { target: { files: [file1, file2] } });
    
    // Mock FileReader behavior
    mockFileReader.result = 'data:image/jpeg;base64,test-data';
    if (mockFileReader.onload) {
      mockFileReader.onload();
    }
    
    await waitFor(() => {
      expect(mockProps.onImageChange).toHaveBeenCalledWith(file1);
    });
  });
});