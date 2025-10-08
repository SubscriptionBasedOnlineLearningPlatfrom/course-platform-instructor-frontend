// Enhanced authentication helper
export const isAuthenticated = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    // Check for whitespace-only tokens
    if (typeof token === 'string' && token.trim() === '') {
      return false;
    }
    
    return !!token;
  } catch (error) {
    // Handle localStorage access errors gracefully
    return false;
  }
};

export const logout = () => {
  // Remove authentication data from localStorage - handle each item separately for robustness
  try {
    localStorage.removeItem('token');
  } catch (error) {
    console.warn('Error removing token:', error);
  }
  
  try {
    localStorage.removeItem('user');
  } catch (error) {
    console.warn('Error removing user:', error);
  }
  
  try {
    localStorage.removeItem('instructorProfileImages'); // Clear cached profile images
  } catch (error) {
    console.warn('Error removing instructorProfileImages:', error);
  }
  
  // Trigger storage event to update all tabs
  try {
    window.dispatchEvent(new Event('storage'));
  } catch (error) {
    console.warn('Could not dispatch storage event:', error);
  }
  
  // Reload the page to reset the app state (skip in tests)  
  try {
    if (typeof jest === 'undefined' && window.location && window.location.reload) {
      window.location.reload();
    }
  } catch (error) {
    console.warn('Could not reload page:', error);
  }
};

export const requireAuth = () => {
  if (!isAuthenticated()) {
    // Redirect to home page for unauthenticated users
    try {
      if (window.location) {
        window.location.href = '/';
      }
    } catch (error) {
      console.warn('Could not redirect:', error);
    }
    return false;
  }
  return true;
};