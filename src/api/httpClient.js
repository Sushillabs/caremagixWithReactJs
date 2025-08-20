// src/api/httpClient.js
import axios from 'axios';

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization =
      config.rawToken ? token : `Bearer ${token}`;
  }
  console.log("withAuth:", config.withAuth, "Authorization:", config.headers.Authorization);

  return config;
});



http.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.message || 'API Error';
    return Promise.reject(new Error(message));
  }
);

export default http;
