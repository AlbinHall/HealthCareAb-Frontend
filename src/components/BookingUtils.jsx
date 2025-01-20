import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const bookAppointment = async (
  userId,
  selectedSlot,
  selectedCaregiverId,
  description
) => {
  const appointmentData = {
    patientId: userId,
    caregiverId: selectedCaregiverId,
    appointmentTime: selectedSlot.start || selectedSlot.startTime, // Fult men funkar
    description,
  };
  console.log("AppointmentData: ", appointmentData);
  try {
    await axios.post(
      `${API_BASE_URL}/Appointment/createappointment`,
      appointmentData,
      {
        withCredentials: true,
      }
    );
    return { success: true };
  } catch (error) {
    console.error("Error creating appointment:", error);
    if (error.response) {
      throw new Error(error.response.data.message);
    } else if (error.request) {
      throw new Error(
        "Server not responding. Check your connection and try again."
      );
    } else {
      throw new Error("An error occurred. Please try again.");
    }
  }
};
