import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import Sidebar from "./components/Sidebar";

import LearnerFeedbackCarousel from "./components/LearnerFeedbackCarousel";
import ViewCreatedCourse from "./pages/ViewCreatedCourses";
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
import InstructorDetails from './components/instructor/InstructorDetails';
import Profile from "./pages/Profile";
import QuizViewer from "./components/quizes/ViewQuizes";
import QuizEditor from "./components/quizes/QuizEditor";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 flex-none border-r overflow-y-auto">
          <div className="w-full h-full">
            <Sidebar />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <ToastContainer />
          <Routes>
            <Route path="/" element={<Signup_Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/update-password" element={<UpdatePassword />} />
            <Route path="/instructor-details" element={<InstructorDetails />} />
            <Route path='/profile' element={<Profile /> } />
            <Route
              path="/courses/:courseId/curriculum"
              element={<CurriculumPage />}
            />
            <Route path="/ViewCreatedCourse" element={<ViewCreatedCourses />} />
            <Route path="/EnrollmentOverview" element={<EnrollmentOverview />} />
            <Route path="/create-quiz/:lessonId" element={<QuizCreation />} />
            <Route path="/edit-quiz/:lessonId/:quizId" element={<QuizEditor />} />
            <Route path="/view-quizes/:lessonId" element={<QuizViewer />} />
            <Route path="/courses" element={<ViewCreatedCourses />} />
            <Route path="/CommentsReplies" element={<CommentsReplies />} />
            <Route path="/create-course" element={<CreateCourse />} />
            <Route path="/view-courses" element={<ViewCreatedCourse />} />
            <Route path="/learner" element={<LearnerFeedbackCarousel />} />
          </Routes>
        </main>
      </div>
    </>
  );
}

export default App;
