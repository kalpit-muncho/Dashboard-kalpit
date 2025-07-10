import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Edit } from "@mui/icons-material";
import { getStaffList, updateStaffStatus } from "../../models/StaffDataModel";
import { Switch } from "@mui/material";
import { styled } from "@mui/system";
import { toast } from "react-toastify";
import Loadiing from "../../components/Loading";

const WaiterList = () => {
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const navigate = useNavigate();

  const handleEditButton = (staff) => {
    navigate(`/dashboard/staff/${staff.id}`, {
      state: { staff },
    });
  };

  useEffect(() => {
    fetchStaffList();
  }, []);

  const fetchStaffList = async () => {
    try {
      setLoading(true);
      const restaurantId = localStorage.getItem("restaurantId");
      const data = await getStaffList(restaurantId);
      setStaffList(data);
    } catch (error) {
      console.error("Error fetching staff list:", error);
      toast.error(error.message, { position: "top-right" });
    } finally {
      setLoading(false);
    }
  };

  const CustomSwitch = styled(Switch)(() => ({
    width: 34,
    height: 18,
    padding: 0,
    "& .MuiSwitch-switchBase": {
      padding: 3,
      "&.Mui-checked": {
        transform: "translateX(16px)",
        color: "#fff",
        "& + .MuiSwitch-track": {
          backgroundColor: "#000",
          opacity: 1,
        },
      },
    },
    "& .MuiSwitch-thumb": {
      width: 12,
      height: 12,
    },
    "& .MuiSwitch-track": {
      borderRadius: 10,
      backgroundColor: "#D1D5DB",
      opacity: 1,
    },
  }));

  const handleActiveSwitch = async (e, id, currentStatus) => {
    try {
      e.disabled = true;
      const response = await updateStaffStatus(
        id,
        currentStatus === "active" ? false : true
      );
      if (response.status === true) {
        toast.success(response.message, { position: "top-right", autoClose: 1000, theme: "dark" });
        // Update the staffList state to reflect the change
        setStaffList(prevStaffList =>
          prevStaffList.map(staff =>
            staff.id === id
              ? { ...staff, status: currentStatus === "active" ? "inactive" : "active" }
              : staff
          )
        );
      }
    } catch (error) {
      e.disabled = false;
      console.error("Error updating status:", error);
      toast.error(error.message, 
        { 
          position: "top-right",
          theme:"dark",
          autoClose: 2000
        }
      );
    } finally {
      e.disabled = false;
    }
  };

  if (loading) {
    return <Loadiing />;
  }

  return (
    <section className="w-full h-full overflow-hidden relative">
      <div className="max-w-full mx-auto overflow-y-auto max-h-[calc(100vh-76px)] relative">
        <table className="w-full table-auto relative">
          <thead className="text-[18px] font-medium border-b-[1.5px] border-[#E8E6ED] sticky top-0 bg-white z-[100]">
            <tr className="text-[#727272] text-left">
              <th className="py-3 px-4 text-center text-sm w-1/4">Name</th>
              <th className="py-3 px-4 text-center text-sm w-1/4">
                Last login
              </th>
              <th className="py-3 px-4 text-center text-sm w-1/4">Status</th>
              <th className="py-3 px-4 text-center text-sm w-1/4">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {staffList.map((staff) => (
              <tr
                key={staff.id}
                className="transition-colors duration-500 hover:bg-gray-100 text-[16px]"
                title={ staff.role === "admin" ? "Admin" : "" }
              >
                <td className="py-5 px-4 text-center text-black text-sm w-1/4">
                  {staff.name}
                </td>
                <td className="py-5 px-4 text-center text-[#727272] text-sm w-1/4">
                  {staff.lastLogin}
                </td>
                <td className="py-5 px-4 text-center w-1/4">
                  <CustomSwitch
                    checked={staff.status === "active" ? true : false}
                    onChange={(e) => handleActiveSwitch(e,staff.id, staff.status)}
                    disabled={staff.role === "admin" ? true : false}
                    title={ staff.role === "admin" ? "Can not change status" : "Change Status" }
                    className="cursor-pointer disabled:cursor-not-allowed"
                  />
                </td>
                <td className="py-5 px-4 text-center w-1/4">
                  <button
                    onClick={() => handleEditButton(staff)}
                    className="cursor-pointer disabled:cursor-not-allowed"
                    disabled={staff.role === "admin"}
                    title={ staff.role === "admin" ? "Can not edit admin" : "Edit Staff" }
                  >
                    <Edit className={ staff.role === "admin" ? "text-gray-500 text-sm" : "text-black text-sm"} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default WaiterList;
