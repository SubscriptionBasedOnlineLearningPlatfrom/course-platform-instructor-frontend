import React, { useState, useEffect } from 'react';

import { Card, CardContent } from '../dashboard1/ui/card.jsx';
import { 
  User, 
  Mail, 
  MapPin,
  Phone,
  Edit3,
  Save,
  X,
  BookOpen,
  Instagram,
  Facebook,
  Star,
  Award,
  Camera,
  Upload
} from 'lucide-react';
import { useApi } from '../../contexts/APIContext.jsx';

const InstructorDetails = () => {
  const { api } = useApi();
  const [instructorData, setInstructorData] = useState({
    name: '',
    email: '',
    joinDate: '',
    totalCourses: 0,
    bio: '',
    location: '',
    phone: '',
    instagram: '',
    facebook: '',
    track: '',
    profilePicture: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    loadInstructorDetails();
  }, []);

  const loadInstructorDetails = async () => {
    try {
      setIsLoading(true);
      
      // Get user data from localStorage
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      let userData = {};
      if (storedUser) {
        userData = JSON.parse(storedUser);
      } else if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userData = payload;
      }

      // Try to restore profile data from backup if available
      const userEmail = userData.email;
      if (userEmail) {
        const profileBackup = localStorage.getItem(`profile_${userEmail}`);
        if (profileBackup) {
          const backup = JSON.parse(profileBackup);
          // Merge backup data with current user data
          userData = {
            ...userData,
            ...backup.profileData
          };
        }
      }

      // Fetch courses data for statistics
      let coursesData = [];
      try {
        const response = await api.get('/instructor/courses');
        coursesData = response.data.data || [];
      } catch (error) {
        console.error('Error fetching courses:', error);
        coursesData = [];
      }

      // Calculate join date from earliest course
      const joinDate = coursesData.length > 0 
        ? new Date(Math.min(...coursesData.map(course => new Date(course.created_at)))).toLocaleDateString()
        : new Date().toLocaleDateString();

      // Calculate statistics
      const totalCourses = coursesData.length;
      const totalHours = coursesData.reduce((sum, course) => {
        const duration = parseFloat(course.duration) || 0;
        return sum + duration;
      }, 0);

      setInstructorData({
        name: userData.username || userData.name || 'Instructor',
        email: userData.email || '',
        joinDate: joinDate,
        totalCourses: totalCourses,
        bio: userData.bio || 'I chose the Instructor Track because I aspire to share knowledge and inspire learning.',
        location: userData.location || 'Location',
        phone: userData.phone || '',
        instagram: userData.instagram || '',
        facebook: userData.facebook || '',
        track: userData.track || 'INSTRUCTOR TRACK',
        profilePicture: userData.profilePicture || ''
      });

      setEditData({
        bio: userData.bio || 'I chose the Instructor Track because I aspire to share knowledge and inspire learning.',
        location: userData.location || 'Location',
        phone: userData.phone || '',
        instagram: userData.instagram || '',
        facebook: userData.facebook || '',
        track: userData.track || 'INSTRUCTOR TRACK',
        profilePicture: userData.profilePicture || ''
      });

    } catch (error) {
      console.error('Error loading instructor details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEdit = () => {
    // Update localStorage with new data
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      const updatedUser = {
        ...userData,
        bio: editData.bio,
        location: editData.location,
        phone: editData.phone,
        instagram: editData.instagram,
        facebook: editData.facebook,
        track: editData.track,
        profilePicture: editData.profilePicture
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Also store in a separate profile backup key for persistence
      const profileBackup = {
        email: userData.email,
        profileData: {
          bio: editData.bio,
          location: editData.location,
          phone: editData.phone,
          instagram: editData.instagram,
          facebook: editData.facebook,
          track: editData.track,
          profilePicture: editData.profilePicture
        },
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(`profile_${userData.email}`, JSON.stringify(profileBackup));
    }

    // Update state
    setInstructorData(prev => ({
      ...prev,
      bio: editData.bio,
      location: editData.location,
      phone: editData.phone,
      instagram: editData.instagram,
      facebook: editData.facebook,
      track: editData.track,
      profilePicture: editData.profilePicture
    }));

    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditData({
      bio: instructorData.bio,
      location: instructorData.location,
      phone: instructorData.phone,
      instagram: instructorData.instagram,
      facebook: instructorData.facebook,
      track: instructorData.track,
      profilePicture: instructorData.profilePicture
    });
    setIsEditing(false);
  };

  const handleProfilePictureChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditData(prev => ({
          ...prev,
          profilePicture: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6">
      <div className="max-w-md mx-auto">
        {/* Profile Card - Blue Theme Design */}
        <Card className="overflow-hidden bg-gradient-to-br from-blue-300 via-blue-600 to-cyan-800 text-white relative shadow-2xl transform hover:scale-105 transition-all duration-300">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8"></div>
          
          {/* Edit Button - Always visible and functional */}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 p-2 rounded-full transition-all duration-200 z-10 hover:rotate-12"
            title={isEditing ? "Cancel editing" : "Edit profile"}
          >
            {isEditing ? (
              <X className="h-5 w-5 text-white" />
            ) : (
              <Edit3 className="h-5 w-5 text-white" />
            )}
          </button>

          <CardContent className="p-8 text-center relative z-10">
            {/* Profile Image with Blue Glow Effect - Editable */}
            <div className="relative mb-6">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-400/30 to-cyan-500/20 rounded-full flex items-center justify-center border-4 border-blue-300/40 backdrop-blur-sm shadow-xl overflow-hidden">
                {instructorData.profilePicture || editData.profilePicture ? (
                  <img 
                    src={editData.profilePicture || instructorData.profilePicture} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-16 w-16 text-white drop-shadow-lg" />
                )}
              </div>
              <div className="absolute inset-0 w-32 h-32 mx-auto rounded-full bg-blue-400/20 blur-xl"></div>
              
              {/* Profile Picture Edit Button */}
              {isEditing && (
                <label className="absolute bottom-0 right-1/2 transform translate-x-1/2 translate-y-2 bg-cyan-500 hover:bg-cyan-600 text-white p-2 rounded-full cursor-pointer transition-all shadow-lg hover:shadow-xl">
                  <Camera className="h-4 w-4" />
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleProfilePictureChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Name with Blue Glow */}
            <h1 className="text-3xl font-bold text-white mb-2 uppercase tracking-wide drop-shadow-lg">
              {instructorData.name}
            </h1>

            {/* Track with Blue Design */}
            {isEditing ? (
              <input
                type="text"
                value={editData.track}
                onChange={(e) => setEditData(prev => ({...prev, track: e.target.value}))}
                className="w-full p-3 mb-6 bg-blue-500/20 backdrop-blur-sm border border-blue-300/30 rounded-xl text-white placeholder-white/70 text-center font-medium focus:bg-blue-400/30 transition-all"
                placeholder="Track (e.g. INSTRUCTOR TRACK)"
              />
            ) : (
              <div className="mb-6 p-3 bg-blue-500/20 backdrop-blur-sm rounded-xl border border-blue-300/30">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Award className="h-4 w-4 text-cyan-300" />
                  <p className="text-white/90 font-medium text-sm uppercase tracking-widest">
                    {instructorData.track}
                  </p>
                </div>
              </div>
            )}

            {/* Bio with Blue Glass Effect */}
            {isEditing ? (
              <textarea
                value={editData.bio}
                onChange={(e) => setEditData(prev => ({...prev, bio: e.target.value}))}
                rows={4}
                className="w-full p-3 mb-6 bg-blue-500/20 backdrop-blur-sm border border-blue-300/30 rounded-xl text-white placeholder-white/70 focus:bg-blue-400/30 transition-all"
                placeholder="Tell us about yourself..."
              />
            ) : (
              <div className="mb-6 p-4 bg-blue-500/15 backdrop-blur-sm rounded-xl border border-blue-300/20">
                <p className="text-white/90 leading-relaxed text-sm italic">
                  "{instructorData.bio}"
                </p>
              </div>
            )}

            {/* Course Count with Blue Stats */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-500/20 to-cyan-600/10 backdrop-blur-sm rounded-xl border border-blue-300/30 hover:from-blue-400/30 hover:to-cyan-500/20 transition-all">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="p-2 bg-cyan-400/20 rounded-lg">
                  <BookOpen className="h-6 w-6 text-cyan-300" />
                </div>
                <span className="text-white font-medium">Courses Created</span>
              </div>
              <div className="text-3xl font-bold text-white drop-shadow-lg">
                {instructorData.totalCourses}
                <span className="text-lg text-white/70 ml-1">courses</span>
              </div>
            </div>

            {/* Contact Information with Blue Theme Icons */}
            <div className="space-y-3 mb-6">
              {/* Email */}
              <div className="flex items-center justify-center gap-3 p-2 bg-blue-500/10 rounded-lg backdrop-blur-sm">
                <div className="p-1 bg-cyan-400/20 rounded">
                  <Mail className="h-4 w-4 text-cyan-300" />
                </div>
                <span className="text-white/90 text-sm">{instructorData.email}</span>
              </div>

              {/* Phone */}
              <div className="flex items-center justify-center gap-3 p-2 bg-blue-500/10 rounded-lg backdrop-blur-sm">
                <div className="p-1 bg-blue-400/20 rounded">
                  <Phone className="h-4 w-4 text-blue-300" />
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.phone}
                    onChange={(e) => setEditData(prev => ({...prev, phone: e.target.value}))}
                    className="flex-1 max-w-[180px] p-1 bg-blue-500/20 border border-blue-300/30 rounded text-white placeholder-white/70 text-sm"
                    placeholder="Phone number"
                  />
                ) : (
                  <span className="text-white/90 text-sm">{instructorData.phone || 'Phone not provided'}</span>
                )}
              </div>

              {/* Location */}
              <div className="flex items-center justify-center gap-3 p-2 bg-blue-500/10 rounded-lg backdrop-blur-sm">
                <div className="p-1 bg-indigo-400/20 rounded">
                  <MapPin className="h-4 w-4 text-indigo-300" />
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.location}
                    onChange={(e) => setEditData(prev => ({...prev, location: e.target.value}))}
                    className="flex-1 max-w-[180px] p-1 bg-blue-500/20 border border-blue-300/30 rounded text-white placeholder-white/70 text-sm"
                    placeholder="Location"
                  />
                ) : (
                  <span className="text-white/90 text-sm">{instructorData.location}</span>
                )}
              </div>
            </div>

            {/* Social Media Links - Editable by Instructor */}
            <div className="mb-6 p-4 bg-blue-500/15 backdrop-blur-sm rounded-xl border border-blue-300/20">
              <h3 className="text-white font-medium text-center mb-4 text-sm uppercase tracking-wide">Social Media</h3>
              
              <div className="space-y-3">
                {/* Instagram */}
                <div className="flex items-center gap-3 p-2 bg-blue-600/20 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Instagram className="h-4 w-4 text-white" />
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.instagram}
                      onChange={(e) => setEditData(prev => ({...prev, instagram: e.target.value}))}
                      className="flex-1 p-2 bg-blue-500/20 border border-blue-300/30 rounded text-white placeholder-white/70 text-sm"
                      placeholder="Instagram username (without @)"
                    />
                  ) : (
                    <div className="flex-1">
                      {instructorData.instagram ? (
                        <a
                          href={`https://instagram.com/${instructorData.instagram}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white/90 hover:text-white transition-colors text-sm"
                        >
                          @{instructorData.instagram}
                        </a>
                      ) : (
                        <span className="text-white/50 text-sm">Instagram not provided</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Facebook */}
                <div className="flex items-center gap-3 p-2 bg-blue-600/20 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Facebook className="h-4 w-4 text-white" />
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.facebook}
                      onChange={(e) => setEditData(prev => ({...prev, facebook: e.target.value}))}
                      className="flex-1 p-2 bg-blue-500/20 border border-blue-300/30 rounded text-white placeholder-white/70 text-sm"
                      placeholder="Facebook username or page name"
                    />
                  ) : (
                    <div className="flex-1">
                      {instructorData.facebook ? (
                        <a
                          href={`https://facebook.com/${instructorData.facebook}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white/90 hover:text-white transition-colors text-sm"
                        >
                          /{instructorData.facebook}
                        </a>
                      ) : (
                        <span className="text-white/50 text-sm">Facebook not provided</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Edit Actions with Blue Style */}
            {isEditing ? (
              <div className="flex justify-center gap-3">
                <button
                  onClick={handleSaveEdit}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Save className="h-4 w-4" />
                  Save Changes
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-500/20 backdrop-blur-sm text-white rounded-xl hover:bg-blue-400/30 transition-all font-medium border border-blue-300/30"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex justify-center">
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500/20 to-cyan-600/20 backdrop-blur-sm text-white rounded-xl hover:from-blue-400/30 hover:to-cyan-500/30 transition-all font-medium border border-blue-300/30 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit Profile
                </button>
              </div>
            )}

            {/* Rating Stars Decoration with Blue Theme */}
            <div className="flex justify-center gap-1 mt-4 opacity-60">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3 w-3 text-cyan-300 fill-current" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InstructorDetails;