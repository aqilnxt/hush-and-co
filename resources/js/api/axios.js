import axios from 'axios';

const apiBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const api = axios.create({
    baseURL: apiBaseURL,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

export const backendBaseUrl = apiBaseURL.replace(/\/api\/?$/i, '');

// Auto attach token dari localStorage
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auto handle 401 Unauthorized
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    },
);

export default api;
