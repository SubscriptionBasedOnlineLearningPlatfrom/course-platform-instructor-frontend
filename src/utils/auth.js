// Simple authentication helper
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('instructorProfileImages'); // Clear cached profile images
  window.location.href = '/';
};

export const requireAuth = () => {
  if (!isAuthenticated()) {
    window.location.href = '/';
    return false;
  }
  return true;
};