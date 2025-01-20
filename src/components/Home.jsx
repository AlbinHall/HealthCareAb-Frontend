import React from "react";
import Logo from "../assets/health_care_logo.svg";
import HomeFeedback from "./HomeFeedback";

const Home = () => (
  <div className="flex flex-col items-center justify-center">
    <img src={Logo} alt="Health Care Logo" className="h-80 mb-6" />
    <h1 className="text-3xl font-bold mb-4">Welcome to Health Care AB</h1>
    <h2 className="text-2xl mb-4">Hear what our customers are saying – Rated 5 Stars!</h2>
    <HomeFeedback/>
  </div>
);

export default Home;