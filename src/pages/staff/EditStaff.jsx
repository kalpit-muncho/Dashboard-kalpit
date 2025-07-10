import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
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
import { deleteStaff } from "../../models/StaffDataModel";
import { deleteSection } from "../../models/TableDataModel";
import { toast } from "react-toastify";
import { updateStaff, getStaffList } from "../../models/StaffDataModel";

const EditStaff = () => {
  const navigate = useNavigate();
  const { id } = useParams();
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
  const [staff, setStaff] = useState(null);

  // Track original assigned outlet
  const [originalOutlet, setOriginalOutlet] = useState(null);

  const { setCreateSection, setModalData } = useContext(DashboardContext);
  const { restaurant } = useOutletContext();

  const handleModalOpen = () => {
    setCreateSection(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const restId = localStorage.getItem("restaurantId");
        console.log("Restaurant Data:", restaurant);

        // Get staff data first
        const staffList = await getStaffList(restId);
        const currentStaff = staffList.find(s => s.id === Number(id));

        if (!currentStaff) {
          toast.error("Staff not found");
          return;
        }

        // Set staff details
        setStaff(currentStaff);
        setStaffName(currentStaff.name || "");
        setSelectedStwCode(currentStaff.stwCode || "");
        setPhone(currentStaff.phone || "");
        setPassword(currentStaff.password || "");
        setSelectedRole(currentStaff.role.charAt(0).toUpperCase() + currentStaff.role.slice(1));
        setPermissions(currentStaff.permissions || {});

        // Handle STW codes
        const codes = restaurant?.stewardList?.map(stw => stw.STWCOD) || [];
        setStwCodes(codes);

        // Handle outlets
        const outletsData = restaurant?.outlets || [];
        console.log("Outlets Data:", outletsData);

        if (outletsData.length > 0) {
          setOutlets(outletsData);

          // Handle assigned tables and outlet selection
          const assignedTables = currentStaff.assignedTables || [];
          setSelectedTables(assignedTables);

          const outletCode = assignedTables[0]?.outletCode;
          const defaultOutlet = outletsData[0]?.name;

          if (outletCode) {
            const outlet = outletsData.find(o => o.code === outletCode);
            setSelectedOutlet(outlet ? outlet.name : defaultOutlet);
          } else {
            setSelectedOutlet(defaultOutlet);
          }
          setOriginalOutlet(outletCode);
        }

      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (restaurant) {
      fetchData();
    }
  }, [id, restaurant]);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        if (!selectedOutlet || !outlets.length) {
          console.log("Missing outlet data for tables. Outlet:", selectedOutlet, "Outlets:", outlets);
          return;
        }

        const outlet = outlets.find(o => o.name === selectedOutlet);
        console.log("Found outlet:", outlet);

        if (!outlet?.tables) {
          console.log("Checking alternative table data structure");
          // Try alternate data structure
          if (outlet?.tableList) {
            const tables = outlet.tableList.map(table => ({
              name: table.tableNumber,
              section: table.tableSection,
            }));

            console.log("Tables from tableList:", tables);

            if (tables.length > 0) {
              const sections = [...new Set(tables
                .map(table => table.section)
                .filter(Boolean))];

              console.log("Sections found:", sections);
              setSections(sections);

              const sortedTables = [...tables].sort((a, b) => {
                const numA = parseInt(a.name.replace(/\D/g, ""), 10) || 0;
                const numB = parseInt(b.name.replace(/\D/g, ""), 10) || 0;
                return numA - numB;
              });

              setTables(sortedTables);
              setFilteredTables(sortedTables);
              setModalData({ tables: sortedTables, sections, outlet });
              return;
            }
          }
          console.log("No tables found in either structure");
          return;
        }

        // If we reach here, use the primary table structure
        const tables = outlet.tables.map(table => ({
          name: table.number,
          section: table.section,
        }));

        console.log("Final processed tables:", tables);

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
        setModalData({ tables: sortedTables, sections, outlet });

      } catch (error) {
        console.error("Error in fetchTables:", error);
        console.error("Error details:", error.message);
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

  const validateForm = () => {
    const toastConfig = {
      position: "top-right",
      autoClose: 2000,
      theme: "dark",
    }
    if (!selectedOutlet) {
      toast.error("Please select an outlet", toastConfig);
      return;
    }
    if (!selectedStwCode) {
      toast.error("Please select a STW code", toastConfig);
      return;
    }
    if (!staffName) {
      toast.error("Please enter a name", toastConfig);
      return;
    }
    if (!phone) {
      toast.error("Please enter a phone number", toastConfig);
      return;
    }
    if (phone.length < 10) {
      toast.error("Please enter a valid phone number", toastConfig);
      return;
    }
    if (!password) {
      toast.error("Please enter a password", toastConfig);
      return;
    }
  }

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

  if (loading) {
    return <Loading />;
  }

  if (!staff) {
    return <div>Staff Not Found</div>;
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
    setSelectedRole(role);
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

  const handleSubmit = async () => {
    try {
      const formData = {
        id: id,
        name: staffName ? staffName : staff.name,
        stwCode: selectedStwCode ? selectedStwCode : staff.stwCode,
        mobile: phone ? phone : staff.phone,
        role: selectedRole ? selectedRole.toLocaleLowerCase() : staff.role,
        password: password ? password : staff.password,
        permissions: {
          transferBills: permissions?.transferBills ? permissions?.transferBills : staff.permissions?.transferBills,
          printBills: permissions?.printBills ? permissions?.printBills : staff.permissions?.printBills,
          settlement: permissions?.settlement ? permissions?.settlement : staff.permissions?.settlement,
          modifications: permissions?.modifications ? permissions?.modifications : staff.permissions?.modifications,
        },
        assignedTables: selectedTables,
        status: staff.status,
      };

      console.log("Payload", formData);
      const res = await updateStaff(formData);
      console.log("Res", res);
      if (res.status) {
        navigate("/dashboard/staff");
        toast.success(res.message, {
          position: "top-right",
          autoClose: 2000,
          theme: "dark",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(error.message, {
        position: "top-right",
        autoClose: 2000,
        theme: "dark",
      });
    }
  };

  const handleDelete = async () => {
    const ok = window.confirm(`Are you sure you want to delete ${staff.name}?`);
    if (!ok) return;

    try {
      setLoading(true);
      const res = await deleteStaff(staff.id);
      toast.success(res.message, { position: "top-right" });
      navigate("/dashboard/staff");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err.message, { position: "top-right" });
    } finally {
      setLoading(false);
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

  const formatPermissions = (perm) => {
    if (perm === "transferBills") {
      return "Table Transfer";
    } else if (perm === "printBills") {
      return "Print Bills";
    } else if (perm === "settlement") {
      return "Settlement";
    } else if (perm === "modifications") {
      return "Modifications";
    }
  }

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
            <span className="text-lg font-semibold">Edit</span>
          </div>
          <span className="pl-8 font-semibold text-[#5C5C7A] text-xs">
            Waiter Details {">"} {staff.name}
          </span>
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
              value={staffName}
              className="px-3 py-2 pl-5 bg-[#F8F7FA] outline-[#5c5c7a98] rounded-[12px] text-xs"
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col w-full h-fit gap-2">
            <label htmlFor="Phone" className="text-sm font-medium">
              Steward Code
            </label>
            <Dropdown
              placeholder={selectedStwCode ? selectedStwCode : "STW Code"}
              bgColor="bg-[#F8F7FA]"
              dropdownBgColor="bg-gray-200"
              textColor="text-black"
              dropdownTextColor="text-black"
              options={stwCodes}
              onChange={handleStwCodeSelect}
            />
          </div>

          <div className="flex flex-col w-full h-fit gap-2">
            <label htmlFor="Phone" className="text-sm font-medium">
              Phone Number
            </label>
            <input
              type="number"
              name="phone"
              value={phone}
              maxLength={10}
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
              value={password}
              onChange={handlePasswordChange}
              className="text-xs px-3 py-2 pl-5 bg-[#F8F7FA] outline-[#5c5c7a98] rounded-[12px]"
            />
          </div>

          <div className="flex flex-col w-full h-fit gap-2">
            <label htmlFor="role" className="text-sm font-medium">
              Role
            </label>
            <Dropdown
              disabled={selectedRole === 'admin'}
              placeholder={selectedRole}
              bgColor="bg-[#F8F7FA]"
              dropdownBgColor="bg-gray-200"
              textColor="text-black"
              dropdownTextColor="text-black"
              options={["Waiter", "Cashier", "Supervisor", "Manager"]}
              onChange={handleRoleSelect}
            />
          </div>

          <div className="flex flex-col w-full h-fit gap-2">
            <label htmlFor="name" className="text-sm font-medium">
              Permissions
            </label>
            {[
              "transferBills",
              "printBills",
              "modifications",
              "settlement"
            ]?.map((perm) => (
              <div key={perm} className="flex gap-2 items-center">
                <Checkbox
                  name={perm}
                  checked={permissions?.[perm]}
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
                <span className="text-xs capitalize cursor-default">
                  {formatPermissions(perm)}
                </span>
              </div>
            ))}
          </div>

          {staff.role !== "admin" &&
            <div className="flex flex-col w-full h-fit gap-1 pt-4 pb-8">
              {/* <label htmlFor="Phone" className="text-sm font-medium">
                Delete Waiter
              </label> */}
              <div className="rounded-[12px] bg-[#FAE8E8] px-[10px] py-[8px] flex items-center justify-between w-full h-fit">
                <div className="flex items-center w-full">
                  <span className="text-[14px]">Delete Staff</span>
                </div>
                <button
                  className="bg-[#F8F7FA] rounded-full p-[8px] w-fit h-fit flex items-center justify-center cursor-pointer"
                  onClick={handleDelete}
                  disabled={staff.role === "admin"}
                  title={staff.role === "admin" ? "Admin cannot be deleted" : "Delete Staff"}
                >
                  <DeleteOutlineIcon
                    className="text-[#D84343]"
                    fontSize="small"
                  />
                </button>
              </div>
            </div>
          }
        </div>

        {/* Assign Tables Section */}
        <div className="flex flex-col gap-4 w-1/2 h-[calc(100vh-110px)] items-center pl-16">
          <div className="flex gap-2 items-center pt-6 w-full">
            <div className="flex w-full h-fit flex-col gap-1">
              <label className="text-sm font-medium">Select Outlet</label>
              <div className="flex w-full h-fit gap-6 items-center">
                <div className="flex w-full max-w-[200px] h-fit">
                  <RadioDropdown
                    options={outlets.map((outlet) => outlet.name)}
                    onChange={handleOutletSelect}
                    value={selectedOutlet}
                  />
                </div>
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
                onClick={() => handleEditSection(selectedSection)}
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
            <div className="flex gap-6 min-h-[350px] max-h-[460px]">
              <div className="flex flex-col gap-2 overflow-y-auto max-h-full">
                {sections.map((name, index) => (
                  <button
                    key={index}
                    title={name}
                    className={`text-[12px] text-center p-[10px] rounded-lg w-[155px] h-[38px] truncate cursor-pointer ${activeIndex === index ? "bg-[#201F33] text-white" : "bg-[#F8F7FA] text-black"
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

export default EditStaff;
