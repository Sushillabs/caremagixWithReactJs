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
export const uploadEFaxConfig = (data) => http.post('/getfax',data,{ withAuth: true});
export const uploadPlan = (data) => http.post('/upload', data, { withAuth: true, isMultipart: true });
export const uploadPatientImage = (data) => http.post('/ocr-upload', data, { withAuth: true, isMultipart: true });
export const deletePatient = (patient_type, patient_name, patient_date) => http.delete(`/delete_patient?patient_type=${patient_type}&patient_name=${patient_name}&dates=${patient_date}`, {withAuth: true});
export const getCallDetail = (data) => http.post('/get-details',data,{ withAuth: true });
export const registerCall = (data) => http.post('/register-call',data,{ withAuth: true });
export const unregisterCall = (data) => http.post('/pause_call',data,{ withAuth: true });
export const mmta = (data) => http.post('/mmta',data,{ withAuth: true });
export const getPccData = () => http.get('/get_pcc_data', { withAuth: true });
export const getProgress = (jobId) => http.get(`/ocr-progress/${jobId}`, { withAuth: true });
export const sendOTP = (data)=> http.post('/send-otp',data,{withAuth: true});
export const verifyOTP = (data)=> http.post('/verify-otp',data,{withAuth: true});
export const fillCMS485 = (data)=> http.post('/get_filled_485',data,{withAuth: true});
export const getICDCodes=()=>http.get(`/retrieve-patient-name?patient-type=ICD-Codes`,{withAuth: true})
export const getCPTCodes=()=>http.get(`/retrieve-patient-name?patient-type=CPT-Codes`,{withAuth: true})
export const getCallReport=()=>http.get(`/reports`,{withAuth: true})
export const generateCallReport = (data)=> http.post('/generate_report',data,{withAuth: true});






