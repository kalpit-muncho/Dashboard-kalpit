import React, { useEffect, useState } from 'react'
import EditIcon from '@mui/icons-material/Edit'
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import { toast } from 'react-toastify';
import CloseIcon from '@mui/icons-material/Close';

const menuItems = [
    {
        id: 'veg',
        label: 'Vegetarian',
        color: '#4CAF50',
        icon: <path d="M20.9981 3.5V5.5C20.9981 15.127 15.6251 19.5 8.99807 19.5H7.09607C7.30807 16.488 8.24607 14.665 10.6941 12.499C11.8981 11.434 11.7961 10.819 11.2031 11.172C7.11907 13.602 5.09007 16.886 5.00007 22.13L4.99707 22.5H2.99707C2.99707 21.137 3.11307 19.9 3.34307 18.768C3.11374 17.474 2.99874 15.718 2.99807 13.5C2.99807 7.977 7.47507 3.5 12.9981 3.5C14.9981 3.5 16.9981 4.5 20.9981 3.5Z" />
    },
    {
        id: 'non-veg',
        label: 'Non Veg',
        color: '#D84343',
        icon: <path d="M20.1599 13.2302C20.825 12.5661 21.3322 11.7609 21.6441 10.8743C21.956 9.98776 22.0646 9.0424 21.9619 8.10818C21.8591 7.17397 21.5477 6.2748 21.0506 5.47718C20.5535 4.67956 19.8834 4.0039 19.0899 3.50017C17.0799 2.17017 14.3899 2.16017 12.3599 3.47017C10.5999 4.60017 9.62993 6.36017 9.45993 8.18017C9.32993 9.50017 8.82993 10.7302 7.90993 11.6502L7.87993 11.6802C6.71993 12.8402 6.71993 14.6102 7.80993 15.6902L8.79993 16.6802C9.32386 17.2037 10.0342 17.4979 10.7749 17.4979C11.5156 17.4979 12.226 17.2037 12.7499 16.6802C13.7199 15.7102 14.9999 15.1802 16.3899 15.0302C17.7599 14.8802 19.0999 14.2802 20.1599 13.2302ZM6.25993 20.3602C6.52993 20.9202 6.43993 21.6002 5.96993 22.0602C5.76638 22.2668 5.50694 22.4095 5.22344 22.4708C4.93995 22.5321 4.64472 22.5094 4.37397 22.4053C4.10323 22.3013 3.86874 22.1205 3.69927 21.8851C3.5298 21.6497 3.43272 21.3699 3.41993 21.0802C3.13017 21.0674 2.85043 20.9703 2.61504 20.8008C2.37964 20.6314 2.19883 20.3969 2.09478 20.1261C1.99073 19.8554 1.96796 19.5602 2.02927 19.2767C2.09059 18.9932 2.23331 18.7337 2.43993 18.5302C2.89993 18.0702 3.58993 17.9702 4.13993 18.2402L6.61993 15.8102C6.75993 16.0002 6.91993 16.2202 7.09993 16.4002L8.08993 17.3902C8.29993 17.5902 8.49994 17.7602 8.75993 17.9102L6.25993 20.3602Z" />
    },
    {
        id: 'egg',
        label: 'Eggs',
        color: '#C8B439',
        icon: <path d="M12 21.5C10.05 21.5 8.396 20.821 7.038 19.463C5.68 18.105 5.00067 16.4507 5 14.5C5 13.2167 5.21267 11.925 5.638 10.625C6.06333 9.325 6.61333 8.146 7.288 7.088C7.96267 6.03 8.71667 5.16733 9.55 4.5C10.3833 3.83267 11.2 3.49933 12 3.5C12.8167 3.5 13.6377 3.83333 14.463 4.5C15.2883 5.16667 16.0383 6.02933 16.713 7.088C17.3877 8.14667 17.9377 9.32567 18.363 10.625C18.7883 11.9243 19.0007 13.216 19 14.5C19 16.45 18.321 18.1043 16.963 19.463C15.605 20.8217 13.9507 21.5007 12 21.5ZM13 18.5C13.2833 18.5 13.521 18.404 13.713 18.212C13.905 18.02 14.0007 17.7827 14 17.5C13.9993 17.2173 13.9033 16.98 13.712 16.788C13.5207 16.596 13.2833 16.5 13 16.5C12.1667 16.5 11.4583 16.2083 10.875 15.625C10.2917 15.0417 10 14.3333 10 13.5C10 13.2167 9.904 12.9793 9.712 12.788C9.52 12.5967 9.28267 12.5007 9 12.5C8.71733 12.4993 8.48 12.5953 8.288 12.788C8.096 12.9807 8 13.218 8 13.5C8 14.8833 8.48767 16.0627 9.463 17.038C10.4383 18.0133 11.6173 18.5007 13 18.5Z" />
    },
    {
        id: 'liquor',
        label: 'Alcoholic',
        color: '#3C40E5',
        icon: <path d="M10.4142 12.9142C10.7893 13.2893 11 13.798 11 14.3284V17.5C11 18.6046 10.1046 19.5 9 19.5H7C6.44772 19.5 6 19.9477 6 20.5C6 21.0523 6.44772 21.5 7 21.5H17C17.5523 21.5 18 21.0523 18 20.5C18 19.9477 17.5523 19.5 17 19.5H15C13.8954 19.5 13 18.6046 13 17.5V14.3284C13 13.798 13.2107 13.2893 13.5858 12.9142L20.5858 5.91421C20.851 5.649 21 5.28929 21 4.91421C21 4.13317 20.3668 3.5 19.5858 3.5H4.41421C3.63316 3.5 3 4.13317 3 4.91421C3 5.28929 3.149 5.649 3.41421 5.91421L10.4142 12.9142Z" />
    }
];

const AssignTypeButton = ({ onChange, onClick, setOpen, open }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [openType, setOpenType] = useState(false)
    const [selectedType, setSelectedType] = useState('')

    useEffect(() => {
        if (!open){
            setIsOpen(false);
            setOpenType(false);
            setSelectedType('');
        }
    }, [open]);

    const handleClick = () => {
        if (onClick) {
            onClick(setIsOpen);
        }
    }

    const handleTypeSelect = (type) => {
        setSelectedType(type);
    };

    const handleClose = () => {
        setIsOpen(false);
        setOpenType(false);
        setSelectedType('');
        if (setOpen) {
            setOpen(false);
        }
    }

    const handleSave = () => {
        if (!selectedType) {
            toast.error('Please select a type', {
                position: 'top-right',
                autoClose: 2000,
                theme: 'dark'
            });
            return;
        }
        if (onChange) {
            onChange(selectedType);
        }
        setIsOpen(false);
        setOpenType(false);
        setSelectedType('');
    }

    return (
        <div className="relative">
            {isOpen ?
                <>
                    <button
                        className={`flex p-2 items-center justify-center rounded-full cursor-pointer hover:bg-gray-100 transition-colors duration-300 w-fit h-fit bg-[#EEEBFA]`}
                        onClick={() => setOpenType(true)}
                        >
                        <FilterAltOutlinedIcon className="text-[#4B21E2]" />
                    </button>
                </>
                :
                <button
                    className={`flex p-2 items-center justify-center rounded-full cursor-pointer w-fit h-fit bg-[#F8F7FA]`}
                    onClick={handleClick}
                >
                    <EditIcon className="text-[#5C5C7A]" />
                </button>
            }

            {openType && (
                <div className="absolute top-12 right-0 bg-white shadow-lg rounded-[16px] overflow-hidden" style={{ zIndex: 100 }}>
                    <div className="flex flex-col gap-1">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                className={`py-[24px] flex justify-between items-center w-[215px] h-[60px] hover:bg-gray-50 transition-colors duration-300 ${selectedType === item.id ? 'bg-[#F8F7FA]' : 'bg-white'}`}
                                onClick={() => handleTypeSelect(item.id)}
                            >
                                <div className='flex items-center gap-[10px] px-[24px]'>
                                    <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        {React.cloneElement(item.icon, { fill: item.color })}
                                    </svg>
                                    <span className='text-[14px] font-normal text-[#5C5C7A]'>
                                        {item.label}
                                    </span>
                                </div>
                                <div 
                                    className='flex justify-end h-[60px] w-[16px] rounded-full pr-[1px]'
                                    style={{
                                        backgroundColor: item.color,
                                    }}
                                >
                                </div>
                            </button>
                        ))}
                    </div>
                    {
                        selectedType !== '' && 
                        <div className='flex gap-[10px] justify-end w-full p-[12px]'>
                            <button
                                className='py-[8px] px-[16px] bg-[#F8F7FA] flex items-center justify-center rounded-[8px] font-medium text-[#201F33]'
                                onClick={handleClose}
                            >
                                Cancel
                            </button>
                            <button
                                className='py-[8px] px-[16px] bg-[#201F33] flex items-center justify-center rounded-[8px] font-medium text-[#FFFFFF]'
                                onClick={handleSave}
                            >
                                Save
                            </button>
                        </div>
                    }
                </div>
            )}
        </div>
    )
}

export default AssignTypeButton