import { useAuth } from "../hooks/useAuth";
import Logo from "../assets/health_care_logo.svg";

function UserDashboard() {
  // using custom hook to check if the user i authenticated and has the correct role
  const { authState: { firstname, lastname }, } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <img src={Logo} alt="Health Care Logo" className="h-80 mb-6" />
      <h2 className="text-2xl font-bold mb-4">User Dashboard</h2>
      <p className="text-lg mb-6">Welcome, {firstname} {lastname}!</p>
    </div>
  );
}

export default UserDashboard;
