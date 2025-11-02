export const APP_CONSTANTS = {
  JWT: {
    ACCESS_TOKEN_EXPIRY: '15m',
    REFRESH_TOKEN_EXPIRY: '7d',
  },
  BCRYPT: {
    SALT_ROUNDS: 10,
  },
  RATE_LIMIT: {
    TTL: 60000, // 1 minute
    LIMIT: 100, // 100 requests per minute
  },
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },
  DATE_FORMAT: {
    ISO: 'YYYY-MM-DD',
    DISPLAY: 'DD/MM/YYYY',
  },
  CURRENCY: {
    CODE: 'VND',
    SYMBOL: '₫',
  },
};

export const ERROR_MESSAGES = {
  AUTH: {
    INVALID_CREDENTIALS:
      'Invalid email or password. Please check your credentials and try again.',
    USER_NOT_FOUND: 'User not found. Please register first.',
    EMAIL_ALREADY_EXISTS:
      'Email already exists. Please use a different email or login.',
    USERNAME_ALREADY_EXISTS:
      'Username already taken. Please choose a different username.',
    INVALID_TOKEN: 'Invalid or expired token. Please login again.',
    UNAUTHORIZED:
      'You are not authorized to perform this action. Please login first.',
    TOKEN_EXPIRED: 'Your session has expired. Please login again.',
    INVALID_REFRESH_TOKEN: 'Invalid refresh token. Please login again.',
  },
  USER: {
    NOT_FOUND: 'User not found.',
    INVALID_PASSWORD: 'Current password is incorrect. Please try again.',
    PASSWORD_MISMATCH: 'Passwords do not match.',
    UPDATE_FAILED: 'Failed to update user profile. Please try again.',
  },
  EXPENSE: {
    NOT_FOUND: 'Expense not found or you do not have permission to access it.',
    CREATE_FAILED:
      'Failed to create expense. Please check your input and try again.',
    UPDATE_FAILED: 'Failed to update expense. Please try again.',
    DELETE_FAILED: 'Failed to delete expense. Please try again.',
    INVALID_AMOUNT: 'Amount must be a positive number.',
    INVALID_DATE: 'Invalid date format. Please use YYYY-MM-DD format.',
  },
  BUDGET: {
    NOT_FOUND: 'Budget not found or you do not have permission to access it.',
    CREATE_FAILED:
      'Failed to create budget. Please check your input and try again.',
    UPDATE_FAILED: 'Failed to update budget. Please try again.',
    DELETE_FAILED: 'Failed to delete budget. Please try again.',
    INVALID_AMOUNT: 'Budget amount must be a positive number.',
    INVALID_DATE_RANGE: 'End date must be after start date.',
    OVERLAPPING_BUDGET: 'You already have an active budget for this period.',
  },
  CATEGORY: {
    NOT_FOUND: 'Category not found.',
    CREATE_FAILED: 'Failed to create category. Please try again.',
    UPDATE_FAILED: 'Failed to update category. Please try again.',
    DELETE_FAILED:
      'Cannot delete category. It is being used by existing expenses.',
    DUPLICATE_NAME: 'Category name already exists.',
    DEFAULT_CATEGORY_DELETE: 'Cannot delete default categories.',
  },
  VALIDATION: {
    REQUIRED_FIELD: 'This field is required.',
    INVALID_EMAIL: 'Please enter a valid email address.',
    INVALID_FORMAT: 'Invalid format. Please check your input.',
    MIN_LENGTH: 'Must be at least {min} characters long.',
    MAX_LENGTH: 'Must not exceed {max} characters.',
  },
};
