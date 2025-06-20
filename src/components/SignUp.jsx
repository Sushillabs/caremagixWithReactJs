import React, { use, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { CIcon } from '@coreui/icons-react';
import { cilHospital } from '@coreui/icons';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { getHospitals, registerHospital } from '../api/hospitalApi';
import { useSelector, useDispatch } from 'react-redux';
import { addHospitalNames } from '../redux/hospitalSlice';

const SignUp = () => {

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
  const hospitalNames=useSelector((state)=>state.hospitalnames.value);
  const dispatch=useDispatch();

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

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const res = await getHospitals();
        console.log('hospital lis',res);
        dispatch(addHospitalNames(res.data));
      } catch(error) {
        alert('error.message')
      }
    }
    fetchHospitals();
  }, [])
  console.log('hospial names:', hospitalNames);
  
  return (
    <div className='grid grid-cols-12  ml-48 mr-48 mt-10 gap-1 rounded shadow-2xl border border-gray-300'>
      <div className='col-span-6 ' style={{ height: '530px' }}>
        <img src="images\signin2.jpg" alt="" className='w-full h-full object-cover' />
      </div>
      <div className='col-span-6 p-6 flex  flex-col gap-4'>
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
              value={''}
              onChange={''}
              className='border border-gray-300 w-full p-2 rounded text-sm'
            >
              <option value=''>Select Hospital</option>
              {hospitalNames.map((hospital) => (
                <option key={hospital.id} value={hospital.name}>
                  {hospital.name}{!hospital.email_confirmed && '(not verified)'}
                </option>
              ))}
            </select>
          </div>
          <div className='text-sm text-addhosblue hover:cursor-pointer hover:underline' onClick={handleAddNewHospital}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5 inline-block">
              <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
            </svg>
            <span>  Add New Hospital</span>
          </div>
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
              <div className='col-span-1 relative'>
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

              <div className='col-span-1 relative'>
                <label htmlFor='hospital_mobile'> Mobile </label>
                <br />
                <PhoneInput
                  placeholder="Enter phone number"
                  defaultCountry="IN"
                  value={phone}
                  onChange={(mob) => setPhone(mob)}
                  className='border border-gray-300 py-2 w-full rounded '
                />
                <CIcon
                  icon={cilHospital}
                  className="h-4 w-6 absolute right-3 top-8 text-gray-500 "
                />
              </div>
            </div>
            <button type='submit' className=' bg-resblue w-full p-2 rounded text-white font-bold hover:cursor-pointer hover:bg-blue-800'>Register Hospital</button>
          </form>
        </div>}
      </div>
    </div>
  )
}

export default SignUp