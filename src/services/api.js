const API_BASE_URL = "http://localhost:4000";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    "Content-Type": "application/json",
    ...(token && { "Authorization": `Bearer ${token}` }),
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  const contentType = response.headers.get("content-type");
  let data;
  
  // Check if the response is JSON
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    // Handle plain text responses (like "Unauthorized")
    const text = await response.text();
    data = { error: text || `HTTP error! status: ${response.status}` };
  }
  
  if (!response.ok) {
    throw new Error(data.error || `HTTP error! status: ${response.status}`);
  }
  
  return data;
};

export const courseAPI = {
  // Create a new course
  async createCourse(courseData) {
    const response = await fetch(`${API_BASE_URL}/instructor/courses`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(courseData),
    });
    
    return handleResponse(response);
  },

  // Get all courses for the authenticated instructor
  async getInstructorCourses() {
    const response = await fetch(`${API_BASE_URL}/instructor/courses`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  // Get a specific course by ID
  async getCourseById(courseId) {
    const response = await fetch(`${API_BASE_URL}/instructor/courses/${courseId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  // Update a course
  async updateCourse(courseId, updateData) {
    const response = await fetch(`${API_BASE_URL}/instructor/courses/${courseId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData),
    });
    
    return handleResponse(response);
  },

  // Delete a course
  async deleteCourse(courseId) {
    const response = await fetch(`${API_BASE_URL}/instructor/courses/${courseId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  // Get all courses (public endpoint)
  async getAllCourses() {
    const response = await fetch(`${API_BASE_URL}/instructor/courses/public/all`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    return handleResponse(response);
  },
};

export const authAPI = {
  // Login
  async login(credentials) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });
    
    return handleResponse(response);
  },

  // Register
  async register(userData) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    
    return handleResponse(response);
  },

  // Get dashboard (protected route)
  async getDashboard() {
    const response = await fetch(`${API_BASE_URL}/auth/dashboard`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },
};