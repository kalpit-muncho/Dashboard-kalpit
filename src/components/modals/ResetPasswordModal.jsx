import React, { useState, useEffect } from 'react'
import CloseIcon from '@mui/icons-material/Close';
import { toast } from 'react-toastify';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import DoneAllOutlinedIcon from '@mui/icons-material/DoneAllOutlined';
import { validatePassword } from '../../utils/validators';

const ResetPasswordModal = ({ setModal }) => {
    const steps = [1, 2]
    const [step, setStep] = useState(1)

    const [disabled, setDisabled] = useState(true)
    const [error, setError] = useState("")
    const [currentPassword, setCurrentPassword] = useState('')
    const [form, setForm] = useState({
        newPassword: '',
        confirmPassword: ''
    })

    useEffect(() => {
        if (currentPassword === '') {
            setError("")
            setDisabled(true);
        } else {
            setDisabled(false);
        }
    }, [currentPassword])

    useEffect(() => {
        if (form.newPassword === '' || form.confirmPassword === '') {
            setError("")
            setDisabled(true);
        } else {
            setDisabled(false);
        }
    }, [form.newPassword, form.confirmPassword])    

    const closeModal = () => {
        setStep(1)
        setModal(false)
    }

    const onFormChange = (e) => {
        const { name, value } = e.target;
    
        setForm((prev) => {
            const updatedForm = { ...prev, [name]: value };
    
            // Only validate when confirmPassword is not empty
            if (name === "confirmPassword" || updatedForm.confirmPassword !== '') {
                if (updatedForm.newPassword !== updatedForm.confirmPassword) {
                    setError("Passwords do not match");
                    setDisabled(true);
                } else {
                    setError("");
                    setDisabled(false);
                }
            }
    
            return updatedForm;
        });
    };

    const onCurrentChange = (e) => {
        const { value } = e.target
        setCurrentPassword(value)
    }

    const handlePasswordChange = () => {
        try {
            validatePassword(form.newPassword); // Call the validation function
            if (form.newPassword === '' || form.confirmPassword === '') {
                setError("This Field is required");
                return;
            } 
            if (form.newPassword !== form.confirmPassword) {
                setError("Password does not match");
                setDisabled(true);
                return;
            }
            
            // If everything is valid, proceed
            setError("");
            setDisabled(false);
            
            toast.success("Password changed successfully", {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
            closeModal();
            
        } catch (error) {
            setError(error.message); // Set the error message from validation function
            setDisabled(true);
        }
    };
    

    const compareCurrentPassword = (currentPassword) => {
        try {
            if (currentPassword === '') {
                throw new Error("This Field is required")
            } else {
                setError(false)
                setDisabled(false)
            }
            if (currentPassword === "password") {
                setStep(2)
                setDisabled(true)
                return
            } else {
                setError("Incorrect password")
                throw new Error(error)
            }
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className='absolute bg-black/85 flex justify-center items-center w-full h-full p-6' style={{ zIndex: 1000 }}>
            <div className='bg-white w-[500px] h-[500px] rounded-lg flex flex-col'>
                <div className='flex w-full h-fit px-2 py-3 justify-end'>
                    <button className='p-1 w-fit h-fit cursor-pointer hover:bg-gray-200 rounded-full transition-colors duration-600' onClick={() => closeModal()}>
                        <CloseIcon className='text-black ' />
                    </button>
                </div>
                <div className='flex flex-col gap-4 items-center justify-center w-full h-fit py-2'>
                    <span className='text-[#666666] font-medium'>Steps</span>
                    <div className='flex gap-2 items-center justify-center w-full h-fit'>
                        {steps.map((item, index) => (
                            <div key={index} className={`flex justify-center items-center rounded-full w-10 h-10 ${step === item ? 'bg-[#121212] text-white' : 'bg-[#F8F7FA] text-[#666666]'}`} >
                                <span className='font-medium'>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
                {step === 1 ? (
                    <div className='flex flex-col w-full h-full pt-8'>
                        <div className='flex flex-col justify-between gap-4 px-12 py-4 w-full h-full'>
                            <div className='flex flex-col gap-2 w-full h-fit'>
                                <div className='flex flex-col gap-2 w-full h-fit'>
                                    <label htmlFor="currentPass">Current Password</label>
                                    <input
                                        type="text"
                                        name="currentPassword"
                                        placeholder="Enter current password"
                                        className={"bg-[#F8F7FA] py-2 px-4 pl-6 rounded-[12px] " + (error ? "outline-none border-[#E21B4B] border-1" : "outline-[#4B21E2]")}
                                        value={currentPassword}
                                        onChange={(e) => onCurrentChange(e)}
                                    />

                                </div>
                                {error && (
                                    <div className='flex gap-3 w-full h-fit items-center justify-end'>
                                        <ErrorOutlineOutlinedIcon className='text-[#E21B4B]' />
                                        <span className='text-[#E21B4B] text-sm font-medium'>{error}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className='flex w-full h-fit justify-end px-6 py-8'>
                            <button className='px-4 py-3 text-white bg-[#4B21E2] hover:bg-blue-500 disabled:text-[#666666] disabled:bg-[#ECECEC] disabled:hover:bg-gray-300 transition-colors duration-500 rounded-[8px] cursor-pointer' disabled={disabled} onClick={() => compareCurrentPassword(currentPassword)}>
                                <span className='font-medium '>Continue</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className='flex flex-col w-full h-full pt-8'>
                        <div className='flex flex-col justify-between gap-4 px-12 py-4 w-full h-full'>
                            <div className='flex flex-col gap-2 w-full h-fit'>
                                <div className='flex flex-col gap-4 w-full h-fit'>
                                    <label htmlFor="currentPass">New Password</label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        placeholder="create new password"
                                        className={"bg-[#F8F7FA] py-2 px-4 pl-6 rounded-[12px] " + (error ? "outline-none border-[#E21B4B] border-1" : "outline-[#4B21E2]")}
                                        value={form.newPassword}
                                        onChange={(e) => onFormChange(e)}
                                    />

                                    <input
                                        type="text"
                                        name="confirmPassword"
                                        placeholder="confirm new password"
                                        className={"bg-[#F8F7FA] py-2 px-4 pl-6 rounded-[12px] " + (error ? "outline-none border-[#E21B4B] border-1" : "outline-[#4B21E2]")}
                                        value={form.confirmPassword}
                                        onChange={(e) => onFormChange(e)}
                                    />
                                </div>
                                {error && (
                                    <div className='flex gap-3 w-full h-fit items-center justify-end'>
                                        <ErrorOutlineOutlinedIcon className='text-[#E21B4B]' />
                                        <span className='text-[#E21B4B] text-sm font-medium'>{error}</span>
                                    </div>
                                )}
                            </div>
                            <div className='flex w-full h-fit justify-end py-8 gap-4'>
                                <button className='px-4 py-3 text-[#121212] bg-[#F8F7FA] hover:bg-red-400 hover:text-white transition-colors duration-500 rounded-[8px] cursor-pointer' onClick={() => closeModal()}>
                                    <span className='font-medium '>Cancle</span>
                                </button>
                                <button className='px-4 py-3 text-white bg-[#4B21E2] hover:bg-blue-500 disabled:text-[#666666] disabled:bg-[#ECECEC] disabled:hover:bg-gray-300 transition-colors duration-500 rounded-[8px] cursor-pointer' disabled={disabled} onClick={handlePasswordChange}>
                                    <span className='font-medium '>Save</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ResetPasswordModal