import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const bookAppointment = async (
  userId,
  selectedSlot,
  selectedCaregiverId
) => {
  const appointmentData = {
    patientId: userId,
    caregiverId: selectedCaregiverId,
    appointmentTime: selectedSlot.startTime,
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
        "Servern svarar inte. Kontrollera din anslutning och försök igen."
      );
    } else {
      throw new Error("Nåt gick fel. Försök igen");
    }
  }
};
