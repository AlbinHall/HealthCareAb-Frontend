import React from "react";

const ErrorModal = ({ errorMessage, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="p-6 rounded-lg shadow-lg w-96 bg-white">
        <h2 className="mb-2">Error</h2>
        <p className="text-red-600">{errorMessage}</p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 m-2 text-white bg-[#057d7a] rounded hover:bg-[#2fadaa]"
          >
            Stäng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;
