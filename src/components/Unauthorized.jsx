import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1); // navigate back to the previous page
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h2 className="text-3xl font-bold text-red-500 mb-4">Unauthorized</h2>
      <p className="text-lg mb-6">You do not have permission to view this page.</p>
      <button
        onClick={goBack}
        className="px-6 py-3 bg-teal-700 text-white rounded-lg hover:bg-teal-500 transition-transform transform hover:-translate-y-1"
      >
        Go Back
      </button>
    </div>
  );
};

export default Unauthorized;
