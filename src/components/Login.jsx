import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";

const apiUrl = import.meta.env.VITE_API_BASE_URL;

function Login() {
  const { setAuthState } = useAuth();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    setCredentials((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${apiUrl}/auth/login`, credentials, {
        withCredentials: true,
      });

      console.log("Login successful:", JSON.stringify(response.data));

      if (
        !response.data ||
        !response.data.username ||
        !response.data.roles ||
        !response.data.userId
      ) {
        throw new Error("Invalid server response. Missing required data.");
      }

      const roles = response.data.roles;

      setAuthState({
        isAuthenticated: true,
        user: response.data.username,
        roles: roles,
        userId: response.data.userId,
      });

      if (roles.includes("Admin")) {
        console.log("admin role");
        navigate("/admin/dashboard", { replace: true });
      } else {
        console.log("user");
        navigate("/user/dashboard", { replace: true });
      }
    } catch (error) {
      console.error("Login failed:", error.response || error);
      setError("Invalid username or password");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form
        onSubmit={handleLogin}
        className="flex flex-col p-6 bg-white rounded-lg shadow-md w-80 gap-4"
      >
        <label className="font-medium">Username:</label>
        <input
          name="username"
          type="text"
          value={credentials.username}
          onChange={handleInputChange}
          required
          className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-teal-500"
          autocomplete="username"
        />
        <label className="font-medium">Password:</label>
        <input
          name="password"
          type="password"
          value={credentials.password}
          onChange={handleInputChange}
          required
          className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-teal-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-500 transition-transform transform hover:-translate-y-1"
        >
          Login
        </button>
      </form>
      <p className="mt-4">
        No account? <Link to="/register" className="text-teal-700 underline">Register here</Link>
      </p>
    </div>
  );
}

export default Login;