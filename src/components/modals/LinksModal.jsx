import React, { useState, useContext } from 'react'
import DashboardContext from '../../contexts/dashboardContext';
import { v4 as uuidv4 } from 'uuid';
import InstagramIcon from '@mui/icons-material/Instagram';
import XIcon from '@mui/icons-material/X';
import FacebookIcon from '@mui/icons-material/Facebook';
import GoogleIcon from '@mui/icons-material/Google';
import { SiSwiggy, SiZomato, SiBookmyshow, SiPaytm } from "react-icons/si";
import { LiaTripadvisor } from "react-icons/lia";
import CloseIcon from '@mui/icons-material/Close';
import LinkIcon from '@mui/icons-material/Link';
import { toast } from 'react-toastify';
import { validateURL } from '../../utils/validators';

const LinksModal = () => {
    const [activeIndex , setActiveIndex] = useState(7);
    const [form, setForm] = useState({ title: '', link: '', icon: '' });
    const [selectedIcon, setSelectedIcon] = useState('');

    const icons = [
        { id: 1, name: 'Instagram', icon: 'instagram', component: <InstagramIcon fontSize='large' /> },
        { id: 2, name: 'Facebook', icon: 'facebook', component: <FacebookIcon fontSize='large'/> },
        { id: 3, name: 'X', icon: 'x', component: <XIcon /> },
        { id: 4, name: 'Google', icon: 'google', component: <GoogleIcon fontSize='large' /> },
        { id: 5, name: 'Swiggy', icon: 'swiggy', component: <SiSwiggy size={35} /> },
        { id: 6, name: 'Zomato', icon: 'zomato', component: <SiZomato size={35} /> },
        { id: 7, name: 'BookMyShow', icon: 'bookmyshow', component: <SiBookmyshow size={35} /> },
        { id: 8, name: 'Tripadvisor', icon: 'tripadvisor', component: <LiaTripadvisor size={35} /> },
        { id: 9, name: 'Paytm', icon: 'paytm', component: <SiPaytm size={35} /> },
        { id: 10, name:'Default', icon:'default', component: <LinkIcon  fontSize='large'/> }
    ]

    const { setLinksModal, links, setLinks } = useContext(DashboardContext);

    const handleClose = () => {
        setLinksModal(false);
    }

    const handleSelect = (index, icon) => {
        setActiveIndex(index);
        setSelectedIcon(icon);
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    }

    const handleAddLink = () => {
        try {
            // Validate URL
            validateURL(form.link);
            if (form.title === '') {
                throw new Error('Please enter a title');
            }
            if (form.link === '') {
                throw new Error('Please enter a link');
            }
    
            const maxPriority = links.length > 0 ? Math.max(...links.map(link => link.priority ?? 0)) : 0;
    
            const newLink = {
                id: uuidv4(),
                title: form.title,
                icon: selectedIcon === '' ? 'default' : selectedIcon,
                link: form.link,
                active: true,
                priority: maxPriority + 1,
            };
    
            setLinks([...links, newLink]);
            setForm({ title: '', link: '', icon: '' });
            setActiveIndex(7);
            setLinksModal(false);
            toast.success('Link added successfully!', {
                position: "top-right",
                theme: "dark",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        } catch (error) {
            console.error(error.message, error);
            toast.error(error.message, {
                position: "top-right",
                theme: "light",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
    };
    
    
  return (
    <div className='absolute bg-black/85 flex justify-center items-center w-full h-full p-6' style={{zIndex: 1000}}>
        <div className='bg-white rounded-md p-4 flex flex-col gap-4 w-[30vw] h-[80vh]'>
            <div className='flex w-full justify-end'>
                <button className='p-2 cursor-pointer' onClick={handleClose}>
                    <CloseIcon fontSize='medium'/>
                </button>
            </div>
            <div className='flex flex-col justify-between w-full h-full px-10 pb-12'>
                <div className='flex flex-col w-full gap-6'>
                    <div className='w-full text-sm'>
                        <input placeholder='Write title' type="text" name='title' onChange={(e)=>{handleChange(e)}} className='outline-[#4B21E2] w-full px-6 py-2 rounded-xl bg-[#F8F7FA]' />
                    </div>
                    <div className='w-full text-sm'>
                        <input placeholder='Enter link address here..' type="url" name='link' onChange={(e)=>{handleChange(e)}} className='outline-[#4B21E2] w-full px-6 py-2 rounded-xl bg-[#F8F7FA]' />
                    </div>
                    <div className='grid grid-cols-3 gap-2 w-fit'>
                        {icons.map((icon, index) => (
                            <button key={index} className={'flex flex-col items-center justify-center p-1 ' + (activeIndex === index ? "border-1 border-[#4B21E2] text-[#4B21E2]" : "")} onClick={() => handleSelect(index, icon.icon)}>
                                <div className='w-10 h-10 flex items-center justify-center'>
                                    {icon.component}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
                <div className='flex justify-end items-center gap-4 w-full'>
                    <button className='flex justify-center items-center px-4 py-2 bg-[#F8F7FA] font-medium text-sm rounded-xl' onClick={handleClose}>Cancel</button>
                    <button className='flex justify-center items-center px-4 py-2 bg-[#4B21E2] font-medium text-sm text-white rounded-xl' onClick={handleAddLink}>Add</button>
                </div>
            </div>
        </div>
    </div>
  )
}

export default LinksModal