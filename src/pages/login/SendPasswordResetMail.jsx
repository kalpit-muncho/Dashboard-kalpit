import React, { useState } from 'react'
import emailImage from '../../assets/images/email_1.png'
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import { validateEmail } from '../../utils/validators';
import { useNavigate } from 'react-router-dom';
import CheckIcon from '@mui/icons-material/Check';
import { sendPasswordResetEmail } from '../../models/UserModel';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import EmailIcon from '@mui/icons-material/Email';
import { Mail } from '@mui/icons-material';

const SendPasswordResetMail = () => {
    const navigate = useNavigate();
    //set document title
    useState(() => {
        document.title = 'Reset Password | Muncho';
    }, []);

    const [emailSent, setEmailSent] = useState(false);
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const sentEmailClasses = "py-2 px-3 text-base md:py-2.5 md:px-3.5 md:text-lg w-full rounded-lg flex justify-center items-center cursor-pointer gap-2 h-fit whitespace-nowrap bg-[#7151E2] text-white"

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            validateEmail(email);
            //TODO: Handle send password reset mail logic here
            await sendPasswordResetEmail(email);
            setEmailSent(true);
            toast.success('Email sent successfully!', {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'dark',
            });
        } catch (error) {
            setError(error.message);
            toast.error(error.message, {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'dark',
            });
        }
    }
    return (
        <main className='w-screen h-screen flex p-8' >
            <ToastContainer />
            <div className='w-[50%] h-full flex items-center justify-center'>
                <img src={emailImage} alt="Email Illustration" className='w-[425px] h-[425px]' />
            </div>
            <div className='w-[50%] h-full flex flex-col bg-[#4B21E2] rounded-[20px]'>
                <div className='flex items-center justify-items-start w-full h-fit pt-6 px-6 '>
                    <button 
                        className='flex items-center justify-center px-4 py-3 border-[1px] border-[#E8E6ED] hover:border-gray-400 rounded-[8px] cursor-pointer hover:bg-gray-400/50 transition-colors duration-500 ease-in-out'
                        onClick={() => {
                            navigate('/login');
                        }}
                    >
                        <svg width="12" height="20" viewBox="0 0 12 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11.835 1.86998L10.055 0.0999756L0.165039 9.99998L10.065 19.9L11.835 18.13L3.70504 9.99998L11.835 1.86998Z" fill="white" />
                        </svg>
                    </button>
                </div>
                <div className='flex flex-col gap-10 items-center justify-center w-full h-full pb-16'>
                    <div className='flex flex-col text-center gap-4'>
                        <h1 className='text-xl text-white font-medium'>Contact Muncho</h1>
                        {/* <span className='text-md text-white'>We will send confirmation to your email</span> */}
                    </div>
                    <div className='flex flex-col gap-6 w-[300px] h-fit'>
                        {/* TODO */}
                        {/* <input
                            type="email"
                            className='py-3 px-4 bg-[#7151E2] text-white text-sm rounded-[8px] border-white border-2 w-full h-fit placeholder:text-white outline-0 outline-none'
                            placeholder='Email'
                            onChange={(e)=>{handleEmailChange(e)}}
                        />
                        <button
                            variant='tertiary' 
                            className={ emailSent ? sentEmailClasses : "py-2 px-3 text-base md:py-2.5 md:px-3.5 md:text-lg w-full rounded-lg flex justify-center items-center cursor-pointer gap-2 h-fit whitespace-nowrap bg-[#F8F7FA] text-black hover:bg-gray-200 transition-colors duration-500 disabled:bg-gray-500 disabled:cursor-not-allowed"}
                            onClick={(e)=>{handleSubmit(e)}}
                        >
                            {emailSent ? (
                                <span className='flex gap-2 items-center justify-center text-center font-medium'>
                                    Sent <CheckIcon />
                                </span>
                            ) : (
                                <span className='flex items-center justify-center text-center font-medium'>
                                    Continue
                                </span>
                            )}
                        </button> */}
                        <button
                            className="py-2 px-3 text-base md:py-2.5 md:px-3.5 md:text-lg w-full rounded-lg flex justify-center items-center cursor-pointer gap-2 h-fit whitespace-nowrap bg-[#F8F7FA] text-black hover:bg-gray-200 transition-colors duration-500 disabled:bg-gray-500 disabled:cursor-not-allowed"
                            onClick={() => {
                                window.location.href = 'mailto:support@muncho.in'
                            }}
                        >
                            <Mail />
                            Mail Us
                        </button>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default SendPasswordResetMail;