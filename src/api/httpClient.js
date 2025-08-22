// src/api/httpClient.js
import axios from 'axios';

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Request interceptor
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  // Handle Auth
  if (config.withAuth && token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (config.rawAuth && token) {
    config.headers.Authorization = token;
  }

  // Handle Content-Type
  if (!config.headers['Content-Type']) {
    config.headers['Content-Type'] = config.isMultipart
      ? 'multipart/form-data'
      : 'application/json';
  }

  return config;
});

// Response interceptor
http.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const status = err.response?.status;
    const data = err.response?.data;

    switch (status) {
      case 401:
        console.warn('Unauthorized: forcing logout soon...');
        // Optionally: trigger logout()
        break;

      case 409:
        console.warn('Conflict:', data?.message);
        // Optionally: showCustomPopup(data?.message, true);
        break;

      case 500:
        console.error('Server error:', data);
        break;

      default:
        console.error('API error:', data?.message || err.message);
    }

    return Promise.reject(err);
  }
);

export default http;
