// src/api/hospitalApi.js
import http from './httpClient';

export const registerHospital = (data) => http.post('/org_register/hospital_verify', data);
export const getHospitals = () => http.get('/get_details?type=hospital');

// src/api/userApi.js
// export const loginUser = (credentials) => http.post('/login', credentials);
// export const fetchProfile = () => http.get('/user/profile');
