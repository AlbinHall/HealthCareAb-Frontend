import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import MyCalendar from './Calendar';
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const createAvailability = async (availability) => {
  const response = await axios.post(`${API_BASE_URL}/availability`, availability, {
    withCredentials: true,
  });
  return response.data;
};

function AdminSchedule() {
  const navigate = useNavigate();
  const { authState, setAuthState } = useAuth();
  const [users, setUsers] = useState([]);

  return (
    <MyCalendar />
  );
}

export default AdminSchedule;