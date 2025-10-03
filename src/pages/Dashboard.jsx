// import { RecentActivity } from "@/components/Dashboard/RecentActivity";
import { CourseOverview } from "../components/dashboard/CourseOverview";
import { ProfileCard } from "../components/dashboard/ProfileCard";
import  HorizontalFeedbackCarousel  from "../components/LearnerFeedbackCarousel";
import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";


const Index = () => {
  const location = useLocation();

  // Handle Google OAuth callback tokens
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get('token');
    const userDataParam = urlParams.get('user');
    
    if (token && userDataParam) {
      try {
        // Store token and user data from Google OAuth
        localStorage.setItem('token', token);
        const userData = JSON.parse(decodeURIComponent(userDataParam));
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Clean URL by removing parameters
        window.history.replaceState({}, document.title, '/dashboard');
        
        // Refresh the page to load user data
        window.location.reload();
      } catch (error) {
        console.error('Error handling Google OAuth callback:', error);
      }
    }
  }, [location]);

  const userIsAuthenticated = isAuthenticated();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative particles">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      <div className="relative z-10 p-8">
        <div className="space-y-8">
          {/* Guest Banner */}
          {!userIsAuthenticated && (
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="mb-4 md:mb-0">
                  <h2 className="text-2xl font-bold mb-2">Welcome to Our Learning Platform! 🎓</h2>
                  <p className="text-blue-100">
                    You're browsing in guest mode. Sign in to create courses, track progress, and access all instructor features.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link
                    to="/login"
                    className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              {userIsAuthenticated ? "Dashboard" : "Platform Overview"}
            </h1>
            <p className="text-muted-foreground">
              {userIsAuthenticated 
                ? "Welcome back! Here's what's happening with your courses."
                : "Explore our learning platform and see what instructors are creating."
              }
            </p>
            {userIsAuthenticated && <ProfileCard />}
          </div>



          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <CourseOverview />
            {/* <RecentAct,ivity /> */}
          </div>
        </div>
        <HorizontalFeedbackCarousel/>
      </div>
    </div>
  );
};

export default Index;
