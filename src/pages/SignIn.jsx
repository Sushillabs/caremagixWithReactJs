import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form';
import { forgotPasswordAPI, signInAPI } from '../api/hospitalApi';
import { useDispatch, useSelector } from 'react-redux';
import { setAuth } from '../redux/authSlice';

function SignIn() {
    const [isForgot, setIsForgot] = useState(false);
    const { control, register, handleSubmit, formState: { errors }, reset } = useForm();
    const navigate=useNavigate();
    const dispatch=useDispatch();
    const user=useSelector((state)=>state.auth.value);
    console.log('user',user);

    const onSignIn = async (signInData) => {
        console.log('sign-in data', signInData);
        try {
            const res = await signInAPI(signInData);
            console.log('sign-in res', res);
            localStorage.setItem('token',res.token);
            const redirectByRole = (role) => {
              switch (role) {
                case "caregiver":
                  return "/care-giver";
                case "physician":
                  return "/physician";
                case "patient":
                  return "/patient";
                default:
                  return "/unauthorized";
              }
            };
            navigate(redirectByRole(res.role));

            dispatch(setAuth(res));
            reset();
        } catch (error) {
            alert(error.message)
        }

    }

    const onSignInReset = async (resetEmail) => {
        console.log('resetEmail', resetEmail);

        try {
            const res = forgotPasswordAPI(resetEmail);
            console.log('reset email res', res);
        } catch (error) {
            alert(error.message)
        }
        reset();
    }
    return (
        <div className='grid grid-cols-12  md:ml-48 md:mr-48 mt-10 gap-1 p-2 rounded shadow-2xl border border-gray-300'>
            {!isForgot ? (<div className='col-span-12 md:col-span-6 md:p-6 flex  flex-col gap-3'>
                <h1 className='text-careGray text-2xl'>Start your journey</h1>
                <h1 className='text-signinFree font-semibold text-3xl'>Sign In</h1>
                <p className='font-bold text-sm'>
                    Don't have an account?
                    <span> <Link to="sign-up" className="text-blue-600 hover:underline">Sign Up</Link></span>
                </p>
                <form onSubmit={handleSubmit(onSignIn)}>
                    <div className='col-span-1 relative'>
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
                    <div className='text-sm text-addhosblue hover:cursor-pointer hover:underline w-fit' onClick={() => setIsForgot(true)}>
                        <span>  Forgot password?</span>
                    </div>
                    <div className='relative'>
                        <button type='submit' className='absolute top-6  bg-resblue w-full p-2 rounded text-white  hover:cursor-pointer hover:bg-blue-800'>Sign In</button>
                    </div>
                </form>
            </div>) : (
                <div className='col-span-12 md:col-span-6 md:p-6 flex  flex-col gap-3'>
                    {/* <h1 className='text-careGray text-2xl'>Start your journey</h1> */}
                    <h1 className='text-signinFree font-semibold text-3xl'>Forgot Password?</h1>
                    <p className="text-blue-600 w-fit font-semibold hover:cursor-pointer hover:underline"
                        onClick={() => setIsForgot(false)}
                    >
                        Sign In
                    </p>

                    <h1 className='font-bold text-sm'>Enter your email address below and we'll send you a link to reset your password.</h1>
                    <form onSubmit={handleSubmit(onSignInReset)}>
                        <div className='col-span-1 relative'>
                            <label htmlFor='email'> Email </label>
                            <br />
                            <input
                                id='email'
                                type='email'
                                className='border border-gray-300 w-full p-2 rounded '
                                {...register('email', { required: true })}
                            />
                            {errors.email && <p>Emaile is required</p>}
                        </div>
                        <div className='relative'>
                            <button type='submit' className='absolute top-6 bg-resblue w-full p-2 rounded text-white  hover:cursor-pointer hover:bg-blue-800'>Send Reset Link</button>
                        </div>
                    </form>
                </div>)}
            <div className='col-span-12 md:col-span-6 mt-16 md:mt-0' style={{ height: '530px' }}>
                <img src="images\signin1.jpg" alt="care-magix pic" className='w-full h-full object-cover' />
            </div>
        </div>
    )
}

export default SignIn