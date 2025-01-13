import React from "react";
import Logo from "../assets/health_care_logo.svg";
import { Link } from "react-router-dom";

const Home = () => (
  <div className="flex flex-col items-center justify-center">
    <img src={Logo} alt="Health Care Logo" className="h-80 mb-6" />
    <h1 className="text-3xl font-bold mb-4">Health Care Appointment App</h1>
    <h2 className="text-xl">VISA REVIEWS HÄR?</h2>
  </div>
);

export default Home;
