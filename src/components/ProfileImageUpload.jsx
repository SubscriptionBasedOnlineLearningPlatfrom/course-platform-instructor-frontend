import React, { useState, useRef } from 'react';
import { Camera, Upload, X, User } from 'lucide-react';
import { toast } from 'sonner';

const ProfileImageUpload = ({ 
  currentImageUrl, 
  instructorId, 
  onImageUpdate, 
  className = "" 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(currentImageUrl);
  const fileInputRef = useRef(null);

  // Update preview when currentImageUrl changes (when switching instructors)
  React.useEffect(() => {
    if (instructorId) {
      // Load instructor-specific profile image from localStorage or use currentImageUrl
      const cachedImages = JSON.parse(localStorage.getItem('instructorProfileImages') || '{}');
      const instructorImage = cachedImages[instructorId] || currentImageUrl;
      setPreview(instructorImage);
    } else {
      setPreview(currentImageUrl);
    }
  }, [currentImageUrl, instructorId]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // Upload file
      uploadImage(file);
    }
  };

  const uploadImage = async (file) => {
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('profileImage', file);
      formData.append('instructorId', instructorId);

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/instructor/profile/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Profile image updated successfully!');
        setPreview(data.imageUrl);
        
        // Cache the image URL for this specific instructor
        if (instructorId && data.imageUrl) {
          const cachedImages = JSON.parse(localStorage.getItem('instructorProfileImages') || '{}');
          cachedImages[instructorId] = data.imageUrl;
          localStorage.setItem('instructorProfileImages', JSON.stringify(cachedImages));
        }
        
        if (onImageUpdate) {
          onImageUpdate(data.imageUrl);
        }
      } else {
        throw new Error(data.error || 'Failed to upload image');
      }

    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload profile image');
      setPreview(currentImageUrl); // Revert preview on error
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!preview) return;

    setIsUploading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/instructor/profile/delete-image', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ instructorId })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Profile image deleted successfully!');
        setPreview(null);
        
        // Remove cached image for this instructor
        if (instructorId) {
          const cachedImages = JSON.parse(localStorage.getItem('instructorProfileImages') || '{}');
          delete cachedImages[instructorId];
          localStorage.setItem('instructorProfileImages', JSON.stringify(cachedImages));
        }
        
        if (onImageUpdate) {
          onImageUpdate(null);
        }
      } else {
        throw new Error(data.error || 'Failed to delete image');
      }

    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to delete profile image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Profile Image Display */}
      <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100">
        {preview ? (
          <img
            src={preview}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
            <User className="w-16 h-16 text-white" />
          </div>
        )}

        {/* Upload Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="flex gap-2">
            {/* Upload Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors disabled:opacity-50"
              title="Upload new image"
            >
              {isUploading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>

            {/* Delete Button */}
            {preview && (
              <button
                onClick={handleDeleteImage}
                disabled={isUploading}
                className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors disabled:opacity-50"
                title="Delete image"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Progress Indicator */}
      {isUploading && (
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs">
          Uploading...
        </div>
      )}
    </div>
  );
};

export default ProfileImageUpload;