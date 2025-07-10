import React from "react";
//Password validator
export const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
        throw new Error("Password must be at least 8 characters long.");
    }
    if (!hasUpperCase) {
        throw new Error("Password must contain at least one uppercase letter.");
    }
    if (!hasLowerCase) {
        throw new Error("Password must contain at least one lowercase letter.");
    }
    if (!hasNumber) {
        throw new Error("Password must contain at least one number.");
    }
    if (!hasSpecialChar) {
        throw new Error("Password must contain at least one special character.");
    }

    return true; // Password is valid
}

//URL validator
export const validateURL = (url) => {
    try {
        // Check if URL is empty
        if (!url) throw new Error("URL cannot be empty.");

        // Use URL constructor to validate
        new URL(url);

        // Regular expression to check for common valid URL formats
        const urlRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/;
        if (!urlRegex.test(url)) throw new Error("Invalid URL format.");

        return true; // URL is valid
    } catch (error) {
        throw new Error(error.message || "Invalid URL.");
    }
};

//Email validator
export const validateEmail = (email) => {
    // Regular expression for validating an Email
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
        throw new Error("Email cannot be empty.");
    }
    if (!re.test(email)) {
        throw new Error("Invalid email format.");
    }
    return true; // Email is valid
}