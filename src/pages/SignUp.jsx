import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

import { CIcon } from '@coreui/icons-react';
import { cilHospital } from '@coreui/icons';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { getHospitals, registerHospital, verifyEmail, signUpAPI } from '../api/hospitalApi';
import { useSelector, useDispatch } from 'react-redux';
import { addHospitalNames } from '../redux/hospitalSlice';

const inputClass = 'border border-gray-300 w-full p-2 rounded text-sm';
const buttonClass = 'bg-resblue w-full p-2 rounded text-white font-bold hover:cursor-pointer hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed';

const apiErrorMessage = (error) => {
  if (!error?.response) return 'Server is not reachable. Please try again later.';
  const data = error.response.data;
  return data?.error || data?.message || (typeof data === 'string' && data) || 'Something went wrong!';
};

const FieldError = ({ error }) => (error ? <p className='text-xs text-red-500 mt-1'>{error.message}</p> : null);

const Popup = ({ popup, onClose }) => {
  if (!popup) return null;
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'>
      <div className='bg-white rounded shadow-xl w-full max-w-sm p-5 flex flex-col items-center gap-3 text-center'>
        <div className={`rounded-full p-2 text-white ${popup.isError ? 'bg-red-500' : 'bg-green-500'}`}>
          {popup.isError ? <X size={24} /> : <Check size={24} />}
        </div>
        <p className='text-sm break-words'>{popup.message}</p>
        <button type='button' onClick={onClose} className='bg-resblue px-4 py-1.5 rounded text-white text-sm hover:bg-blue-800'>
          Close
        </button>
      </div>
    </div>
  );
};

const SignUp = () => {
  const [role, setRole] = useState('');
  const [selectedHospitalId, setSelectedHospitalId] = useState('');
  const [isAddingNewHospital, setIsAddingNewHospital] = useState(false);
  const [verifyEmailValue, setVerifyEmailValue] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [popup, setPopup] = useState(null);
  const resetTimer = useRef(null);

  const hospitalForm = useForm();
  const signUpForm = useForm();

  const hospitalNames = useSelector((state) => state.hospitalnames.value);
  const dispatch = useDispatch();

  const selectedHospital = hospitalNames.find((item) => String(item.id) === selectedHospitalId) || null;
  const isPhysician = role === 'Physician';

  const fetchHospitals = async () => {
    try {
      const res = await getHospitals();
      dispatch(addHospitalNames(res?.status === 'success' ? res.data : []));
    } catch (error) {
      setPopup({ message: apiErrorMessage(error), isError: true });
    }
  };

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  const resetAll = () => {
    setRole('');
    setSelectedHospitalId('');
    setIsAddingNewHospital(false);
    setVerifyEmailValue('');
    setShowPassword(false);
    setPopup(null);
    hospitalForm.reset();
    signUpForm.reset();
  };

  const showSuccessThenReset = (message) => {
    setPopup({ message, isError: false });
    clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(resetAll, 3000);
  };

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    setSelectedHospitalId('');
    setIsAddingNewHospital(false);
    if (e.target.value === 'Physician') fetchHospitals();
  };

  const handleHospitalChange = (e) => {
    const id = e.target.value;
    setSelectedHospitalId(id);
    setIsAddingNewHospital(false);
    const hospital = hospitalNames.find((item) => String(item.id) === id);
    setVerifyEmailValue(hospital?.email_id || '');
  };

  const runRequest = async (request) => {
    setBusy(true);
    try {
      const res = await request();
      showSuccessThenReset(res?.message);
    } catch (error) {
      setPopup({ message: apiErrorMessage(error), isError: true });
    } finally {
      setBusy(false);
    }
  };

  const onRegisterHospital = (values) =>
    runRequest(() =>
      registerHospital({
        hospital_name: values.hospital_name,
        address: values.hospital_address,
        email: values.hospital_email,
        phone: values.hospital_phone,
      })
    );

  const onVerifyEmail = (e) => {
    e.preventDefault();
    runRequest(() => verifyEmail({ hospital_id: selectedHospital?.id, email: verifyEmailValue }));
  };

  const onSignUp = (values) =>
    runRequest(() =>
      signUpAPI({
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        mobile_number: values.mobile_number,
        password: values.password,
        role,
        hospital_id: selectedHospital?.id,
        specialization: values.specialization,
        npi_number: values.npi_number.trim(),
        poa_full_name: '',
        poa_relationship: '',
        is_poa: false,
      })
    );

  const hErrors = hospitalForm.formState.errors;
  const sErrors = signUpForm.formState.errors;

  const withDigitsOnly = (reg) => ({
    ...reg,
    onChange: (e) => {
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
      return reg.onChange(e);
    },
  });
  const digitsOnly = (field) => withDigitsOnly(signUpForm.register(field.name, field.rules));
  const hospitalPhoneField = withDigitsOnly(hospitalForm.register('hospital_phone', { required: 'Phone number is required' }));

  return (
    <div className='grid grid-cols-12 md:ml-48 md:mr-48 mt-10 gap-1 rounded shadow-2xl border border-gray-300'>
      <div className='hidden md:block col-span-12 md:col-span-6' style={{ height: '530px' }}>
        <img src="images\signin2.jpg" alt="" className='w-full h-full object-cover' />
      </div>
      <div className='col-span-12 md:col-span-6 p-4 md:p-6 flex flex-col gap-4 md:max-h-[530px] md:overflow-y-auto'>
        <h1 className='text-signinFree font-semibold text-2xl md:text-3xl'>Sign up for free</h1>
        <p className='font-bold text-sm'>
          Already have an account
          <span> <Link to="/" className="text-blue-600 hover:underline">Sign In</Link></span>
        </p>
        <div className='text-sm flex flex-wrap gap-x-4 gap-y-2'>
          {[
            ['Physician', 'Physician/Practitioner'],
            ['Caregiver', 'SNF/Home Care/Caregiver'],
            ['Patient', 'Patient'],
          ].map(([value, label]) => (
            <label key={value} className='flex items-center gap-1'>
              <input type='radio' name='signup_roles' value={value} checked={role === value} onChange={handleRoleChange} />
              {label}
            </label>
          ))}
        </div>

        {isPhysician && <div>
          <select value={selectedHospitalId} onChange={handleHospitalChange} required className={inputClass}>
            <option value=''>Select Hospital</option>
            {hospitalNames.map((hospital) => (
              <option
                key={hospital.id}
                value={String(hospital.id)}
                style={hospital.email_confirmed ? undefined : { background: '#ccc' }}
              >
                {hospital.name}{!hospital.email_confirmed && '(Not Verified)'}
              </option>
            ))}
          </select>
          {!selectedHospital && <div className='text-sm text-addhosblue hover:cursor-pointer hover:underline w-fit mt-1' onClick={() => setIsAddingNewHospital(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5 inline-block">
              <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
            </svg>
            <span>  Add New Hospital</span>
          </div>}
        </div>}

        {isPhysician && isAddingNewHospital && !selectedHospital && <form onSubmit={hospitalForm.handleSubmit(onRegisterHospital)} noValidate className='text-sm flex flex-col gap-3 font-bold'>
          <div className='relative'>
            <label htmlFor='hospital_name'>Hospital Name</label>
            <input
              id='hospital_name'
              type='text'
              placeholder='Hospital Name'
              className={`${inputClass} pr-9`}
              {...hospitalForm.register('hospital_name', { required: 'Hospital Name is required' })}
            />
            <CIcon icon={cilHospital} className="h-4 w-6 absolute right-2 top-7 text-gray-500" />
            <FieldError error={hErrors.hospital_name} />
          </div>
          <div className='relative'>
            <label htmlFor='hospital_address'>Hospital Address</label>
            <input
              id='hospital_address'
              type='text'
              placeholder='Hospital Address'
              className={`${inputClass} pr-9`}
              {...hospitalForm.register('hospital_address', { required: 'Hospital Address is required' })}
            />
            <CIcon icon={cilHospital} className="h-4 w-6 absolute right-2 top-7 text-gray-500" />
            <FieldError error={hErrors.hospital_address} />
          </div>
          <div className='grid grid-cols-2 gap-2'>
            <div className='col-span-2 md:col-span-1'>
              <label htmlFor='hospital_email'>Email</label>
              <input
                id='hospital_email'
                type='email'
                placeholder='Email'
                className={inputClass}
                {...hospitalForm.register('hospital_email', {
                  required: 'Email is required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Please enter a valid email' },
                })}
              />
              <FieldError error={hErrors.hospital_email} />
            </div>
            <div className='col-span-2 md:col-span-1'>
              <label htmlFor='hospital_phone'>Phone</label>
              <div className='flex items-stretch'>
                <span className='flex items-center px-2 border border-r-0 border-gray-300 rounded-l text-sm font-normal text-gray-600 bg-gray-50'>+1</span>
                <input
                  id='hospital_phone'
                  type='tel'
                  inputMode='numeric'
                  maxLength={10}
                  placeholder='Phone Number'
                  className={`${inputClass} rounded-l-none min-w-0`}
                  {...hospitalPhoneField}
                />
              </div>
              <FieldError error={hErrors.hospital_phone} />
            </div>
          </div>
          <button type='submit' disabled={busy} className={buttonClass}>Register Hospital</button>
        </form>}

        {isPhysician && selectedHospital?.email_confirmed === false && <form onSubmit={onVerifyEmail} className='grid grid-cols-5 gap-2 items-end text-sm'>
          <div className='col-span-5 sm:col-span-4'>
            <label htmlFor='hospital_email_verify' className='font-bold'>Hospital Email</label>
            <input
              id='hospital_email_verify'
              type='email'
              value={verifyEmailValue}
              onChange={(e) => setVerifyEmailValue(e.target.value)}
              placeholder='Hospital Email'
              required
              className={inputClass}
            />
          </div>
          <div className='col-span-5 sm:col-span-1'>
            <button type='submit' disabled={busy} className={buttonClass}>Verify</button>
          </div>
        </form>}

        {isPhysician && selectedHospital?.email_confirmed === true && <form onSubmit={signUpForm.handleSubmit(onSignUp)} noValidate className='text-sm flex flex-col gap-3'>
          <div className='grid grid-cols-2 gap-2'>
            <div className='col-span-2 md:col-span-1'>
              <label htmlFor='first_name'>First Name</label>
              <input
                id='first_name'
                type='text'
                maxLength={100}
                className={inputClass}
                {...signUpForm.register('first_name', {
                  required: 'First Name is required',
                  minLength: { value: 3, message: 'First Name must be at least 3 characters' },
                  maxLength: { value: 100, message: 'First Name must be at most 100 characters' },
                })}
              />
              <FieldError error={sErrors.first_name} />
            </div>
            <div className='col-span-2 md:col-span-1'>
              <label htmlFor='last_name'>Last Name</label>
              <input
                id='last_name'
                type='text'
                maxLength={100}
                className={inputClass}
                {...signUpForm.register('last_name', {
                  required: 'Last Name is required',
                  minLength: { value: 3, message: 'Last Name must be at least 3 characters' },
                  maxLength: { value: 100, message: 'Last Name must be at most 100 characters' },
                })}
              />
              <FieldError error={sErrors.last_name} />
            </div>
          </div>
          <div className='grid grid-cols-2 gap-2'>
            <div className='col-span-2 md:col-span-1'>
              <label htmlFor='email'>Email</label>
              <input
                id='email'
                type='email'
                className={inputClass}
                {...signUpForm.register('email', {
                  required: 'Email is required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Please enter a valid email' },
                })}
              />
              <FieldError error={sErrors.email} />
            </div>
            <div className='col-span-2 md:col-span-1'>
              <label htmlFor='mobile_number'>Phone Number</label>
              <Controller
                name='mobile_number'
                control={signUpForm.control}
                rules={{ validate: (v) => (v && isValidPhoneNumber(v)) || 'Please enter a valid mobile number' }}
                render={({ field }) => (
                  <PhoneInput
                    {...field}
                    id='mobile_number'
                    placeholder='Phone Number'
                    defaultCountry='US'
                    limitMaxLength
                    className={inputClass}
                  />
                )}
              />
              <FieldError error={sErrors.mobile_number} />
            </div>
          </div>
          <div className='grid grid-cols-2 gap-2'>
            <div className='col-span-2 md:col-span-1'>
              <label htmlFor='npi_number'>NPI Number</label>
              <input
                id='npi_number'
                type='text'
                inputMode='numeric'
                maxLength={10}
                className={inputClass}
                {...digitsOnly({
                  name: 'npi_number',
                  rules: {
                    required: 'NPI Number is required',
                    pattern: { value: /^\d{10}$/, message: 'NPI must be exactly 10 digits.' },
                  },
                })}
              />
              <FieldError error={sErrors.npi_number} />
            </div>
            <div className='col-span-2 md:col-span-1'>
              <label htmlFor='npi_number_confirm'>Re-enter NPI Number</label>
              <input
                id='npi_number_confirm'
                type='text'
                inputMode='numeric'
                maxLength={10}
                className={inputClass}
                {...digitsOnly({
                  name: 'npi_number_confirm',
                  rules: {
                    required: 'Re-enter NPI Number is required',
                    validate: (v) => v === signUpForm.getValues('npi_number') || 'NPI numbers do not match. Please re-enter.',
                  },
                })}
              />
              <FieldError error={sErrors.npi_number_confirm} />
            </div>
          </div>
          <div className='relative'>
            <label htmlFor='password'>Password</label>
            <input
              id='password'
              type={showPassword ? 'text' : 'password'}
              maxLength={20}
              className={`${inputClass} pr-9`}
              {...signUpForm.register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Password must be at least 8 characters' },
                maxLength: { value: 20, message: 'Password must be at most 20 characters' },
              })}
            />
            <button
              type='button'
              onClick={() => setShowPassword((v) => !v)}
              className='absolute right-2 top-7 text-gray-400 hover:text-gray-600'
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            <FieldError error={sErrors.password} />
          </div>
          <div>
            <label htmlFor='specialization'>Specialization</label>
            <input
              id='specialization'
              type='text'
              className={inputClass}
              {...signUpForm.register('specialization', {
                required: 'Specialization is required',
                minLength: { value: 4, message: 'Specialization must be at least 4 characters' },
              })}
            />
            <FieldError error={sErrors.specialization} />
          </div>
          <button type='submit' disabled={busy} className={buttonClass}>Sign up</button>
        </form>}
      </div>
      <Popup popup={popup} onClose={() => setPopup(null)} />
    </div>
  )
}

export default SignUp
