// Utils/Methods.js

export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidObjectField = (obj) => {
  return Object.values(obj).every((value) => value.trim());
};

export const updateError = (message, setError) => {
  setError(message);
  setTimeout(() => {
    setError('');
  }, 3000);
};

// Safely return initials
export const getInitials = (name) => {
  if (!name) return '??';
  const nameParts = name.trim().split(' ');
  if (nameParts.length >= 2) {
    return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Safely handle undefined/null name
export const getRandomColor = (name = '') => {
  const colors = [
    '#3498db', '#2ecc71', '#9b59b6', '#e74c3c', '#f39c12', '#1abc9c', '#34495e'
  ];

  if (!name || typeof name !== 'string') {
    return colors[0]; // fallback to default color (blue)
  }

  const charCode = name.charCodeAt(0) || 0;
  return colors[charCode % colors.length];
};
