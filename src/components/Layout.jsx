import React from 'react';
import Logo from "../assets/health_care_logo.svg";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Logout from "./Logout";

const Layout = ({ children }) => {
    const { authState: { isAuthenticated, roles } } = useAuth();

    return (
        <div className="min-h-screen flex flex-col">
            <header className="bg-white text-white shadow-md">
                <div className="container mx-auto flex justify-between items-center">
                    <Link to="/">
                        <img src={Logo} className="size-32"></img>
                    </Link>
                    <nav className="flex items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                                {roles.includes("Admin") ? (
                                    <>
                                        {/*Dashboard*/}
                                        <Link to="/admin/dashboard" className="px-3 py-2 text-white bg-[#057d7a] rounded-lg hover:bg-[#2fadaa]">
                                            Dashboard
                                        </Link>
                                        {/*Admin Schedule*/}
                                        <Link to="/admin/schedule" className="px-3 py-2 text-white bg-[#057d7a] rounded-lg hover:bg-[#2fadaa]">
                                            Schedule
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        {/*Dashboard*/}
                                        <Link to="/user/dashboard" className="px-3 py-2 text-white bg-[#057d7a] rounded-lg hover:bg-[#2fadaa]">
                                            Dashboard
                                        </Link>
                                        {/*Book Appointment*/}
                                        <Link to="/user/schedule" className="px-3 py-2 m-2 text-white bg-[#057d7a] rounded-lg hover:bg-[#2fadaa]">
                                            Book appointment
                                        </Link>
                                        {/*history*/}
                                        <Link to="/user/history" className="px-3 py-2 text-white bg-[#057d7a] rounded-lg hover:bg-[#2fadaa]">
                                            View History
                                        </Link>
                                    </>
                                )}
                                <Logout />
                            </>
                        ) : (
                            <Link to="/login" className="px-3 py-2 text-white bg-[#057d7a] rounded-lg hover:bg-[#2fadaa]">
                                Login
                            </Link>
                        )}
                    </nav>
                </div>
            </header>

            <main className="mt-4">
                {children}
            </main>

            <footer className="bg-gray-800 text-white p-4 mt-auto">
                <div className="container mx-auto text-center">
                    <p>Health Care AB</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;