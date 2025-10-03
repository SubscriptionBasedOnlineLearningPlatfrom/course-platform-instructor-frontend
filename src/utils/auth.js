// Simple authentication helper
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('instructorProfileImages'); // Clear cached profile images
  
  // Trigger storage event to update all tabs
  window.dispatchEvent(new Event('storage'));
  
  // Reload the page to reset the app state
  window.location.reload();
};

export const requireAuth = () => {
  if (!isAuthenticated()) {
    window.location.href = '/';
    return false;
  }
  return true;
};