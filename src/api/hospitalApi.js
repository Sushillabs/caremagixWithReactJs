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
export const getPccDataStatus = (jobId) => http.get(`/get_pcc_data/status/${jobId}`, { withAuth: true });
export const pullEpicData = () => http.get('/ehr_pull', { withAuth: true });
export const getEpicPullStatus = (jobId) => http.get(`/ehr_pull/status/${jobId}`, { withAuth: true });
export const getMetriportFacility = () => http.get('/get-facility', { withAuth: true });
export const createMetriportFacility = (data) => http.post('/create-facility', data, { withAuth: true });
export const updateMetriportFacility = (data) => http.put('/update-facility', data, { withAuth: true });
export const deleteMetriportFacility = () => http.delete('/delete-facility', { withAuth: true, data: {} });
export const pullMetriportPatients = (data) => http.post('/metriport/pull-patients-data', data, { withAuth: true });
export const getMetriportPullStatus = (jobId) => http.get(`/metriport/pull-patients-data/${jobId}`, { withAuth: true });
export const getProgress = (jobId) => http.get(`/ocr-progress/${jobId}`, { withAuth: true });
export const sendOTP = (data)=> http.post('/send-otp',data,{withAuth: true});
export const verifyOTP = (data)=> http.post('/verify-otp',data,{withAuth: true});
export const fillCMS485 = (data)=> http.post('/get_filled_485',data,{withAuth: true});
export const getICDCodes=()=>http.get(`/retrieve-patient-name?patient-type=ICD-Codes`,{withAuth: true})
export const getCPTCodes=()=>http.get(`/retrieve-patient-name?patient-type=CPT-Codes`,{withAuth: true})
export const getCallReport=()=>http.get(`/reports`,{withAuth: true})
export const generateCallReport = (data)=> http.post('/generate_report',data,{withAuth: true});
export const dischargePlan = (data)=> http.post('/discharge_plan_agent',data,{withAuth: true});
export const edit_visit_template= ()=> http.get('/discharge_plan_agent/edit_template',{withAuth: true})
export const update_visit_template= (data)=> http.post('/discharge_plan_agent/edit_template', data, {withAuth: true})
export const generateCarePlan = (data) => http.post('/generate_care_plan', data, { withAuth: true });
export const getCarePlan = (carePlanId) => http.get(`/care_plan/${carePlanId}`, { withAuth: true });
export const updateCarePlan = (carePlanId, care_plan_data) => http.put(`/care_plan/${carePlanId}`, { care_plan_data }, { withAuth: true });
export const exportCarePlanPdf = (carePlanId) => http.post('/export_care_plan_pdf', { care_plan_id: carePlanId }, { withAuth: true });


// http://127.0.0.1:5000/discharge_plan_agent/edit_template
// {
//     "fields": {
//         "vital": {
//             "question": "Vital Signs: What are the patient's temperature, pulse rate, respiratory rate, weight, blood pressure (right arm and left arm), glucometer usage, and blood sugar values?",
//             "check_prompt": "Are all vital sign values clearly provided with appropriate units and locations?"
//         },
//         "cardiovascular": {
//             "question": "What are the cardiovascular findings including chest pain, heart sounds, peripheral pulses, dizziness, edema (grade and site), neck vein distention, heart rate abnormalities, capillary refill, and other observations?",
//             "check_prompt": "Are cardiovascular assessments complete and clinically descriptive?"
//         },
//         "respiratory": {
//             "question": "What are the respiratory findings including lung sounds, shortness of breath, cough type, sputum characteristics, oxygen use, oxygen saturation, hemoptysis, cyanosis, orthopnea, and other observations?",
//             "check_prompt": "Are respiratory findings clearly documented with relevant qualifiers?"
//         },
//         "neurological": {
//             "question": "What are the neurological findings including seizures, tremors, pupillary reaction (right and left), equality of pupils, and neurological deficits?",
//             "check_prompt": "Are neurological assessments clearly documented and side-specific where applicable?"
//         },
//         "genitourinary_unit": {
//             "question": "What are the genitourinary findings including distention, retention, burning, urinary frequency, hematuria, oliguria, polyuria, catheter type, catheter size, and urine output?",
//             "check_prompt": "Are genitourinary findings complete and specific?"
//         },
//         "sensory": {
//             "question": "Does the patient have any sensory deficits such as hearing impairment, speech impairment (including slurred speech), visual impairment, or legal blindness?",
//             "check_prompt": "Are sensory deficits explicitly identified or ruled out?"
//         },
//         "skin": {
//             "question": "What are the skin findings including temperature, moisture, turgor, and any wound or IV-related care?",
//             "check_prompt": "Are skin assessments complete and descriptive?"
//         },
//         "digestive_nutrition": {
//             "question": "What are the digestive and nutritional findings including last bowel movement, nausea, vomiting, diarrhea, constipation, tube feeding details, NPO status, bowel sounds, abdominal girth, diet, meal preparation, and diet adequacy?",
//             "check_prompt": "Are digestive and nutritional assessments fully completed?"
//         },
//         "musculoskeletal": {
//             "question": "What musculoskeletal findings are present including weakness, endurance, balance, gait, tremors, mobility, pain, grip strength, bedbound or chairbound status, contractures, paralysis, assistive devices, and fall precautions?",
//             "check_prompt": "Are musculoskeletal limitations clearly documented?"
//         },
//         "pain": {
//             "question": "What is the patient's pain assessment including frequency, intensity, location, description, management effectiveness, pain goal, and progress toward the goal?",
//             "check_prompt": "Is pain assessment comprehensive and measurable?"
//         },
//         "infusion": {
//             "question": "What infusion-related assessments or procedures were performed including IV care, infusion details, and equipment used?",
//             "check_prompt": "Are infusion details clearly specified?"
//         },
//         "mental_health_affect": {
//             "question": "What are the patient's mental health and affect findings including behavior, mood, level of consciousness, orientation, and cognitive status?",
//             "check_prompt": "Is mental status assessment complete and consistent?"
//         },
//         "endocrine": {
//             "question": "What endocrine-related observations or interventions were present during this visit?",
//             "check_prompt": "Are endocrine findings clearly noted or ruled out?"
//         },
//         "skilled_intervention_teaching_response": {
//             "question": "What skilled interventions or teaching were provided and how did the patient or caregiver respond?",
//             "check_prompt": "Is patient or caregiver response clearly documented?"
//         },
//         "supervision": {
//             "question": "Was supervision present during this visit, and did the supervising individual follow the patient\u2019s plan of care, maintain open communication with patient representatives or caregivers, demonstrate competency with assigned tasks, comply with infection prevention and control policies, report changes in the patient\u2019s condition, honor patient rights, and provide any additional instruction during the visit? Include supervisor signature if applicable.",
//             "check_prompt": "Are all supervision-related compliance questions clearly answered with Yes or No, and is the supervisor signature documented if required?"
//         },
//         "coordination_plan": {
//             "question": "Who was conferenced with, regarding what issues, any physician contact details, order changes, patient agreement, plan for next visit, and discharge planning?",
//             "check_prompt": "Is care coordination and planning clearly documented?"
//         }
//     }
// }





