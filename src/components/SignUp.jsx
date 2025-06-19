import React, { use } from 'react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { CIcon } from '@coreui/icons-react';
import { cilHospital } from '@coreui/icons';
// import PhoneInput from 'react-phone-input-2';
// import 'react-phone-input-2/lib/style.css';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

const SignUp = () => {

  const [signUpRole, setSignUpRole] = useState({});
  const [addNewHospital, setNewAddHospital] = useState(false);
  const [newHospitalInfo, setNewHospitalInfo] = useState({
    hospital_address: '',
    hospital_email: '',
    hospital_name: '',
    hospital_mobile: ''
  });
  const [finalNewHospitalInfo, setFinalNewHospitalInfo] = useState({});
  const [phone, setPhone] = useState('');

  const handleSignUpRoles = (e) => {
    setNewAddHospital(false);
    const { name, value } = e.target;
    setSignUpRole({ [name]: value });
    console.log('signup roles: ', signUpRole);
  }
  const handleAddNewHospital = () => {
    setNewAddHospital(true);
  }
  const handleHospitalInfo = (e) => {
    const { name, value } = e.target;
    setNewHospitalInfo({ ...newHospitalInfo, [name]: value });
    //  console.log('newHospitalInfo:', newHospitalInfo);
  }
  const submitHospitalInfo = (e) => {
    console.log('finalhospialinfo befor submit:', finalNewHospitalInfo);
    e.preventDefault();
    setFinalNewHospitalInfo({ ...newHospitalInfo, hospital_mobile: phone });
    // console.log('finalhospialinfo:', finalNewHospitalInfo);
    setNewHospitalInfo(null);
    setPhone(0);
  }
  console.log('finalhospialinfo:', finalNewHospitalInfo);
  // console.log(typeof mob, mob);
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
            </select>
          </div>
          <div className='text-sm text-addhosblue hover:cursor-pointer hover:underline' onClick={handleAddNewHospital}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5 inline-block">
              <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
            </svg>
            <span>  Add New Hospital</span>
          </div>
        </div>}
        {addNewHospital && <div>
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
                  onChange={(mob)=>setPhone(mob)}
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