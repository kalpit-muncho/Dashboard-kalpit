import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import artImage from "../../assets/images/art.png";
import logo from "../../assets/images/muncho_logo.svg";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import { Link } from "react-router-dom";
import { login } from "../../models/UserModel";

const LoginPage = () => {
  const navigate = useNavigate();
  //set document title
  React.useEffect(() => {
    document.title = "Login | Muncho";
  }, []);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      console.log(formData);
      const { email, password } = formData;
      if (formData.email === "" || formData.password === "") {
        throw new Error("Please fill in all fields");
      }
      const promise = login(email, password);
      toast.promise(promise, {
        pending: "Logging in...",
        success: "Login successful! Redirecting to dashboard...",
      });
      const user = await promise;
      if (user) {
        console.log(user);
        localStorage.setItem("authToken", user?.data.token);
        localStorage.setItem("restaurantId", user?.data.restaurant_id);
        navigate("/dashboard");
      }
    } catch (error) {
      console.error(`Login error: ${error.message}`);
      toast.error(`Login error: ${error.message}`, {
        position: "top-right",
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
    <div className="h-screen w-screen flex flex-col md:flex-row items-center justify-center">
      <ToastContainer />
      {/* Image Section */}
      <div className="hidden md:flex items-center justify-center w-[55%] h-full overflow-hidden">
        <div className="w-[95%] h-[95%] bg-[#4B21E2] rounded-[20px] flex items-center justify-center overflow-hidden">
          <img
            src={artImage}
            alt="Art"
            className="object-cover w-full h-full"
          />
        </div>
      </div>

      {/* Login Form Section */}
      <div className="flex flex-col gap-8 items-center justify-center w-full md:w-[45%]">
        <div className="pb-20">
          <img src={logo} alt="Muncho Logo" className="w-25 md:w-[284px]" />
        </div>
        <div className="px-12 md:p-0 w-full md:w-[320px] flex flex-col gap-6">
          <div className="flex flex-col w-full gap-2">
            <label htmlFor="email" className="font-medium text-sm">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 bg-[#F8F7FA] placeholder:text-[#5C5C7A] outline-[#4B21E2] rounded-lg text-xs"
            />
          </div>
          <div className="flex flex-col w-full gap-2">
            <label htmlFor="password" className="font-medium text-sm">
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 bg-[#F8F7FA] placeholder:text-[#5C5C7A] outline-[#4B21E2] rounded-lg text-xs"
            />
          </div>
          <div className="flex flex-col gap-12 w-full">
            <div className="flex w-full justify-end">
              <Link
                to="/login/send-password-reset-mail"
                className="underline hover:text-[#4B21E2] text-sm"
              >
                Forgot password?
              </Link>
            </div>
            <div className="flex w-full">
              <button
                className="w-full h-fit py-2.5 text-center font-medium cursor-pointer bg-[#4B21E2] text-white rounded-lg hover:bg-[#4B21E2]/80 transition-all duration-300"
                onClick={handleSubmit}
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
