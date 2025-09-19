import React, { useState } from "react";
import { ChevronDown, ChevronUp, Menu, X } from "lucide-react";
import { Link } from "react-router-dom"; // <-- Added
import logo from "../assets/logo.jpeg";

const Sidebar = () => {
  const [courseOpen, setCourseOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex">
      {/* Mobile Hamburger */}
      <div className="md:hidden p-4 fixed top-0 left-0 z-50">
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-blue-900 focus:outline-none"
        >
          <Menu size={28} />
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen bg-blue-100 text-blue-900 flex flex-col shadow-lg z-50
          transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 md:w-64 w-72 rounded-r-lg`}
      >
        {/* Header */}
        <div className="flex items-center justify-start py-6 px-4 border-b border-blue-300">
          <img
            src={logo}
            alt="ProLearnX Logo"
            className="w-12 h-12 rounded-full mr-3"
          />
          <span
            className="text-xl font-bold"
            style={{ fontFamily: "'Helvetica Neue', sans-serif" }}
          >
            PROLEARNX
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
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          {/* Dashboard */}
          <Link
            to="/dashboard"
            className="block py-2 px-3 rounded hover:bg-blue-200 cursor-pointer transition text-left"
          >
            Dashboard
          </Link>

          {/* Course Management */}
          <div className="mt-4">
            <div
              className="flex justify-between items-center py-2 px-3 rounded hover:bg-blue-200 cursor-pointer transition"
              onClick={() => setCourseOpen(!courseOpen)}
            >
              <span>Course Management</span>
              {courseOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
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

          {/* Student Management */}
          <Link
            to="/EnrollmentOverview"
            className="block mt-4 py-2 px-3 rounded hover:bg-blue-200 cursor-pointer transition text-left"
          >
            Show Enrolled Students
          </Link>

          <Link
            to="/pricing"
            className="block mt-4 py-2 px-3 rounded hover:bg-blue-200 cursor-pointer transition text-left"
          >
            Pricing
          </Link>
          {/* <Link
            to="/pricing"
            className="block mt-4 py-2 px-3 rounded hover:bg-blue-200 cursor-pointer transition text-left"
          >
            Pricing
          </Link> */}
          <Link
            to="/CommentsReplies"
            className="block mt-4 py-2 px-3 rounded hover:bg-blue-200 cursor-pointer transition text-left"
          >
            Comments & Replies
          </Link>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
