import React, { useState, useContext, useEffect } from "react";
import DashboardContext from "../../contexts/dashboardContext";
import { Checkbox } from "@mui/material";
import { toast } from "react-toastify";
import { apiService } from "../../services/apiService";

const UpdateMenuModal = ({ setModal }) => {
    const { modalData, setModalData } = useContext(DashboardContext);

    const [outlets, setOutlets] = useState([]);
    const [selectedOutlets, setSelectedOutlets] = useState([]);

    useEffect(() => {
        const outlets = modalData.outlets.map((outlet) => ({
            id: outlet.id,
            externalLink: outlet.externalLink,
            name: outlet.name,
            checked: false,
        }));
        setOutlets(outlets);
    }, [modalData]);

    const handleClose = () => {
        setModal(false);
    }

    const handleChange = (e, id) => {
        const updatedOutlets = outlets.map((outlet) => {
            if (outlet.id === id) {
                return { ...outlet, checked: e.target.checked };
            }
            return outlet;
        });
        //store external links of selected outlets in selectedOutlets
        const selected = updatedOutlets.filter((outlet) => outlet.checked).map((outlet) => outlet.externalLink);
        setSelectedOutlets(selected);
        setOutlets(updatedOutlets);
        console.log("Selected outlets: ", selected);
    }

    const handleNameClick = (id) => {
        const checkbox = document.querySelector(`#checkbox-${id}`);
        if (checkbox) {
            checkbox.click();
        }
    }

    const handleUpdateMenu = async () => {
        try {
            const promises = selectedOutlets.map((externalLink) =>
                apiService.updateMenu(externalLink)
            );            setModal(false);
            // Don't clear modalData completely - this might interfere with other modals
            // setModalData({});

            await toast.promise(
                Promise.all(promises),
                {
                    pending: "Updating menu...",
                    success: "Menu updated successfully! Refreshing...",
                    error: "Error updating menu",
                },
                {
                    position: "top-center",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                }
            );

            // Refresh the page after all promises are resolved
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            console.error("Error updating menu: ", error);
        }
    };
    

    return (
        <div className="absolute bg-black/85 flex justify-end items-start w-full h-full p-6" style={{ zIndex: 1000 }}>
            <div className="flex flex-col bg-white rounded-[12px] p-4.5 mt-12 mr-6">
                <div className="flex flex-col gap-y-2.5">
                    {
                        outlets.map((outlet) => (
                            <div key={outlet.id} className="flex items-center gap-x-2 w-[240px] h-[40px] bg-[#F8F7FA] rounded-[8px] px-[12px] cursor-pointer" onClick={()=>handleNameClick(outlet.id)}>
                                <Checkbox
                                    checked={outlet.checked}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => handleChange(e, outlet.id)}
                                    sx={{
                                        padding: 0,
                                        margin: 0,
                                        "& .MuiSvgIcon-root": { fontSize: 18 },
                                        "&.Mui-checked": { color: "#65558F" },
                                    }}
                                    id={`checkbox-${outlet.id}`}
                                />
                                <span className="text-[#121212] text-[14px] cursor-default" >{outlet.name}</span>
                            </div>
                        ))
                    }
                </div>
                <div className='flex justify-end items-center gap-4 w-full pt-4'>
                    <button className='flex justify-center items-center px-4 py-2 bg-[#000000] font-medium text-sm text-white rounded-[8px] cursor-pointer' onClick={handleClose}>Cancel</button>
                    <button className='flex justify-center items-center px-4 py-2 bg-[#4B21E2] font-medium text-sm text-white rounded-[8px] cursor-pointer' onClick={()=>{handleUpdateMenu()}}  >Update</button>
                </div>
            </div>
        </div>
    )
}

export default UpdateMenuModal