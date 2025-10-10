import React, { useState, useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import "./App.css";
import Sidebar from "./components/Sidebar";

import LearnerFeedbackCarousel from "./components/LearnerFeedbackCarousel";
import ViewCreatedCourse from "./components/course/ViewCreatedCourse";
import EnrollmentOverview from "./components/enrollments/EnrollmentOverview";
import CurriculumPage from "./pages/Curriculum";
import QuizCreation from "./components/quizes/QuizCreation";
import CommentsReplies from "./components/comments/CommentsReplies";
import Dashboard from "./pages/Dashboard";
import CreateCourse from "./pages/CreateCourse";
import Signup_Login from "./pages/Signup_Login";
import UpdatePassword from "./pages/UpdatePassword";
import { ToastContainer } from "react-toastify";
import ViewCreatedCourses from "./components/course/ViewCreatedCourse";
import InstructorDetails from "./components/instructor/InstructorDetails";
import Profile from "./pages/Profile";
import QuizViewer from "./components/quizes/ViewQuizes";
import QuizEditor from "./components/quizes/QuizEditor";
import { isAuthenticated } from "./utils/auth";
import StudentSubmission from "./components/StudentSubmission";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);


  useEffect(() => {
    // Check authentication status on app load
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      setIsLoggedIn(authenticated);
      setIsLoading(false);
    };

    checkAuth();

    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Guest mode: Show dashboard and limited functionality without login
  if (!isLoggedIn) {
    return (
      <>
        <div className="flex min-h-screen">
          {/* Sidebar for guests (limited functionality) */}
          <aside className="w-64 flex-none border-r overflow-y-auto">
            <div className="w-full h-full">
              <Sidebar />
            </div>
          </aside>

          {/* Main Content for guests */}
          <main className="flex-1 overflow-y-auto">
            <ToastContainer />
            <Routes>
              {/* Default route shows dashboard for guests */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/login" element={<Signup_Login />} />
              <Route path="/update-password" element={<UpdatePassword />} />
              
              {/* Protected routes redirect to login */}
              <Route path="/profile" element={<Navigate to="/login" replace />} />
              <Route path="/create-course" element={<Navigate to="/login" replace />} />
              <Route path="/view-courses" element={<Navigate to="/login" replace />} />
              <Route path="/ViewCreatedCourse" element={<Navigate to="/login" replace />} />
              <Route path="/courses" element={<Navigate to="/login" replace />} />
              <Route path="/instructor-details" element={<Navigate to="/login" replace />} />
              <Route path="/EnrollmentOverview" element={<Navigate to="/login" replace />} />
              <Route path="/QuizCreation" element={<Navigate to="/login" replace />} />
              <Route path="/CommentsReplies" element={<Navigate to="/login" replace />} />
              <Route path="/courses/:courseId/curriculum" element={<Navigate to="/login" replace />} />
              <Route path="/learner" element={<Navigate to="/login" replace />} />
              
              {/* Fallback route goes to dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </>
    );
  }

  // If logged in, show the full dashboard with sidebar and protected routes
  return (
    <>
      <div className="flex min-h-screen">
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <ToastContainer />
          <Routes>
            {/* Default route redirects to dashboard when logged in */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<Navigate to="/dashboard" replace />} />
            <Route path="/update-password" element={<UpdatePassword />} />
            <Route path="/instructor-details" element={<InstructorDetails />} />
            <Route path="/profile" element={<Profile />} />
            <Route
              path="/courses/:courseId/curriculum"
              element={<CurriculumPage />}
            />
            <Route path="/ViewCreatedCourse" element={<ViewCreatedCourses />} />
            <Route
              path="/EnrollmentOverview"
              element={<EnrollmentOverview />}
            />
            <Route path="/create-quiz/:lessonId" element={<QuizCreation />} />
            <Route
              path="/edit-quiz/:lessonId/:quizId"
              element={<QuizEditor />}
            />
            <Route path="/view-quizes/:lessonId" element={<QuizViewer />} />
            <Route path="/courses" element={<ViewCreatedCourses />} />
            <Route path="/CommentsReplies" element={<CommentsReplies />} />
            <Route path="/create-course" element={<CreateCourse />} />
            <Route path="/view-courses" element={<ViewCreatedCourse />} />
            <Route path="/courses/:courseId/submissions" element={<StudentSubmission />} />
            <Route path="/learner" element={<LearnerFeedbackCarousel />} />
            
            {/* Fallback route redirects to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </>
  );
}

export default App;
