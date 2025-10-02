import { Card, CardContent } from "../dashboard1/ui/card.jsx";
import { Mail, User, LogOut, Eye, LogIn } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { logout } from "../../utils/auth.js";

export const ProfileCard = () => {
  const [userName, setUserName] = useState("Guest");
  const [userEmail, setUserEmail] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Get user data from localStorage or decode from token
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUserName(userData.username || userData.name || userData.email || "Instructor");
        setUserEmail(userData.email || "");
        setIsLoggedIn(true);
      } catch (error) {
        console.error("Error parsing user data:", error);
        setIsLoggedIn(false);
      }
    } else if (token) {
      // If no stored user but we have a token, try to decode it
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        // Check if token is expired
        const now = Date.now() / 1000;
        if (payload.exp && payload.exp < now) {
          console.log("Token expired, clearing localStorage");
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsLoggedIn(false);
          return;
        }
        
        setUserName(payload.username || payload.name || "Instructor");
        setUserEmail(payload.email || "");
        setIsLoggedIn(true);
      } catch (error) {
        console.error("Error decoding token:", error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  return (
    <Card className="w-full bg-blue-100 border border-blue-200 shadow-md rounded-xl">
      <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <User className="h-8 w-8 text-blue-900" />
          <h1 className="text-4xl font-extrabold text-blue-900">Hello, {userName}!</h1>
        </div>
        {userEmail && (
          <div className="flex items-center gap-3 text-blue-800 text-lg font-bold">
            <Mail className="h-6 w-6" />
            <span>{userEmail}</span>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          {isLoggedIn ? (
            <>
              <Link
                to="/instructor-details"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Eye className="h-4 w-4" />
                View Details
              </Link>
              
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to sign out?')) {
                    logout();
                  }
                }}
                className="px-6 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </>
          ) : (
            <Link
              to="/"
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <LogIn className="h-4 w-4" />
              Login
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
