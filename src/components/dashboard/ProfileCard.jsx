import { Card, CardContent } from "../dashboard1/ui/card.jsx";
import { Mail, User, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { logout } from "../../utils/auth.js";

export const ProfileCard = () => {
  const [userName, setUserName] = useState("Guest");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    // Get user data from localStorage or decode from token
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUserName(userData.username || userData.name || userData.email || "Instructor");
        setUserEmail(userData.email || "");
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    } else if (token) {
      // If no stored user but we have a token, try to decode it
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserName(payload.username || payload.name || "Instructor");
        setUserEmail(payload.email || "");
      } catch (error) {
        console.error("Error decoding token:", error);
      }
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
        
        {/* Signout Button */}
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to sign out?')) {
              logout();
            }
          }}
          className="mt-4 px-6 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 mx-auto"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </CardContent>
    </Card>
  );
};
