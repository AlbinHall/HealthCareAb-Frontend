import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const apiUrl = import.meta.env.VITE_API_BASE_URL;

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    if (
      !/\d/.test(formData.password) ||
      !/[A-Z]/.test(formData.password) ||
      formData.password.length < 8
    ) {
      setErrorMessage(
        "Password must be at least 8 characters long and contain at least one number and one uppercase letter."
      );
      return;
    }

    try {
      const payload = {
        username: formData.username,
        password: formData.password,
      };

      const response = await axios.post(`${apiUrl}/auth/register`, payload);
      console.log("Register successful:", response.data);
      setSuccessMessage(
        "User registered successfully! Redirecting to login page..."
      );
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
    } catch (error) {
      console.error("Register failed:", error.response || error);
      if (error.response && error.response.status === 409) {
        setErrorMessage(error.response.data);
      } else {
        setErrorMessage("Failed to register user. Please try again.");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      {successMessage && <p className="text-green-500">{successMessage}</p>}
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      <form
        onSubmit={handleRegister}
        className="flex flex-col p-6 bg-white rounded-lg shadow-md w-80 gap-4"
      >
        <label className="font-medium">Username:</label>
        <input
          autoFocus
          name="username"
          type="text"
          value={formData.username}
          onChange={handleInputChange}
          required
          className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-teal-500"
        />
        <label className="font-medium">Password:</label>
        <input
          name="password"
          type="password"
          value={formData.password}
          onChange={handleInputChange}
          required
          className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-teal-500"
        />
        <label className="font-medium">Confirm Password:</label>
        <input
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          required
          className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-teal-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-500 transition-transform transform hover:-translate-y-1"
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;