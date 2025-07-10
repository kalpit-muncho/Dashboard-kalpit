import React, { useState, useEffect, useContext } from "react";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import Dropdown from "../../components/Dropdown";
import Button from "../../components/Button";
import Loading from "../../components/Loading";
import AddIcon from "@mui/icons-material/Add";
import Checkbox from "@mui/material/Checkbox";
import DashboardContext from "../../contexts/dashboardContext";
import RadioDropdown from "../../components/RadioDropdown";
import { toast } from "react-toastify";
import { useNavigate, useOutletContext } from "react-router-dom";
import { createStaff } from "../../models/StaffDataModel";
import { deleteSection } from "../../models/TableDataModel";

const CreateStaff = () => {
  const navigate = useNavigate();
  const [selectedOutlet, setSelectedOutlet] = useState("");
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tables, setTables] = useState([]);
  const [filteredTables, setFilteredTables] = useState([]);
  const [selectedSection, setSelectedSection] = useState("");
  const [activeIndex, setActiveIndex] = useState(null);
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [sections, setSections] = useState([]);
  const [stwCodes, setStwCodes] = useState([]);
  const { restaurant } = useOutletContext();

  // States for staff details
  const [staffName, setStaffName] = useState("");
  const [selectedStwCode, setSelectedStwCode] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [permissions, setPermissions] = useState({
    transferBills: false,
    printBills: false,
    settlement: false,
    modifications: false,
  });
  const [selectedTables, setSelectedTables] = useState([]);
  const { setCreateSection, setModalData } = useContext(DashboardContext);

  const handleModalOpen = () => {
    setCreateSection(true);
  };

  const handleEditSection = (sectionName) => {
    const outlet = outlets.find((outlet) => outlet.name === selectedOutlet);
    setModalData({ 
      tables: tables,  // Pass all tables
      outlet: outlet,
      section: {
        sectionName: sectionName,
        tablesList: filteredTables.map(table => ({ name: table.name }))
      }
    });
    setCreateSection(true);
  };

  useEffect(() => {
    const fetchRest = async () => {
      try {
        if (!restaurant?.stewardList) return;
        const codes = restaurant.stewardList.map(stw => stw.STWCOD);
        setStwCodes(codes);

        // Set outlets here since we know restaurant data is available
        if (restaurant.outlets && restaurant.outlets.length > 0) {
          setOutlets(restaurant.outlets);
          setSelectedOutlet(restaurant.outlets[0].name);
        }
      } catch (error) {
        console.error("Error fetching steward data:", error);
      }
    };
    fetchRest();
  }, [restaurant]);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        if (!selectedOutlet || !outlets?.length) return;

        const outlet = outlets.find(o => o.name === selectedOutlet);
        if (!outlet) return;

        // Initialize empty table list if none exists
        const tableList = outlet.tableList || [];
        
        const tables = tableList.map(table => ({
          name: table.tableNumber || table.name,
          section: table.tableSection || table.section,
        }));

        // Filter out sections that are null/undefined and get unique values
        const sections = [...new Set(tables
          .map(table => table.section)
          .filter(Boolean))];
        setSections(sections);

        const sortedTables = [...tables].sort((a, b) => {
          const numA = parseInt(a.name.replace(/\D/g, ""), 10) || 0;
          const numB = parseInt(b.name.replace(/\D/g, ""), 10) || 0;
          return numA - numB;
        });

        setTables(sortedTables);
        setFilteredTables(sortedTables);
        
        // Update modal data
        setModalData({ 
          tables: sortedTables, 
          sections, 
          outlet 
        });

      } catch (error) {
        console.error("Error in fetchTables:", error);
        toast.error("Error loading tables", {
          position: "top-right",
          autoClose: 2000,
          theme: "dark",
        });
      }
    };
    
    fetchTables();
  }, [selectedOutlet, outlets]);

  useEffect(() => {
    const filtered = selectedSection
      ? tables.filter((table) => table.section === selectedSection)
      : tables;
    setFilteredTables(filtered);
  }, [selectedSection, tables]);

  useEffect(() => {
    // Update isSelectAll whenever filteredTables or selectedTables changes
    updateSelectAllState();
  }, [filteredTables, selectedTables, selectedOutlet]);

  const updateSelectAllState = () => {
    if (filteredTables.length === 0) {
      setIsSelectAll(false);
      return;
    }

    const outletCode = outlets.find(
      (outlet) => outlet.name === selectedOutlet
    )?.code;
    const tableNamesInView = filteredTables.map((t) => t.name);

    const allSelected = tableNamesInView.every((name) =>
      selectedTables.some(
        (st) => st.tableName === name && st.outletCode === outletCode
      )
    );

    setIsSelectAll(allSelected);
  };

  if (loading) {
    return <Loading />;
  }

  const handleChange = (e) => {
    const { value } = e.target;
    setStaffName(value);
  };

  const handleSelect = (e, table) => {
    const outlet = outlets.find(
      (outlet) => outlet.name === selectedOutlet
    );
    const outletCode = outlet?.code;
    const outletId = outlet?.id;
    const isChecked = e.target.checked;
    const tableInfo = { tableName: table.name, outletCode, outletId };

    setSelectedTables((prev) =>
      isChecked
        ? [...prev, tableInfo]
        : prev.filter(
          (item) =>
            !(item.tableName === table.name && item.outletCode === outletCode)
        )
    );
  };

  const handleSelectAll = (e) => {
    const outlet = outlets.find(
      (outlet) => outlet.name === selectedOutlet
    );
    const outletCode = outlet?.code;
    const outletId = outlet?.id;
    const checked = e.target.checked;

    if (checked) {
      // Add all current filtered tables to selection
      const tableInfos = filteredTables.map((table) => ({
        tableName: table.name,
        outletCode,
        outletId,
      }));

      setSelectedTables((prev) => {
        // Keep selections from other sections/outlets
        const filtered = prev.filter((item) => {
          // Keep if not in current outlet or not in current filtered tables
          return (
            item.outletCode !== outletCode ||
            !filteredTables.some((t) => t.name === item.tableName)
          );
        });
        return [...filtered, ...tableInfos];
      });
    } else {
      // Remove only tables from current filtered view
      setSelectedTables((prev) =>
        prev.filter((item) => {
          return (
            item.outletCode !== outletCode ||
            !filteredTables.some((t) => t.name === item.tableName)
          );
        })
      );
    }
  };

  const handleSectionSelect = (section, index) => {
    if (index === activeIndex) {
      setActiveIndex(null);
      setSelectedSection("");
    } else {
      setActiveIndex(index);
      setSelectedSection(section);
    }
    // The isSelectAll state will be updated in the useEffect
  };

  const handleOutletSelect = (outlet) => {
    // Only update the selected outlet, do not clear selectedTables
    setSelectedOutlet(outlet);
    // Optionally, reset section selection and activeIndex for new outlet view
    setSelectedSection("");
    setActiveIndex(null);
  };

  const handleRoleSelect = (role) => {
    // Convert role to lowercase
    setSelectedRole(role.toLocaleLowerCase());
  };

  const handleStwCodeSelect = (stwCode) => {
    setSelectedStwCode(stwCode);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handlePhoneChange = (e) => {
    setPhone(e.target.value);
  };

  const handlePermissionChange = (e) => {
    const { name, checked } = e.target;
    setPermissions((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const validateForm = () => {
    const toastConfig = {
      position: "top-right",
      autoClose: 2000,
      theme: "dark",
    }
    if (!selectedOutlet) {
      toast.error("Please select an outlet", toastConfig);
      return false;
    }
    if (!selectedStwCode) {
      toast.error("Please select a STW code", toastConfig);
      return false;
    }
    if (!staffName) {
      toast.error("Please enter a name", toastConfig);
      return false;
    }
    if (!phone) {
      toast.error("Please enter a phone number", toastConfig);
      return false;
    }
    if (phone.length < 10) {
      toast.error("Please enter a valid phone number", toastConfig);
      return false;
    }
    if (!password) {
      toast.error("Please enter a password", toastConfig);
      return false;
    }
    if (selectedTables.length === 0) {
      toast.error("Please assign at least one table", toastConfig);
      return false;
    }
    return true;
  }

  const formatPermissions = (perm) => {
    if( perm === "transferBills") {
      return "Table Transfer";
    } else if (perm === "printBills") {
      return "Print Bills";
    } else if (perm === "settlement") {
      return "Settlement";
    } else if (perm === "modifications") {
      return "Modifications";
    }
  }

  const handleSubmit = async () => {
    try {
      if (!validateForm()) {
        return;
      }

      const formData = {
        restaurant_id: localStorage.getItem("restaurantId"),
        name: staffName,
        stwCode: selectedStwCode,
        mobile: phone,
        role: selectedRole.toLowerCase(),
        password: password,
        permissions: {
          transferBills: permissions?.transferBills || false,
          printBills: permissions?.printBills || false,
          settlement: permissions?.settlement || false,
          modifications: permissions?.modifications || false,
        },
        assignedTables: selectedTables.map(table => ({
          tableName: table.tableName,
          outletCode: table.outletCode,
          outletId: table.outletId
        }))
      };

      const res = createStaff(formData);
      toast.promise(
        res,
        {
          pending: "Creating staff...",
          success: "Staff created successfully",
          error: "Error creating staff",
        },
        {
          position: "top-right",
          autoClose: 2000,
          theme: "dark",
        }
      )
      const response = await res;
      if (response.status) {
        navigate("/dashboard/staff");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(error.message || "Error creating staff", {
        position: "top-right",
        autoClose: 2000,
        theme: "dark",
      });
    }
  };

  const handleDeleteSection = async (section) => {
    try {
      const outletId = outlets.find(
        (outlet) => outlet.name === selectedOutlet
      )?.id;
      const payload = {
        restaurant_id: localStorage.getItem("restaurantId"),
        outletId,
        sectionName: section,
      };
      const res = await deleteSection(payload);
      await toast.promise(
        Promise.resolve(res), 
        {
          pending: "Deleting section...",
          success: "Section deleted successfully",
          error: "Error deleting section",
        },
        {
          position: "top-right",
          autoClose: 2000,
          theme: "dark",
        }
      );
      // Only reload if deletion was successful
      if (res.status) {
        // Set a small delay to ensure toast is visible
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      console.error("Error deleting section:", error);
      toast.error(error.message, {
        position: "top-right",
        autoClose: 2000,
        theme: "dark",
      });
    }
  };

  const selectedOutletCode = outlets.find(
    (o) => o.name === selectedOutlet
  )?.code;

  // Helper function to check if a table is selected
  const isTableSelected = (tableName) => {
    return selectedTables.some(
      (t) => t.tableName === tableName && t.outletCode === selectedOutletCode
    );
  };

  return (
    <div className="flex flex-col w-full h-full flex-grow">
      <div className="flex items-center justify-between w-full h-fit">
        <div className="flex flex-col w-full">
          <div className="flex items-center">
            <button
              className="flex items-center justify-center w-fit h-fit cursor-pointer"
              onClick={() => window.history.back()}
            >
              <NavigateBeforeIcon sx={{ padding: "0", fontSize: 30 }} />
            </button>
            <span className="text-lg font-semibold">Create</span>
          </div>
        </div>
        <div className="flex justify-end gap-4">
          <button
            className="px-4 py-2 bg-[#F8F7FA] text-sm rounded-[8px] font-medium cursor-pointer"
            onClick={() => window.history.back()}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-[#4B21E2] text-white text-sm rounded-[8px] font-medium cursor-pointer"
            onClick={handleSubmit}
          >
            Save
          </button>
        </div>
      </div>

      <div className="px-4 md:px-8 w-full h-full flex flex-col md:flex-row justify-between">
        <div className="flex flex-col justify-items-start gap-4 pt-3 w-1/2 h-full pr-[18vw]">
          <div className="flex flex-col w-full h-fit gap-2">
            <label htmlFor="name" className="text-sm font-medium">
              Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter Name"
              value={staffName}
              className="px-3 py-2 pl-5 bg-[#F8F7FA] outline-[#5c5c7a98] rounded-[12px] text-xs"
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col w-full h-fit gap-2">
            <label htmlFor="Phone" className="text-sm font-medium">
              Steward Code
            </label>
            <div className="w-full" style={{ backgroundColor: '#F8F7FA', borderRadius: '12px' }}>
              <Dropdown
                placeholder={"STW CODE"}
                bgColor="bg-[#F8F7FA]"
                dropdownBgColor="bg-gray-200"
                textColor="text-black"
                dropdownTextColor="text-black"
                options={stwCodes}
                onChange={handleStwCodeSelect}
              />
            </div>
          </div>

          <div className="flex flex-col w-full h-fit gap-2">
            <label htmlFor="Phone" className="text-sm font-medium">
              Phone Number
            </label>
            <input
              type="number"
              name="phone"
              maxLength={10}
              minLength={10}
              placeholder="Enter Phone number"
              value={phone}
              onChange={handlePhoneChange}
              className="text-xs px-3 py-2 pl-5 bg-[#F8F7FA] outline-[#5c5c7a98] rounded-[12px] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>

          <div className="flex flex-col w-full h-fit gap-2">
            <label htmlFor="Phone" className="text-sm font-medium">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter Password"
              value={password}
              onChange={handlePasswordChange}
              className="text-xs px-3 py-2 pl-5 bg-[#F8F7FA] outline-[#5c5c7a98] rounded-[12px]"
            />
          </div>

          <div className="flex flex-col w-full h-fit gap-2">
            <label htmlFor="role" className="text-sm font-medium">
              Role
            </label>
            <div className="w-full" style={{ backgroundColor: '#F8F7FA', borderRadius: '12px' }}>
              <Dropdown
                placeholder={"Role"}
                bgColor="bg-[#F8F7FA]"
                dropdownBgColor="bg-gray-200"
                textColor="text-black"
                dropdownTextColor="text-black"
                options={["Waiter", "Cashier", "Supervisor", "Manager"]}
                onChange={handleRoleSelect}
              />
            </div>
          </div>

          <div className="flex flex-col w-full h-fit gap-2">
            <label htmlFor="name" className="text-sm font-medium">
              Permissions
            </label>
            {["transferBills", "printBills", "modifications", "settlement"].map(
              (perm) => (
                <div key={perm} className="flex gap-2 items-center">
                  <Checkbox
                    name={perm}
                    checked={permissions[perm]}
                    onChange={handlePermissionChange}
                    disabled={perm === "settlement" || perm === "modifications" || perm === "printBills"}
                    disableRipple
                    sx={{
                      padding: 0,
                      margin: 0,
                      "& .MuiSvgIcon-root": {
                        margin: 0,
                        fontSize: 16,
                      },
                      "&.Mui-checked": {
                        color: "#65558F",
                      },
                    }}
                  />
                  <span className="text-xs capitalize">
                    {formatPermissions(perm)}
                  </span>
                </div>
              )
            )}
          </div>
        </div>

        {/* Assign Tables Section */}
        <div className="flex flex-col gap-4 w-1/2 h-full items-center pl-16">
          <div className="flex gap-2 items-center pt-6 w-full">
            <div className="flex w-full h-fit flex-col gap-1">
              <label className="text-sm font-medium">Select Outlet</label>
              <div className="flex h-fit gap-6 items-center w-full">
                <div className="flex w-full max-w-[200px] h-fit">
                  <RadioDropdown
                    options={outlets.map((outlet) => outlet.name)}
                    onChange={handleOutletSelect}
                    value={selectedOutlet}
                  />
                </div>
                {/* <div className="flex items-center gap-1">
                  <span className="text-[14px] text-[#5C5C7A] text-nowrap">
                    Assign Outlet
                  </span>
                  <div className="flex items-center justify-center p-1.5 bg-[#F8F7FA] rounded-full">
                    <Checkbox
                      onChange={() => { }}
                      disableRipple
                      sx={{
                        padding: 0,
                        margin: 0,
                        "& .MuiSvgIcon-root": { fontSize: 18 },
                        "&.Mui-checked": { color: "#65558F" },
                      }}
                    />
                  </div>
                </div> */}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full">
            <div className="flex items-center w-full">
              <h2 className="text-sm font-medium w-full">Assign Tables</h2>
            </div>

            <div className="flex gap-[18px] pb-[16px]">
              <Button
                variant="secondary"
                size="small"
                onClick={handleModalOpen}
              >
                <AddIcon />
                Create Section
              </Button>
              <button 
                className="flex items-center p-2 rounded-full bg-[#F8F7FA] hover:bg-gray-300 cursor-pointer disabled:opacity-60 disabled:hover:bg-[#F8F7FA] disabled:cursor-not-allowed" 
                onClick={() => handleDeleteSection(selectedSection)}
                disabled={!selectedSection || sections.length === 0}
              >
                <DeleteOutlineIcon fontSize="small" />
              </button>
              <button 
                className="flex items-center p-2 rounded-full bg-[#F8F7FA] hover:bg-gray-300 cursor-pointer disabled:opacity-60 disabled:hover:bg-[#F8F7FA] disabled:cursor-not-allowed"
                disabled={!selectedSection || sections.length === 0}
                onClick={()=>handleEditSection(selectedSection)}
                >
                <EditIcon fontSize="small" />
              </button>
              <div className="flex items-center gap-2">
                <Checkbox
                  onChange={handleSelectAll}
                  checked={isSelectAll}
                  disableRipple
                  sx={{
                    padding: 0,
                    margin: 0,
                    "& .MuiSvgIcon-root": { fontSize: 18 },
                    "&.Mui-checked": { color: "#65558F" },
                  }}
                />
                <label className="text-[#5C5C7A] text-sm">Select All</label>
              </div>
            </div>            
            <div className="flex gap-6 min-h-[350px] max-h-[470px]">
              <div className="flex flex-col gap-2 overflow-y-auto max-h-full">
                {sections.map((name, index) => (
                  <button
                    key={index}
                    title={name}
                    className={`text-[12px] text-center p-[10px] rounded-lg w-[155px] h-[38px] truncate cursor-pointer ${activeIndex === index
                        ? "bg-[#201F33] text-white"
                        : "text-black bg-[#F8F7FA]"
                      }`}
                    onClick={() => handleSectionSelect(name, index)}
                  >
                    {name}
                  </button>
                ))}
              </div>

              <div className="overflow-y-auto max-h-full flex-1">
                <div className="grid grid-cols-4 w-fit h-fit gap-y-[20px] gap-x-[36px] justify-items-start">
                  {filteredTables.map((table, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-[6px] rounded w-fit h-fit"
                    >
                      <Checkbox
                        checked={isTableSelected(table.name)}
                        onChange={(e) => handleSelect(e, table)}
                        disableRipple
                        sx={{
                          padding: 0,
                          margin: 0,
                          "& .MuiSvgIcon-root": { fontSize: 18 },
                          "&.Mui-checked": { color: "#65558F" },
                        }}
                      />
                      <label className="text-[#5C5C7A] text-[14px]">
                        {table.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateStaff;
