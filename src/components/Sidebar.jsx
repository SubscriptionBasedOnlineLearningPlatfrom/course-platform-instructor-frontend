import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  LogOut,
  User,
  LogIn,
} from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.jpeg";
import { logout } from "../utils/auth.js";

const Sidebar = () => {
  const [courseOpen, setCourseOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check authentication status
    const checkAuthStatus = () => {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          const now = Date.now() / 1000;
          if (payload.exp && payload.exp > now) {
            setIsLoggedIn(true);
            return;
          }
        } catch (error) {
          console.error("Error decoding token:", error);
        }
      }

      setIsLoggedIn(!!storedUser);
    };

    checkAuthStatus();

    // Listen for storage changes (login/logout)
    window.addEventListener("storage", checkAuthStatus);
    return () => window.removeEventListener("storage", checkAuthStatus);
  }, []);

  return (
    <>
      {/* Hamburger button for small screens */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-blue-900 focus:outline-none"
        >
          <Menu size={28} />
        </button>
      </div>

      {/* Overlay for small screens */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-blue-100 text-blue-900 flex flex-col shadow-lg z-50
          transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:w-64 md:sticky md:top-0 md:h-screen overflow-y-auto`}

      >
        {/* Header */}
        <div className="flex items-center justify-start py-4 px-4 border-b border-blue-300 bg-blue-100">
          <img
            src={logo}
            alt="ProLearnX Logo"
            className="w-12 h-12 rounded-full mr-3"
          />
          <span
            className="text-xl font-bold"
            style={{ fontFamily: "'Helvetica Neue', sans-serif" }}
          >
            ProLearnX
          </span>

          {/* Close button for mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto md:hidden focus:outline-none"
          >
            <X size={24} />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-4 py-4 overflow-y-auto">
          <Link
            to="/dashboard"
            className="block py-2 px-3 rounded hover:bg-blue-200 cursor-pointer transition text-left"
          >
            Dashboard
          </Link>

          {isLoggedIn && (
            <Link
              to="/profile"
              className="flex items-center gap-2 mt-4 py-2 px-3 rounded hover:bg-blue-200 cursor-pointer transition text-left"
            >
              <User className="h-4 w-4" />
              My Profile
            </Link>
          )}

          {isLoggedIn && (
            <div className="mt-4">
              <div
                className="flex justify-between items-center py-2 px-3 rounded hover:bg-blue-200 cursor-pointer transition"
                onClick={() => setCourseOpen(!courseOpen)}
              >
                <span>Course Management</span>
                {courseOpen ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </div>
              {courseOpen && (
                <div className="pl-6 mt-2 space-y-1 text-left">
                  <Link
                    to="/create-course"
                    className="block py-1 px-3 rounded hover:bg-blue-200 cursor-pointer transition"
                  >
                    Add Course
                  </Link>
                  <Link
                    to="/courses"
                    className="block py-1 px-3 rounded hover:bg-blue-200 cursor-pointer transition"
                  >
                    Course List
                  </Link>
                </div>
              )}
            </div>
          )}

          <Link
            to="/EnrollmentOverview"
            className="block mt-4 py-2 px-3 rounded hover:bg-blue-200 cursor-pointer transition text-left"
          >
            Show Enrolled Students
          </Link>
          <Link
            to="/CommentsReplies"
            className="block mt-4 py-2 px-3 rounded hover:bg-blue-200 cursor-pointer transition text-left"
          >
            Comments & Replies
          </Link>
        </nav>

        {/* Authentication */}
        <div className="p-4 mt-auto border-t border-blue-300 bg-blue-100">
          {isLoggedIn ? (
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to sign out?")) {
                  logout();
                }
              }}
              className="w-full py-2 px-3 rounded bg-red-700 hover:bg-red-800 text-white cursor-pointer transition text-center font-medium flex items-center justify-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          ) : (
            <Link
              to="/login"
              className="w-full py-2 px-3 rounded bg-green-600 hover:bg-green-700 text-white cursor-pointer transition text-center font-medium flex items-center justify-center gap-2"
            >
              <LogIn className="h-4 w-4" />
              Login
            </Link>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
