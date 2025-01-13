import React, { useState } from 'react';
import Logo from "../assets/health_care_good_logo.png";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Logout from "./Logout";

const Layout = ({ children }) => {
    const { authState: { isAuthenticated, roles } } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // Close the dropdown menu when a link is clicked
    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    return (
        <div className="min-h-screen flex flex-col">
            <header className="bg-white text-white shadow-md">
                <div className="container mx-auto flex justify-between items-center p-4">
                    <Link to="/">
                        <img src={Logo} className="size-16" alt="Health Care Logo" />
                    </Link>

                    {/* Burger Menu Button for Mobile */}
                    <button
                        onClick={toggleMenu}
                        className="md:hidden text-[#057d7a] focus:outline-none">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                        </svg>
                    </button>

                    {/* Navigation Links for Desktop */}
                    <nav className="hidden md:flex md:items-center md:space-x-4">
                        {isAuthenticated ? (
                            <>
                                {roles.includes("Admin") ? (
                                    <>
                                        {/* Dashboard */}
                                        <Link to="/admin/dashboard" className="px-3 py-2 text-white bg-[#057d7a] rounded-lg hover:bg-[#2fadaa]">
                                            Dashboard
                                        </Link>
                                        {/* Admin Schedule */}
                                        <Link to="/admin/schedule" className="px-3 py-2 text-white bg-[#057d7a] rounded-lg hover:bg-[#2fadaa]">
                                            Schedule
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        {/* Dashboard */}
                                        <Link to="/user/dashboard" className="px-3 py-2 text-white bg-[#057d7a] rounded-lg hover:bg-[#2fadaa]">
                                            Dashboard
                                        </Link>
                                        {/* Book Appointment */}
                                        <Link to="/user/schedule" className="px-3 py-2 text-white bg-[#057d7a] rounded-lg hover:bg-[#2fadaa]">
                                            Book appointment
                                        </Link>
                                        {/* History */}
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

                {/* Mobile Dropdown Menu */}
                <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden bg-white shadow-lg absolute w-full z-10`}>
                    <nav className="flex flex-col space-y-2 p-4">
                        {isAuthenticated ? (
                            <>
                                {roles.includes("Admin") ? (
                                    <>
                                        {/* Dashboard */}
                                        <Link
                                            to="/admin/dashboard"
                                            onClick={closeMenu}
                                            className="px-3 py-2 text-white bg-[#057d7a] rounded-lg hover:bg-[#2fadaa]">
                                            Dashboard
                                        </Link>
                                        {/* Admin Schedule */}
                                        <Link
                                            to="/admin/schedule"
                                            onClick={closeMenu}
                                            className="px-3 py-2 text-white bg-[#057d7a] rounded-lg hover:bg-[#2fadaa]">
                                            Schedule
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        {/* Dashboard */}
                                        <Link
                                            to="/user/dashboard"
                                            onClick={closeMenu}
                                            className="px-3 py-2 text-white bg-[#057d7a] rounded-lg hover:bg-[#2fadaa]">
                                            Dashboard
                                        </Link>
                                        {/* Book Appointment */}
                                        <Link
                                            to="/user/schedule"
                                            onClick={closeMenu}
                                            className="px-3 py-2 text-white bg-[#057d7a] rounded-lg hover:bg-[#2fadaa]">
                                            Book appointment
                                        </Link>
                                        {/* History */}
                                        <Link
                                            to="/user/history"
                                            onClick={closeMenu}
                                            className="px-3 py-2 text-white bg-[#057d7a] rounded-lg hover:bg-[#2fadaa]">
                                            View History
                                        </Link>
                                    </>
                                )}
                                <Logout onClick={closeMenu} /> {/* Close menu on logout */}
                            </>
                        ) : (
                            <Link
                                to="/login"
                                onClick={closeMenu}
                                className="px-3 py-2 text-white bg-[#057d7a] rounded-lg hover:bg-[#2fadaa]">
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