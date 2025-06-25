// src/api/hospitalApi.js
import http from './httpClient';

export const registerHospital = (data) => http.post('/org_register/hospital_verify', data);
export const getHospitals = () => http.get('/get_details?type=hospital');
export const verifyEmail = (data) => http.put('/org_register/hospital_edit', data);
export const signUpAPI= (data) => http.post('/register_category',data);
export const signInAPI= (data) => http.post('/login',data);
export const forgotPasswordAPI= (data) => http.post('/forgot_password',data);



// src/api/userApi.js
// export const loginUser = (credentials) => http.post('/login', credentials);
// export const fetchProfile = () => http.get('/user/profile');
