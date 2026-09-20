// Email validation
export const isValidEmail = (email) => {
  return /^\S+@\S+\.\S+$/.test(email);
};

// Pakistani phone number validation
export const isValidPhone = (phone) => {
  return /^(\+92|0)?3[0-9]{9}$/.test(phone);
};

// Password strength check
export const getPasswordStrength = (password) => {
  if (password.length < 6) return { level: 'weak', text: 'Very weak' };
  if (password.length < 8) return { level: 'weak', text: 'Weak' };

  const hasLetters = /[a-zA-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);

  if (hasLetters && hasNumbers && hasSpecial && password.length >= 10) {
    return { level: 'strong', text: 'Strong' };
  }

  if (hasLetters && hasNumbers) {
    return { level: 'medium', text: 'Medium' };
  }

  return { level: 'weak', text: 'Weak' };
};

// Trim and sanitize
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim();
};

// Image file validation
export const isValidImage = (file) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowed.includes(file.type)) {
    return { valid: false, error: 'Only JPG, PNG or WEBP images are allowed' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'File must be smaller than 5MB' };
  }

  return { valid: true };
};