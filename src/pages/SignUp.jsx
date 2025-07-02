import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

import { CIcon } from '@coreui/icons-react';
import { cilHospital } from '@coreui/icons';
import { useForm, Controller } from 'react-hook-form';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { getHospitals, registerHospital, verifyEmail, signUpAPI } from '../api/hospitalApi';
import { useSelector, useDispatch } from 'react-redux';
import { addHospitalNames } from '../redux/hospitalSlice';

const SignUp = () => {
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [signUpRole, setSignUpRole] = useState({});
  const [isAddingNewHospital, setIsAddingNewHospital] = useState(false);
  const [newHospitalInfo, setNewHospitalInfo] = useState({
    hospital_address: '',
    hospital_email: '',
    hospital_name: '',
    hospital_mobile: ''
  });
  // const [finalNewHospitalInfo, setFinalNewHospitalInfo] = useState({});
  const [phone, setPhone] = useState('');
  const { control, register, handleSubmit, formState: { errors } } = useForm();

  const hospitalNames = useSelector((state) => state.hospitalnames.value);
  const dispatch = useDispatch();

  const handleSignUpRoles = (e) => {
    setIsAddingNewHospital(false);
    const { name, value } = e.target;
    setSignUpRole({ [name]: value });
    console.log('signup roles: ', signUpRole);
  }
  const handleAddNewHospital = () => {
    setIsAddingNewHospital(true);
  }
  const handleHospitalInfo = (e) => {
    const { name, value } = e.target;
    setNewHospitalInfo({ ...newHospitalInfo, [name]: value });
    //  console.log('newHospitalInfo:', newHospitalInfo);
  }
  const submitHospitalInfo = async (e) => {
    e.preventDefault();

    // Compose payload directly from current state
    const create_hospital_data = {
      hospital_name: newHospitalInfo.hospital_name,
      address: newHospitalInfo.hospital_address,
      email: newHospitalInfo.hospital_email,
      phone: phone,
      signup_role: signUpRole.signup_roles,
    };

    console.log('Sending to backend:', create_hospital_data);

    try {
      const res = await registerHospital(create_hospital_data);
      console.log('Register Hospital Success:', res);

      // Optional: set final state after success
      // setFinalNewHospitalInfo(create_hospital_data);

      // Reset form after success
      setNewHospitalInfo({
        hospital_address: '',
        hospital_email: '',
        hospital_name: '',
        hospital_mobile: '',
      });
      setPhone('');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleEmailVerification = (e) => {
    setIsAddingNewHospital(false);
    const selectedId = (e.target.value);
    console.log('sected hospital id', selectedId);
    const selected = hospitalNames.find(item => item.id === selectedId);
    setSelectedHospital(selected);
  }

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    const verify_hospital_email = {
      hospital_id: selectedHospital?.id,
      email: selectedHospital?.email_id,
    };
    try {
      const res = await verifyEmail(verify_hospital_email);
    } catch (error) {
      console.error('Email verfication failed');
      alert(error.message);
    }

  }

  const onSignUp = async (signUpData) => {

    const create_hospital_data = {
      first_name: signUpData?.first_name,
      last_name: signUpData?.last_name,
      email: signUpData?.email,
      mobile_number: signUpData?.hospital_mobile,
      password: signUpData?.password,
      role: signUpRole?.signup_roles,
      hospital_id: selectedHospital?.id,
      specialization: signUpData?.specialization,
    };
    console.log('signup', create_hospital_data);
    try {
      const res = await signUpAPI(create_hospital_data);
      console.log('Sign Up Res', res);
    } catch (error) {
      alert(error.message);
    }

  }

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const res = await getHospitals();
        console.log('hospital lis', res);
        dispatch(addHospitalNames(res.data));
      } catch (error) {
        alert('error.message')
      }
    }
    fetchHospitals();
  }, [newHospitalInfo])
  console.log('hospial names:', hospitalNames);

  return (
    <div className='grid grid-cols-12  md:ml-48 md:mr-48 mt-10 gap-1 rounded shadow-2xl border border-gray-300'>
      <div className='hidden md:block col-span-12 md:col-span-6' style={{ height: '530px' }}>
        <img src="images\signin2.jpg" alt="" className='w-full h-full object-cover' />
      </div>
      <div className='col-span-12 md:col-span-6 p-6 flex  flex-col gap-4'>
        <h1 className='text-signinFree font-semibold text-3xl'>Sign up for free</h1>
        <p className='font-bold text-sm'>
          Already have an account
          <span> <Link to="/" className="text-blue-600 hover:underline">Sign In</Link></span>
        </p>
        <div className='text-sm flex gap-2'>
          <label className=''>
            <input
              type='radio'
              name='signup_roles'
              value='Physician'
              checked={signUpRole?.signup_roles === 'Physician'}
              onChange={handleSignUpRoles}
            />
            Physician/Practitioner
          </label>
          <label className=''>
            <input
              type='radio'
              name='signup_roles'
              value='Caregiver'
              checked={signUpRole?.signup_roles === 'Caregiver'}
              onChange={handleSignUpRoles}
            />
            SNF/Caregiver
          </label>
          <label className=''>
            <input
              type='radio'
              name='signup_roles'
              value='Patient'
              checked={signUpRole?.signup_roles === 'Patient'}
              onChange={handleSignUpRoles}
            />
            Patient
          </label>

        </div>
        {signUpRole?.signup_roles && <div>
          <div>
            <select
              value={selectedHospital?.id || ''}
              onChange={handleEmailVerification}
              className='border border-gray-300 w-full p-2 rounded text-sm'
            >
              <option value=''>Select Hospital</option>
              {hospitalNames.map((hospital) => (
                <option key={hospital.id} value={hospital.id}>
                  {hospital.name}{!hospital.email_confirmed && '(Not Verified)'}
                </option>
              ))}
            </select>
          </div>
          {!selectedHospital && <div className='text-sm text-addhosblue hover:cursor-pointer hover:underline' onClick={handleAddNewHospital}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5 inline-block">
              <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
            </svg>
            <span>  Add New Hospital</span>
          </div>}
        </div>}
        {isAddingNewHospital && <div>
          <form onSubmit={submitHospitalInfo} className='text-sm flex flex-col gap-5 mt-2 font-bold'>
            <div className='relative '>
              <label htmlFor='hospital_name'> Hospital Name </label>
              <br />
              <input
                type='text'
                name='hospital_name'
                id='hospital_name'
                value={newHospitalInfo?.hospital_name || ''}
                onChange={handleHospitalInfo}
                placeholder='Hospital Name'
                required
                className='border border-gray-300 w-full p-2 rounded '
              />
              <CIcon
                icon={cilHospital}
                className="h-4 w-6 absolute right-3 top-8 text-gray-500 "
              />
            </div>
            <div className='relative '>
              <label htmlFor='hospital_address'> Hospital Address </label>
              <br />
              <input
                type='text'
                name='hospital_address'
                id='hospital_address'
                value={newHospitalInfo?.hospital_address || ''}
                onChange={handleHospitalInfo}
                placeholder='Hospital Address'
                required
                className='border border-gray-300 w-full p-2 rounded '
              />
              <CIcon
                icon={cilHospital}
                className="h-4 w-6 absolute right-3 top-8 text-gray-500 "
              />
            </div>
            <div className='grid grid-cols-2 gap-2'>
              <div className='col-span-2 md:col-span-1 relative'>
                <label htmlFor='hospital_email'>Email</label>
                <br />
                <input
                  type='email'
                  name='hospital_email'
                  id='hospital_email'
                  value={newHospitalInfo?.hospital_email || ''}
                  onChange={handleHospitalInfo}
                  placeholder='Email'
                  required
                  className='border border-gray-300 w-full p-2 rounded '
                />
                <CIcon
                  icon={cilHospital}
                  className="h-4 w-6 absolute right-3 top-8 text-gray-500 "
                />
              </div>

              <div className='col-span-2 md:col-span-1 relative'>
                <label htmlFor='hospital_mobile' className="block mb-1 text-sm font-medium">Mobile</label>

                <Controller
                  name="hospital_mobile"
                  control={control}
                  rules={{ required: 'Phone number is required' }}
                  render={({ field }) => (
                    <PhoneInput
                      {...field}
                      id="hospital_mobile"
                      placeholder="Enter phone number"
                      defaultCountry="IN"
                      className="border border-gray-300 py-2 w-full rounded  md:pl-10"
                    />
                  )}
                />
                {errors.hospital_mobile && (
                  <span className="text-sm text-red-500">{errors.hospital_mobile.message}</span>
                )}

                <CIcon
                  icon={cilHospital}
                  className="h-4 w-6 absolute right-3 top-[43px] text-gray-500"
                />
              </div>
            </div>
            <button type='submit' className=' bg-resblue w-full p-2 rounded text-white font-bold hover:cursor-pointer hover:bg-blue-800'>Register Hospital</button>
          </form>
        </div>}
        {selectedHospital?.email_confirmed === false && <form onSubmit={handleVerifyEmail} className='grid grid-cols-5 gap-2'>
          <div className='col-span-4 relative'>
            <label htmlFor='hospital_email_verify'> Hospital Email </label>
            <br />
            <input
              type='email'
              name='hospital_email_verify'
              id='hospital_email_verify'
              value={selectedHospital?.email_id || ''}
              onChange={(e) => setSelectedHospital({ ...selectedHospital, email_id: e.target.value })}
              placeholder='Hospital Email'
              required
              className='border border-gray-300 w-full p-2 rounded '
            />
            <CIcon
              icon={cilHospital}
              className="h-4 w-6 absolute right-3 top-9 text-gray-500 "
            />
          </div>
          <div className='col-span-1 relative'>
            <button type='submit' className='absolute top-6 bg-resblue w-full p-2 rounded text-white  hover:cursor-pointer hover:bg-blue-800'>Verify</button>
          </div>
        </form>}

        {selectedHospital?.email_confirmed === true && <form onSubmit={handleSubmit(onSignUp)} >
          <div className='grid grid-cols-2 gap-2'>
            <div className='col-span-2 md:col-span-1 relative'>
              <label htmlFor='first_name'> First Name </label>
              <br />
              <input
                id='first_name'
                type='text'
                className='border border-gray-300 w-full p-2 rounded '
                {...register('first_name', { required: true })}
              />
              {errors.first_name && <p>First Name is required</p>}
            </div>
            <div className='col-span-2 md:col-span-1 relative'>
              <label htmlFor='last_name'> Last Name </label>
              <br />
              <input
                id='last_name'
                type='text'
                className='border border-gray-300 w-full p-2 rounded '
                {...register('last_name', { required: true })}
              />
              {errors.last_name && <p>Last Name is required</p>}
            </div>
          </div>
          <div className='grid grid-cols-2 gap-2'>
            <div className='col-span-2 md:col-span-1 relative'>
              <label htmlFor='email'> Email </label>
              <br />
              <input
                id='eamil'
                type='email'
                className='border border-gray-300 w-full p-2 rounded '
                {...register('email', { required: true })}
              />
              {errors.email && <p>Emaile is required</p>}
            </div>
            <div className='col-span-2 md:col-span-1 relative'>
              <label htmlFor='hospital_mobile'>Mobile</label>

              <Controller
                name="hospital_mobile"
                control={control}
                rules={{ required: 'Phone number is required' }}
                render={({ field }) => (
                  <PhoneInput
                    {...field}
                    id="hospital_mobile"
                    placeholder="Enter phone number"
                    defaultCountry="IN"
                    className="border border-gray-300 py-2 w-full rounded"
                  />
                )}
              />
              {errors.hospital_mobile && (
                <span className="text-sm text-red-500">{errors.hospital_mobile.message}</span>
              )}

            </div>
          </div>
          <div className='col-span-1 relative'>
            <label htmlFor='password'> Password </label>
            <br />
            <input
              id='password'
              type='password'
              className='border border-gray-300 w-full p-2 rounded '
              {...register('password', { required: true })}
            />
            {errors.password && <p>password is required</p>}
          </div>
          <div className='col-span-1 relative'>
            <label htmlFor='specialization'> Specialization </label>
            <br />
            <input
              id='specialization'
              type='text'
              className='border border-gray-300 w-full p-2 rounded '
              {...register('specialization', { required: true })}
            />
            {errors.specialization && <p>Specialization is required</p>}
          </div>
          <div className='relative'>
            <button type='submit' className='absolute top-6 bg-resblue w-full p-2 rounded text-white  hover:cursor-pointer hover:bg-blue-800'>Sign Up</button>
          </div>
        </form>}
      </div>
    </div>
  )
}

export default SignUp