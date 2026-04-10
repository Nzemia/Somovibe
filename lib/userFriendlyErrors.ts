/**
 * User-friendly error messages
 * Maps technical errors to messages users can understand
 */

export const USER_FRIENDLY_ERRORS = {
    // Authentication errors
    UNAUTHORIZED: "Please log in to continue",
    FORBIDDEN: "You don't have permission to do that",
    USER_NOT_FOUND: "Account not found. Please check your details",
    INVALID_CREDENTIALS: "Email or password is incorrect. Please try again",
    SESSION_EXPIRED: "Your session has expired. Please log in again",

    // Registration errors
    USER_EXISTS: "An account with this email already exists",
    WEAK_PASSWORD: "Password must be at least 6 characters long",
    INVALID_EMAIL: "Please enter a valid email address",

    // Payment errors
    INSUFFICIENT_BALANCE: "You don't have enough funds in your wallet",
    PAYMENT_FAILED: "Payment could not be processed. Please try again",
    PAYMENT_TIMEOUT: "Payment request timed out. Please try again",
    INVALID_PHONE: "Please enter a valid phone number (e.g., 0712345678)",
    ALREADY_PURCHASED: "You've already purchased this material",
    PENDING_WITHDRAWAL: "You have a pending withdrawal. Please wait for it to complete",

    // Material errors
    MATERIAL_NOT_FOUND: "Material not found or has been removed",
    MATERIAL_NOT_APPROVED: "This material is not yet available for purchase",
    CANNOT_BUY_OWN: "You cannot purchase your own material",
    UPLOAD_FAILED: "Failed to upload file. Please check the file and try again",
    INVALID_FILE_TYPE: "Only PDF and PowerPoint files are allowed",
    FILE_TOO_LARGE: "File is too large. Maximum size is 10 MB",

    // Withdrawal errors
    MIN_WITHDRAWAL: "Minimum withdrawal amount is KES 10",
    MAX_WITHDRAWAL: "Maximum withdrawal amount is KES 150,000",
    WITHDRAWAL_FAILED: "Withdrawal could not be processed. Please try again later",

    // General errors
    MISSING_FIELDS: "Please fill in all required fields",
    INVALID_REQUEST: "Invalid request. Please check your information",
    SERVER_ERROR: "Something went wrong on our end. Please try again",
    NETWORK_ERROR: "Connection problem. Please check your internet and try again",
} as const;

/**
 * Get user-friendly error message
 */
export function getUserFriendlyError(error: string | Error): string {
    const errorMessage = typeof error === 'string' ? error : error.message;

    // Check if it's a known error key
    if (errorMessage in USER_FRIENDLY_ERRORS) {
        return USER_FRIENDLY_ERRORS[errorMessage as keyof typeof USER_FRIENDLY_ERRORS];
    }

    // Check for partial matches
    const lowerError = errorMessage.toLowerCase();

    if (lowerError.includes('unauthorized') || lowerError.includes('not authenticated')) {
        return USER_FRIENDLY_ERRORS.UNAUTHORIZED;
    }
    if (lowerError.includes('forbidden') || lowerError.includes('permission')) {
        return USER_FRIENDLY_ERRORS.FORBIDDEN;
    }
    if (lowerError.includes('not found')) {
        return USER_FRIENDLY_ERRORS.MATERIAL_NOT_FOUND;
    }
    if (lowerError.includes('already exists') || lowerError.includes('duplicate')) {
        return USER_FRIENDLY_ERRORS.USER_EXISTS;
    }
    if (lowerError.includes('password') && lowerError.includes('short')) {
        return USER_FRIENDLY_ERRORS.WEAK_PASSWORD;
    }
    if (lowerError.includes('insufficient')) {
        return USER_FRIENDLY_ERRORS.INSUFFICIENT_BALANCE;
    }
    if (lowerError.includes('phone') && lowerError.includes('number')) {
        return USER_FRIENDLY_ERRORS.INVALID_PHONE;
    }
    if (lowerError.includes('network') || lowerError.includes('connection')) {
        return USER_FRIENDLY_ERRORS.NETWORK_ERROR;
    }

    // Return original message if no match (but sanitized)
    return errorMessage || USER_FRIENDLY_ERRORS.SERVER_ERROR;
}
