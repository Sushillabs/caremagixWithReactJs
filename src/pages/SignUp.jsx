import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

import { CIcon } from '@coreui/icons-react';
import { cilHospital } from '@coreui/icons';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import {
  getHospitals,
  registerHospital,
  verifyEmail,
  getFacilities,
  registerFacility,
  verifyFacilityEmail,
  signUpAPI,
} from '../api/hospitalApi';

const inputClass = 'border border-gray-300 w-full p-2 rounded text-sm';
const buttonClass = 'bg-resblue w-full p-2 rounded text-white font-bold hover:cursor-pointer hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed';
const EMAIL_PATTERN = { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Please enter a valid email' };

const ORG_BY_ROLE = {
  Physician: {
    prefix: 'hospital',
    label: 'Hospital',
    selectLabel: 'Select Hospital',
    fetchList: getHospitals,
    verify: verifyEmail,
    idKey: 'hospital_id',
  },
  Caregiver: {
    prefix: 'facility',
    label: 'Facility',
    selectLabel: 'Select Nursing Facility',
    fetchList: getFacilities,
    verify: verifyFacilityEmail,
    idKey: 'facility_id',
  },
};

const FACILITY_TYPES = ['SNF caregiver', 'homecare homebased'];

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
  const [orgs, setOrgs] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [isAddingNewOrg, setIsAddingNewOrg] = useState(false);
  const [verifyEmailValue, setVerifyEmailValue] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [popup, setPopup] = useState(null);
  const resetTimer = useRef(null);
  const roleRef = useRef('');

  const orgForm = useForm();
  const signUpForm = useForm();

  const org = ORG_BY_ROLE[role] || null;
  const selectedOrg = orgs.find((item) => String(item.id) === selectedOrgId) || null;
  const isPhysician = role === 'Physician';
  const isCaregiver = role === 'Caregiver';

  const fetchOrgs = async (forRole) => {
    try {
      const res = await ORG_BY_ROLE[forRole].fetchList();
      if (roleRef.current === forRole) setOrgs(res?.status === 'success' ? res.data : []);
    } catch (error) {
      if (roleRef.current === forRole) setPopup({ message: apiErrorMessage(error), isError: true });
    }
  };

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  const clearSelection = () => {
    setOrgs([]);
    setSelectedOrgId('');
    setIsAddingNewOrg(false);
    setVerifyEmailValue('');
    setShowPassword(false);
    orgForm.reset();
    signUpForm.reset();
  };

  const resetAll = () => {
    roleRef.current = '';
    setRole('');
    setPopup(null);
    clearSelection();
  };

  const showSuccessThenReset = (message) => {
    setPopup({ message, isError: false });
    clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(resetAll, 3000);
  };

  const handleRoleChange = (e) => {
    const nextRole = e.target.value;
    roleRef.current = nextRole;
    setRole(nextRole);
    clearSelection();
    if (ORG_BY_ROLE[nextRole]) fetchOrgs(nextRole);
  };

  const handleOrgChange = (e) => {
    const id = e.target.value;
    setSelectedOrgId(id);
    setIsAddingNewOrg(false);
    const item = orgs.find((o) => String(o.id) === id);
    setVerifyEmailValue(item?.email_id || '');
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

  const onRegisterOrg = (values) =>
    runRequest(() =>
      isPhysician
        ? registerHospital({
            hospital_name: values.name,
            address: values.address,
            email: values.email,
            phone: values.phone,
          })
        : registerFacility({
            facility_name: values.name,
            facility_type: values.facility_type,
            address: values.address,
            email: values.email,
            phone: values.phone,
            beds_available: values.beds_available,
          })
    );

  const onVerifyEmail = (e) => {
    e.preventDefault();
    runRequest(() => org.verify({ [org.idKey]: selectedOrg?.id, email: verifyEmailValue }));
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
        hospital_id: isPhysician ? selectedOrg?.id : undefined,
        specialization: isPhysician ? values.specialization : '',
        npi_number: isPhysician ? values.npi_number.trim() : '',
        facility_id: isCaregiver ? selectedOrg?.id : undefined,
        poa_full_name: '',
        poa_relationship: '',
        is_poa: false,
      })
    );

  const oErrors = orgForm.formState.errors;
  const sErrors = signUpForm.formState.errors;

  const withDigitsOnly = (reg) => ({
    ...reg,
    onChange: (e) => {
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
      return reg.onChange(e);
    },
  });
  const digitsOnly = (field) => withDigitsOnly(signUpForm.register(field.name, field.rules));
  const orgPhoneField = withDigitsOnly(orgForm.register('phone', { required: 'Phone number is required' }));

  const orgNameField = (
    <div className='relative'>
      <label htmlFor={`${org?.prefix}_name`}>{org?.label} Name</label>
      <input
        id={`${org?.prefix}_name`}
        type='text'
        placeholder={`${org?.label} Name`}
        className={`${inputClass} pr-9`}
        {...orgForm.register('name', { required: `${org?.label} Name is required` })}
      />
      <CIcon icon={cilHospital} className="h-4 w-6 absolute right-2 top-7 text-gray-500" />
      <FieldError error={oErrors.name} />
    </div>
  );

  const orgAddressField = (
    <div className='relative'>
      <label htmlFor={`${org?.prefix}_address`}>{org?.label} Address</label>
      <input
        id={`${org?.prefix}_address`}
        type='text'
        placeholder={`${org?.label} Address`}
        className={`${inputClass} pr-9`}
        {...orgForm.register('address', { required: `${org?.label} Address is required` })}
      />
      <CIcon icon={cilHospital} className="h-4 w-6 absolute right-2 top-7 text-gray-500" />
      <FieldError error={oErrors.address} />
    </div>
  );

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

        {org && <div>
          <select value={selectedOrgId} onChange={handleOrgChange} required className={inputClass}>
            <option value=''>{org.selectLabel}</option>
            {orgs.map((item) => (
              <option
                key={item.id}
                value={String(item.id)}
                style={item.email_confirmed ? undefined : { background: '#ccc' }}
              >
                {item.name}{!item.email_confirmed && '(Not Verified)'}
              </option>
            ))}
          </select>
          {!selectedOrg && <div className='text-sm text-addhosblue hover:cursor-pointer hover:underline w-fit mt-1' onClick={() => setIsAddingNewOrg(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5 inline-block">
              <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
            </svg>
            <span>  Add New {org.label}</span>
          </div>}
        </div>}

        {org && isAddingNewOrg && !selectedOrg && <form onSubmit={orgForm.handleSubmit(onRegisterOrg)} noValidate className='text-sm flex flex-col gap-3 font-bold'>
          {orgNameField}
          {isCaregiver && <div className='grid grid-cols-2 gap-2'>
            <div className='col-span-2 md:col-span-1'>
              <label htmlFor='facility_type'>Facility Type</label>
              <select
                id='facility_type'
                className={`${inputClass} font-normal`}
                {...orgForm.register('facility_type', { required: 'Facility Type is required' })}
              >
                <option value=''>Facility Type</option>
                {FACILITY_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
              <FieldError error={oErrors.facility_type} />
            </div>
            <div className='col-span-2 md:col-span-1'>
              <label htmlFor='facility_no_beds'>No of Beds Available</label>
              <input
                id='facility_no_beds'
                type='number'
                min={0}
                step={1}
                className={inputClass}
                {...orgForm.register('beds_available', {
                  required: 'No of Beds Available is required',
                  pattern: { value: /^\d+$/, message: 'Please enter a whole number' },
                })}
              />
              <FieldError error={oErrors.beds_available} />
            </div>
          </div>}
          {orgAddressField}
          <div className='grid grid-cols-2 gap-2'>
            <div className='col-span-2 md:col-span-1'>
              <label htmlFor={`${org.prefix}_email`}>Email</label>
              <input
                id={`${org.prefix}_email`}
                type='email'
                placeholder='Email'
                className={inputClass}
                {...orgForm.register('email', { required: 'Email is required', pattern: EMAIL_PATTERN })}
              />
              <FieldError error={oErrors.email} />
            </div>
            <div className='col-span-2 md:col-span-1'>
              <label htmlFor={`${org.prefix}_phone`}>Phone</label>
              <div className='flex items-stretch'>
                <span className='flex items-center px-2 border border-r-0 border-gray-300 rounded-l text-sm font-normal text-gray-600 bg-gray-50'>+1</span>
                <input
                  id={`${org.prefix}_phone`}
                  type='tel'
                  inputMode='numeric'
                  maxLength={10}
                  placeholder='Phone Number'
                  className={`${inputClass} rounded-l-none min-w-0`}
                  {...orgPhoneField}
                />
              </div>
              <FieldError error={oErrors.phone} />
            </div>
          </div>
          <button type='submit' disabled={busy} className={buttonClass}>Register {org.label}</button>
        </form>}

        {org && selectedOrg?.email_confirmed === false && <form onSubmit={onVerifyEmail} className='grid grid-cols-5 gap-2 items-end text-sm'>
          <div className='col-span-5 sm:col-span-4'>
            <label htmlFor={`${org.prefix}_email_verify`} className='font-bold'>{org.label} Email</label>
            <input
              id={`${org.prefix}_email_verify`}
              type='email'
              value={verifyEmailValue}
              onChange={(e) => setVerifyEmailValue(e.target.value)}
              placeholder={`${org.label} Email`}
              required
              className={inputClass}
            />
          </div>
          <div className='col-span-5 sm:col-span-1'>
            <button type='submit' disabled={busy} className={buttonClass}>Verify</button>
          </div>
        </form>}

        {org && selectedOrg?.email_confirmed === true && <form onSubmit={signUpForm.handleSubmit(onSignUp)} noValidate className='text-sm flex flex-col gap-3'>
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
                {...signUpForm.register('email', { required: 'Email is required', pattern: EMAIL_PATTERN })}
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
          {isPhysician && <div className='grid grid-cols-2 gap-2'>
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
          </div>}
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
          {isPhysician && <div>
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
          </div>}
          <button type='submit' disabled={busy} className={buttonClass}>Sign up</button>
        </form>}
      </div>
      <Popup popup={popup} onClose={() => setPopup(null)} />
    </div>
  )
}

export default SignUp
