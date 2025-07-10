import React from "react";
import Button from "../../components/Button";
import AddIcon from "@mui/icons-material/Add";
import { Outlet, useOutletContext } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom";

const StaffDetails = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const handleAddWaiter = () => {
    navigate("/dashboard/staff/create");
  };

  const shouldShowButton = (
    pathname.includes('/staff-list') || 
    (!pathname.includes('/staff/create') && !pathname.match(/\/staff\/[^/]+$/))
  );

  const { restaurant } = useOutletContext();

  return (
    <main className="w-full">
      <div className="flex flex-col h-full w-full flex-grow">
        <div className="flex justify-between w-full px-[24px] pt-4 pb-4">
          <h1 className="text-xl md:text-2xl font-medium text-[#201F33]">
            Staff
          </h1>
          {shouldShowButton && (
            <Button
              variant="secondary"
              size="small"
              className="font-medium"
              onClick={() => {
                handleAddWaiter();
              }}
            >
              <AddIcon /> Add waiter
            </Button>
          )}
        </div>
        <div className="flex h-full w-full flex-grow px-2 md:px-10">
          <Outlet context={{restaurant}} />
        </div>
      </div>
    </main>
  );
};

export default StaffDetails;
