import axios from 'axios';
 

/**
 * API Client Utility.
 * Provides a standardized Axios wrapper for making HTTP requests to the backend API.
 * Automatically handles attaching the user token/ID to request headers and standardizing error handling.
 */

// Base URL for all API calls, pulled from the environment variable
const API_BASE = `${import.meta.env.VITE_SERVER_URL}/api`;

/**
 * Retrieves the current user's ID from local storage and formats it into request headers.
 * @returns {Object} Headers object containing Content-Type and x-user-id.
 */
function getHeaders() {
    // Read the logged-in user from localStorage to extract their ID
    const userStr = localStorage.getItem('currentUser');
    let userId = null;
    if (userStr) {
        try { userId = JSON.parse(userStr)._id; } catch (e) {}
    }
    // Always send JSON content type; add user ID header only when available
    return {
        "Content-Type": "application/json",
      
        ...(userId && { "x-user-id": userId })
    };
}

// Helper to keep error messages clean
function handleError(error) {
    // Extract a readable message from the server response or fallback to generic error
    const message = error.response?.data?.message || error.message || 'Server Error';
    throw new Error(message);
}

// Export a simple object with clear get/post/put/delete methods
const api = {
    // Send a GET request to the given URL
    async get(url, config = {}) {
        try {
            const res = await axios.get(API_BASE + url, { ...config, headers: getHeaders() });
            return res.data;
        } catch (err) { handleError(err); }
    },
    
    // Send a POST request with a JSON body
    async post(url, data = {}, config = {}) {
        try {
            const res = await axios.post(API_BASE + url, data, { ...config, headers: getHeaders() });
            return res.data;
        } catch (err) { handleError(err); }
    },
    
    // Send a PUT request to update an existing resource
    async put(url, data = {}, config = {}) {
        try {
            const res = await axios.put(API_BASE + url, data, { ...config, headers: getHeaders() });
            return res.data;
        } catch (err) { handleError(err); }
    },
    
    // Send a DELETE request to remove a resource
    async delete(url, config = {}) {
        try {
            const res = await axios.delete(API_BASE + url, { ...config, headers: getHeaders() });
            return res.data;
        } catch (err) { handleError(err); }
    }
};

export default api;
