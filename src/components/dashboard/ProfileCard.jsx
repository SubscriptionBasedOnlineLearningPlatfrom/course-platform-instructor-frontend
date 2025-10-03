import { Card, CardContent } from "../dashboard1/ui/card.jsx";
import { Mail, User, LogOut, Eye, LogIn, Globe, Instagram } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { logout } from "../../utils/auth.js";
import ProfileImageUpload from "../ProfileImageUpload.jsx";

export const ProfileCard = () => {
  const [userName, setUserName] = useState("Guest");
  const [userEmail, setUserEmail] = useState("");
  const [userBio, setUserBio] = useState("");
  const [socialLinks, setSocialLinks] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [instructorId, setInstructorId] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState(null);

  useEffect(() => {
    // Get user data from localStorage or decode from token
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUserName(userData.username || userData.name || userData.email || "Instructor");
        setUserEmail(userData.email || "");
        setInstructorId(userData.id || userData.instructor_id);
        setProfileImageUrl(userData.profile_image_url);
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
        setInstructorId(payload.id || payload.instructor_id);
        setProfileImageUrl(payload.profile_image_url);
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

  // Separate useEffect to fetch instructor profile when instructorId changes
  useEffect(() => {
    if (isLoggedIn && instructorId) {
      fetchInstructorProfile();
    }
  }, [instructorId, isLoggedIn]);

  const fetchInstructorProfile = async () => {
    if (!instructorId) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/instructor/profile/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Update profile data from backend
        if (data.instructor) {
          const instructor = data.instructor;
          
          // Update all profile fields
          setUserName(instructor.name || "Instructor");
          setUserEmail(instructor.email || "");
          setUserBio(instructor.bio || "");
          setSocialLinks(instructor.social_links || {});
          setProfileImageUrl(instructor.profile_image_url || null);
          
          // Update localStorage with latest profile data
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            userData.name = instructor.name;
            userData.email = instructor.email;
            userData.bio = instructor.bio;
            userData.social_links = instructor.social_links;
            userData.profile_image_url = instructor.profile_image_url;
            localStorage.setItem('user', JSON.stringify(userData));
          }
        } else {
          // If no profile data in database, clear the cached data
          setProfileImageUrl(null);
        }
      } else {
        console.log('Failed to fetch instructor profile:', response.status);
      }
    } catch (error) {
      console.error('Error fetching instructor profile:', error);
    }
  };

  const handleImageUpdate = (newImageUrl) => {
    setProfileImageUrl(newImageUrl);
    
    // Update localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      userData.profile_image_url = newImageUrl;
      localStorage.setItem('user', JSON.stringify(userData));
    }
  };

  return (
    <Card className="w-full bg-blue-100 border border-blue-200 shadow-md rounded-xl">
      <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
        {/* Profile Image Upload */}
        {isLoggedIn && instructorId && (
          <div className="mb-4">
            <ProfileImageUpload
              currentImageUrl={profileImageUrl}
              instructorId={instructorId}
              onImageUpdate={handleImageUpdate}
            />
          </div>
        )}
        
        <div className="flex items-center gap-3 mb-2">
          {!isLoggedIn && <User className="h-8 w-8 text-blue-900" />}
          <h1 className="text-4xl font-extrabold text-blue-900">Hello, {userName}!</h1>
        </div>
        {userEmail && (
          <div className="flex items-center gap-3 text-blue-800 text-lg font-bold">
            <Mail className="h-6 w-6" />
            <span>{userEmail}</span>
          </div>
        )}
        
        {userBio && (
          <div className="text-blue-700 text-center max-w-md">
            <p className="text-sm">{userBio}</p>
          </div>
        )}
        
        {/* Social Media Links */}
        {(socialLinks.portfolio || socialLinks.instagram) && (
          <div className="flex items-center justify-center gap-4 mt-3 mb-2">
            {socialLinks.portfolio && (
              <a 
                href={socialLinks.portfolio} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 hover:from-blue-700 hover:via-blue-600 hover:to-cyan-500 text-white rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                title="Visit Portfolio"
              >
                <Globe className="h-5 w-5 text-white" />
                Portfolio
              </a>
            )}
            {socialLinks.instagram && (
              <a 
                href={
                  socialLinks.instagram.startsWith('http') 
                    ? socialLinks.instagram 
                    : `https://instagram.com/${socialLinks.instagram.replace('@', '').replace('https://www.instagram.com/', '').replace('?igsh=', '').split('?')[0].split('&')[0]}`
                } 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 hover:from-purple-700 hover:via-pink-600 hover:to-orange-500 text-white rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                title="Follow on Instagram"
              >
                <Instagram className="h-5 w-5 text-white" />
                @{socialLinks.instagram.replace('@', '').replace('https://www.instagram.com/', '').replace('?igsh=', '').split('?')[0].split('&')[0]}
              </a>
            )}
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          {isLoggedIn ? (
            <>
              <Link
                to="/profile"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Edit Profile
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
