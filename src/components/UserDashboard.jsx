import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import Logo from "../assets/health_care_logo.svg";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function UserDashboard() {
  const {
    authState: { userId, firstname, lastname },
  } = useAuth();
  const [nextAppointments, setNextAppointments] = useState([]);

  useEffect(() => {
    if (!userId) return;
    const fetchAppointments = async () => {
      const response = await axios.get(
        `${API_BASE_URL}/Appointment/getscheduledappointmentsbypatientid/${userId}`,
        {
          withCredentials: true,
        }
      );
      setNextAppointments(response.data);
    };
    fetchAppointments();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <img src={Logo} alt="Health Care Logo" className="h-80 mb-6" />
      <p>Next appointment: blablabla</p>
      {nextAppointments.length === 0 ? (
        <p>No upcoming appointments</p>
      ) : (
        <ul>
          {nextAppointments.map((appointment) => (
            <li key={appointment.id}>
              <p>Caregiver: {appointment.caregiverName}</p>
              <p>Patient: {appointment.patientName}</p>
              <p>
                Time: {new Date(appointment.appointmentTime).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
      <p>History</p>
      <p>Today's available slots</p>
    </div>
  );
}

export default UserDashboard;
