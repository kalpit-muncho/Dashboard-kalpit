import { apiService } from "../services/apiService";

export const getStaffData = async () => {
  const { data } = await apiService.getStaffData();
  return data.map((s) => ({
    id: s.id,
    name: s.name,
    lastLogin: s.lastLogin,
    status: s.status,
    permissions: s.permissions,
    role: s.role,
    phone: s.mobile,
    stwCode: s.code,
    password: s.password,
  }));
};

export const getStaffList = async (restaurantId) => {
  const { staff } = await apiService.getStaffList(restaurantId);
  console.log("Staff", staff);
  return staff.map((s) => ({
    id: s.id,
    name: s.name,
    lastLogin: formatDate(s.updatedAt),
    status: s.status,
    permissions: s.permission,
    role: s.role,
    phone: s.mobile,
    stwCode: s?.code,
    password: s.password,
    assignedTables: s.assigned_tables,
  }));
};

export const getStaffById = async (id) => {
  console.log("Staff ID", id);
  // convert id to number
  let parsedId = parseInt(id);
  const restId = localStorage.getItem("restaurantId");
  const response = await apiService.getStaffList(restId)
  const staffList = response.staff;
  const s = staffList.find((s) => s.id === parsedId);
  console.log("Staff", s);
  if (!s) {
    throw new Error("Staff not found");
  }
  return {
    id: s.id,
    name: s.name,
    lastLogin: formatDate(s.lastLogin),
    status: s.status,
    permissions: s.permissions,
    role: s.role,
    phone: s.mobile,
    stwCode: s.code,
    password: s.password,
    assignedTables: s.assignedTables,
  };
};

export const updateStaffStatus = (id, status) => {
  return apiService.updateStaffStatus(id, status);
};

export const updateStaff = (staff) => {
  return apiService.updateStaff(staff);
};

export const createStaff = async (staff) => {
  try {
    validateStaff(staff);
    const response = await apiService.createStaff(staff);
    const data = response.data;
    console.log("Create Staff Response", data);
    if (!data.status) {
      throw new Error(data.message || "unknown error");
    }
    return response;
  } catch (error) {
    console.error("Error creating staff:", error);
    const data = error.response?.data;
    if (data && data.message) {
      throw new Error(data.message);
    } else {
      throw new Error("Failed to create staff. Please try again.");
    }
  }
};

export const deleteStaff = (staff_id) => {
  return apiService.deleteStaff(staff_id);
};

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function validateStaff(s) {
  if (!s.name) throw new Error("Name is required");
  if (!s.mobile) throw new Error("Phone number is required");
  if (!s.stwCode) throw new Error("STW code is required");
  if (!s.role) throw new Error("Role is required");
  if (!s.password) throw new Error("Password is required");
}
