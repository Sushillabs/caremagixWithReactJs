// src/api/hospitalApi.js
import http from './httpClient';

export const registerHospital = (data) => http.post('/org_register/hospital_verify', data);
export const getHospitals = () => http.get('/get_details?type=hospital');
export const verifyEmail = (data) => http.put('/org_register/hospital_edit', data);
export const signUpAPI= (data) => http.post('/register_category',data);
export const signInAPI= (data) => http.post('/login',data);
export const forgotPasswordAPI= (data) => http.post('/forgot_password',data);
export const getPatients = () => http.get('/retrieve-patient-name',{ withAuth: true});
export const getPatientChat = (data) => http.post('/generate_questions',data,{ withAuth: true});
export const askAPI = (data) => http.post('/ask',data,{ withAuth: true});
export const getDocRef = (data) => http.post('/doc-ref', data, { withAuth: true});
export const uploadEFaxConfig = (data) => http.post('/getfax',data);
export const uploadPlan = (data) => http.post('/upload', data, { withAuth: true, isMultipart: true });
export const deletePatient = (patient_type, patient_name) => http.delete(`/delete_patient?patient_type=${patient_type}&patient_name=${patient_name}`, {withAuth: true});



