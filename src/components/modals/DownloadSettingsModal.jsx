import React, { useState, useEffect, useContext } from 'react'
import DashboardContext from '../../contexts/dashboardContext'
import { Radio } from '@mui/material'


const DownloadSettingsModal = ({ setModal }) => {

    const { modalData, setModalData } = useContext(DashboardContext)
    const [selectedOption, setSelectedOption] = useState('selected')
    // const [downloadFor, setDownloadFor] = useState('')

    // useEffect(() => {
    //     if (modalData.for){
    //         setDownloadFor(modalData.for)
    //     }    // }, [modalData.for])

    const handleClose = () => {
        setModal(false)
        // Don't clear modalData completely, preserve existing data
        // setModalData({})
    }

    const handleOnClick = (option) => {
        if (option === 'selected') {
            setSelectedOption('selected')
        } else {
            setSelectedOption('all')
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (selectedOption === 'selected') {
            setModalData({ downloadMode: 'selected' })
            setModal(false)
        } else {
            setModalData({ downloadMode: 'all' })
            setModal(false)
        }
    }

    return (
        <div className="absolute bg-black/85 flex justify-center items-center w-full h-full p-6" style={{ zIndex: 1000 }}>

            <div className='bg-white p-6 flex flex-col gap-4 rounded-[12px]'>

                <h1 className='text-[18px] font-medium text-[#121212]' > do you want to download QRs for : </h1>

                <div className='flex items-center gap-4 px-2 py-1 bg-[#F8F7FA] rounded-[8px] cursor-pointer' onClick={()=>{handleOnClick('selected')}} >
                    <Radio
                        size="small"
                        sx={{
                            fontSize: 14,
                            fontFamily: "Satoshi",
                            color: "#323232",
                            "&.Mui-checked": {
                                color: "#323232",
                            },
                        }}
                        checked={selectedOption === 'selected'}
                        onClick={(e) => {
                            e.stopPropagation()
                            handleOnClick('selected')
                        }}
                    />
                    <span className='text-[14px] text-[#121212] cursor-pointer' onClick={()=>{handleOnClick('selected')}}> Selected outlet </span>
                </div>
                <div className='flex items-center gap-4 px-2 py-1 bg-[#F8F7FA] rounded-[8px] cursor-pointer' onClick={()=>{handleOnClick('all')}} >
                    <Radio
                        size="small"
                        sx={{
                            fontSize: 14,
                            fontFamily: "Satoshi",
                            color: "#323232",
                            "&.Mui-checked": {
                                color: "#323232",
                            },
                        }}
                        checked={selectedOption === 'all'}
                        onClick={(e) => {
                            e.stopPropagation()
                            handleOnClick('all')
                        }}
                    />
                    <span className='text-[14px] text-[#121212] cursor-pointer' onClick={()=>{handleOnClick('all')}}> All outlets </span>
                </div>
                <div className='flex justify-end items-center gap-4 w-full'>
                    <button className='flex justify-center items-center px-4 py-2 bg-[#000000] font-medium text-sm text-[white] rounded-[8px]' onClick={handleClose}>Cancel</button>
                    <button className='flex justify-center items-center px-4 py-2 bg-[#4B21E2] font-medium text-sm text-white rounded-[8px]' onClick={(e)=>{handleSubmit(e)}} >download</button>
                </div>
            </div>

        </div>
    )
}

export default DownloadSettingsModal