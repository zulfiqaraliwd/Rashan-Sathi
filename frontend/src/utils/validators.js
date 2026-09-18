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
  if (password.length < 6) return { level: 'weak', text: 'Bohat kamzor' };
  if (password.length < 8) return { level: 'weak', text: 'Kamzor' };

  const hasLetters = /[a-zA-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);

  if (hasLetters && hasNumbers && hasSpecial && password.length >= 10) {
    return { level: 'strong', text: 'Mazboot' };
  }

  if (hasLetters && hasNumbers) {
    return { level: 'medium', text: 'Theek' };
  }

  return { level: 'weak', text: 'Kamzor' };
};

// Trim aur sanitize
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim();
};

// Image file validation
export const isValidImage = (file) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowed.includes(file.type)) {
    return { valid: false, error: 'Sirf JPG, PNG ya WEBP images allowed hain' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'File 5MB se chhoti honi chahiye' };
  }

  return { valid: true };
};