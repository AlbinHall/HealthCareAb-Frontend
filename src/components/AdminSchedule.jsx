import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import styled from "styled-components";
import { Calendar } from "react-big-calendar";
import MyCalendar from './Calendar'; // Ensure the correct import path

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function AdminSchedule() {
  const navigate = useNavigate();
  const { authState, setAuthState } = useAuth();
  const [users, setUsers] = useState([]);

  return (
    <MyCalendar authState={authState} /> // Pass authState as a prop
  );
}

export default AdminSchedule;