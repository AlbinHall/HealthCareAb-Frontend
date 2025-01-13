import React from "react";
import Logo from "../assets/health_care_logo.svg";
import { Link } from "react-router-dom";

const Home = () => (
  <div className="flex flex-col items-center justify-center h-screen">
    <img src={Logo} alt="Health Care Logo" className="h-80 mb-6" />
    <h1 className="text-3xl font-bold mb-4">Health Care Appointment App</h1>
    <div className="px-6 py-3 bg-teal-700 text-white rounded-lg hover:bg-teal-500 transition-transform transform hover:-translate-y-1">
      <Link className="text-white" to="/login">
        Login
      </Link>
    </div>
  </div>
);

export default Home;
