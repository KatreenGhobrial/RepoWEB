import axios from 'axios';

const API_BASE =  process.env.VITE_SERVER_URL ;

// Helper to grab token and format headers
function getHeaders() {
    const userStr = localStorage.getItem('currentUser');
    let userId = null;
    if (userStr) {
        try { userId = JSON.parse(userStr)._id; } catch (e) {}
    }
    return {
        "Content-Type": "application/json",
        ...(userId && { "x-user-id": userId })
    };
}

// Helper to keep error messages clean
function handleError(error) {
    const message = error.response?.data?.message || error.message || 'Server Error';
    throw new Error(message);
}

// Export a simple object with clear get/post/put/delete methods
const api = {
    async get(url, config = {}) {
        try {
            const res = await axios.get(API_BASE + url, { ...config, headers: getHeaders() });
            return res.data;
        } catch (err) { handleError(err); }
    },
    
    async post(url, data = {}, config = {}) {
        try {
            const res = await axios.post(API_BASE + url, data, { ...config, headers: getHeaders() });
            return res.data;
        } catch (err) { handleError(err); }
    },
    
    async put(url, data = {}, config = {}) {
        try {
            const res = await axios.put(API_BASE + url, data, { ...config, headers: getHeaders() });
            return res.data;
        } catch (err) { handleError(err); }
    },
    
    async delete(url, config = {}) {
        try {
            const res = await axios.delete(API_BASE + url, { ...config, headers: getHeaders() });
            return res.data;
        } catch (err) { handleError(err); }
    }
};

export default api;
