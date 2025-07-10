import React, { useEffect } from "react";
import { useContext } from "react";
import DashboardContext from "../../contexts/dashboardContext";
import Checkbox from "@mui/material/Checkbox";
import CloseIcon from "@mui/icons-material/Close";
import { createSection } from "../../models/TableDataModel";
import { toast } from "react-toastify";

const CreateSectionModal = () => {
  const [name, setName] = React.useState("");
  const [section, setSection] = React.useState([]);
  const [tables, setTables] = React.useState([]);
  const [outlet, setOutlet] = React.useState({});
  const { setCreateSection, modalData } = useContext(DashboardContext);

  useEffect(() => {
    if (modalData) {
      setTables(modalData.tables || []);
      setOutlet(modalData.outlet || {});
      if (modalData.section) {
        setName(modalData.section.sectionName || '');
        setSection(modalData.section.tablesList || []);
      }
    }
  }, [modalData]);

  // Close modal function
  const closeModal = () => {
    setCreateSection(false);
  };

  const handleChange = (e) => {
    setName(e.target.value);
  };

  // Get selected tables and create a section
  const handleSelect = (e, table) => {
    const { checked } = e.target;
    setSection((prev) =>
      checked
        ? [...prev, { name: table.name }]
        : prev.filter((t) => t.name !== table.name) // Remove if unchecked
    );
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      const newSection = {
        outletId: outlet.id,
        sectionName: name,
        tablesList: section.map((table) => table.name),
      };
      console.log("New Section: ", newSection);
      const resp = createSection(newSection);
      toast.promise(
        resp,
        {
          pending: "Creating section...",
          success: "Section created successfully",
          error: "Error creating section",
        },
        {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        }
      );
      await resp;
      setCreateSection(false);
      window.location.reload();
    } catch (error) {
      console.error("Error creating section: ", error);
      toast.error("Error creating section: " + error.message, {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  };

  return (
    <div className='absolute bg-black/85 flex justify-center items-center w-full h-full' style={{ zIndex: 1000 }}>
      <div className='flex flex-col justify-between px-[54px] py-[30px] bg-white rounded-md' >
        <div className="flex justify-end items-center">
          <button
            className="flex items-center justify-center p-2 rounded-full hover:bg-gray-200 transition-colors duration-500 cursor-pointer"
            onClick={closeModal}
          >
            <CloseIcon fontSize="small" />
          </button>
        </div>
        <div className="flex flex-col items-center justify-center w-fit h-full pt-4">
          <div className="w-full mb-6 text-sm">
            <input
              type="text"
              name="name"
              placeholder="Title of Section"
              className="px-3 py-2 pl-5 bg-[#F8F7FA] outline-[#5c5c7a98] rounded-[12px] w-full"
              onChange={handleChange}
              value={name}
            />
          </div>
          <div className="text-black w-full text-left mb-4 text-sm">Select Tables</div>
          <div className="grid grid-cols-4 gap-y-5 gap-x-10 max-h-[300px] overflow-y-auto">
            {(tables || []).map((table, index) => (
              <div key={index} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    name={table.name}
                    checked={section.some(t => t.name === table.name)}
                    onChange={(e) => handleSelect(e, table)}
                    disableRipple
                    sx={{
                      padding: 0,
                      margin: 0,
                      "& .MuiSvgIcon-root": {
                        margin: 0,
                        fontSize: 18,
                      },
                      "&.Mui-checked": {
                        color: "#65558F",
                      },
                    }}
                  />
                  <label className="text-[#5C5C7A] font-medium text-sm">
                    {table.name}
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-4 justify-end py-4 pt-[34px] w-full">
          <button className="px-3 py-1 text-sm font-medium rounded-lg bg-gray-100 cursor-pointer" onClick={closeModal}>
            Cancel
          </button>
          <button
            className="px-3 py-1 text-sm font-medium rounded-lg bg-[#4B21E2] text-white cursor-pointer"
            onClick={handleSubmit}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateSectionModal;
