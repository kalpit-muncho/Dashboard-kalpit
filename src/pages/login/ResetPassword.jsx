import React, {useState, useEffect} from 'react'
import img from '../../assets/images/reset_pass.png'
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { validatePassword } from '../../utils/validators';
import { useParams } from 'react-router-dom';
import { validatePasswordResetToken } from '../../models/UserModel';

const ResetPassword = () => {
    const navigate = useNavigate();
    //set document title
    useEffect(() => {
        document.title = 'Reset Password | Muncho';
    }, []);

    const { authToken } = useParams();
    const [isValid, setIsValid] = useState(false);

    useEffect(() => {
        const isTokenValid = validatePasswordResetToken(authToken);
        setIsValid(isTokenValid); // Update state
    
        if (isTokenValid) {
            console.log('Token is valid');
        } else {
            console.log('Token is invalid');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        }
    }, [authToken, navigate]); // Correct dependencies
    

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }

    const comparePasswords = () => {
        if (formData.password !== formData.confirmPassword) {
            throw new Error('Passwords do not match');
        }
        validatePassword(formData.password);
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        try {
            comparePasswords();
            //TODO: Handle reset password logic here
            toast.success('Password reset successfully!', {
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
            console.error(`Error: ${error.message}`);
            toast.error(`Failed to reset password: ${error.message}`, {
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

    if (!isValid) {
        return (
            <main className='w-screen h-screen flex p-8' >
                <ToastContainer />
                <div className='w-full h-full flex items-center justify-center text-white'>
                    <h1 className='text-xl text-slate-900 font-medium'>Invalid Token</h1>

                </div>
            </main>
        )
    }
    
    return (
        <main className='w-screen h-screen flex p-8' >
            <ToastContainer />
            <div className='w-[50%] h-full flex items-center justify-center'>
                <img src={img} alt="Email Illustration" />
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
                        <h1 className='text-xl text-white font-medium'>Create new Password</h1>
                        <span className='text-md text-white'>your new password should be strong</span>
                    </div>
                    <div className='flex flex-col gap-6 w-[300px] h-fit'>
                        <input
                            type="password"
                            name='password'
                            className='py-3 px-4 bg-[#7151E2] text-sm text-white rounded-[8px] border-white border-2 w-full h-fit placeholder:text-white outline-0 outline-none'
                            placeholder='Create a strong password'
                            onChange={(e) => { handleChange(e) }}
                        />
                        <input
                            type="text"
                            name='confirmPassword'
                            className='py-3 px-4 bg-[#7151E2] text-sm text-white rounded-[8px] border-white border-2 w-full h-fit placeholder:text-white outline-0 outline-none'
                            placeholder='Rewrite password'
                            onChange={(e) => { handleChange(e) }}
                        />
                        <button
                            variant='tertiary'
                            className="py-2 px-3 text-base md:py-2.5 md:px-3.5 md:text-lg w-full rounded-lg flex justify-center items-center cursor-pointer gap-2 h-fit whitespace-nowrap bg-[#F8F7FA] text-black hover:bg-gray-200 transition-colors duration-500 disabled:bg-gray-500 disabled:cursor-not-allowed"
                            onClick={(e) => { handleSubmit(e) }}
                        >
                            <span className='flex items-center justify-center text-center font-medium'>
                                Continue
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default ResetPassword