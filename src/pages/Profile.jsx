import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/dashboard1/ui/card.jsx";
import { Button } from "../components/dashboard1/ui/button.jsx";
import { Input } from "../components/dashboard1/ui/input.jsx";
import { Textarea } from "../components/dashboard1/ui/textarea.jsx";
import { Label } from "../components/dashboard1/ui/label.jsx";
import { User, Mail, Phone, Globe, BookOpen, Save, Edit, Instagram } from "lucide-react";
import ProfileImageUpload from "../components/ProfileImageUpload.jsx";
import { toast } from "react-hot-toast";

const Profile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [instructorId, setInstructorId] = useState(null);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    bio: '',
    phone: '',
    website: '',
    portfolio: '',
    instagram: '',
    expertise: [],
    profile_image_url: ''
  });

  useEffect(() => {
    // Get instructor ID from localStorage or token
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setInstructorId(userData.id || userData.instructor_id);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    } else if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setInstructorId(payload.id || payload.instructor_id);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (instructorId) {
      fetchProfile();
    }
  }, [instructorId]);

  const fetchProfile = async () => {
    if (!instructorId) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:4000"}/instructor/profile/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.instructor) {
          const socialLinks = data.instructor.social_links || {};
          setProfileData({
            name: data.instructor.name || '',
            email: data.instructor.email || '',
            bio: data.instructor.bio || '',
            phone: data.instructor.phone || '',
            website: data.instructor.website || '',
            portfolio: socialLinks.portfolio || '',
            instagram: socialLinks.instagram || '',
            expertise: data.instructor.expertise || [],
            profile_image_url: data.instructor.profile_image_url || ''
          });
        }
      } else {
        toast.error('Failed to load profile data');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Error loading profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleExpertiseChange = (value) => {
    // Convert comma-separated string to array
    const expertiseArray = value.split(',').map(item => item.trim()).filter(item => item);
    setProfileData(prev => ({
      ...prev,
      expertise: expertiseArray
    }));
  };

  const handleSaveProfile = async () => {
    if (!instructorId) {
      toast.error('Instructor ID not found');
      return;
    }

    if (!profileData.name || !profileData.email) {
      toast.error('Name and email are required');
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      
      // Prepare social links object
      const socialLinks = {};
      if (profileData.portfolio) socialLinks.portfolio = profileData.portfolio;
      if (profileData.instagram) socialLinks.instagram = profileData.instagram;

      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:4000"}/instructor/profile/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: profileData.name,
          email: profileData.email,
          bio: profileData.bio,
          phone: profileData.phone,
          website: profileData.website,
          social_links: socialLinks,
          expertise: profileData.expertise
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Profile updated successfully!');
        setIsEditing(false); // Exit edit mode after saving
        
        // Update localStorage with new profile data
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          userData.name = profileData.name;
          userData.email = profileData.email;
          localStorage.setItem('user', JSON.stringify(userData));
        }
        
        // Refresh profile data
        fetchProfile();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Error saving profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // If canceling edit, refresh data to reset any unsaved changes
      fetchProfile();
    }
    setIsEditing(!isEditing);
  };

  const handleImageUpdate = (newImageUrl) => {
    setProfileData(prev => ({
      ...prev,
      profile_image_url: newImageUrl
    }));
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-lg">Loading profile...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 relative particles">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
      <div className="relative z-10 p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-6 w-6" />
              My Profile
            </div>
            {!isEditing && (
              <Button 
                onClick={handleEditToggle}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Image Section */}
          <div className="flex flex-col items-center space-y-4">
            <h3 className="text-lg font-semibold">Profile Image</h3>
            {isEditing ? (
              <ProfileImageUpload 
                onImageUpdate={handleImageUpdate}
                instructorId={instructorId}
                currentImageUrl={profileData.profile_image_url}
              />
            ) : (
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                {profileData.profile_image_url ? (
                  <img 
                    src={profileData.profile_image_url} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-16 w-16 text-gray-400" />
                )}
              </div>
            )}
          </div>

          {/* Basic Information */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Full Name *
              </Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded border">
                  {profileData.name || 'Not provided'}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address *
              </Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your.email@example.com"
                  required
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded border">
                  {profileData.email || 'Not provided'}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number
              </Label>
              {isEditing ? (
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded border">
                  {profileData.phone || 'Not provided'}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="website" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Website/Portfolio
              </Label>
              {isEditing ? (
                <Input
                  id="website"
                  type="url"
                  value={profileData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://yourwebsite.com"
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded border">
                  {profileData.website ? (
                    <a 
                      href={profileData.website} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 hover:underline flex items-center gap-2"
                    >
                      <Globe className="h-4 w-4" />
                      {profileData.website}
                    </a>
                  ) : (
                    'Not provided'
                  )}
                </div>
              )}
            </div>
            {/* Social Media Fields */}
            <div className="space-y-2">
              <Label htmlFor="portfolio" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Portfolio URL
              </Label>
              {isEditing ? (
                <Input
                  id="portfolio"
                  type="url"
                  value={profileData.portfolio}
                  onChange={(e) => handleInputChange('portfolio', e.target.value)}
                  placeholder="https://yourportfolio.com"
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded border">
                  {profileData.portfolio ? (
                    <a 
                      href={profileData.portfolio} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 hover:underline flex items-center gap-2"
                    >
                      <Globe className="h-4 w-4" />
                      {profileData.portfolio}
                    </a>
                  ) : (
                    'Not provided'
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram" className="flex items-center gap-2">
                <Instagram className="h-4 w-4" />
                Instagram
              </Label>
              {isEditing ? (
                <Input
                  id="instagram"
                  value={profileData.instagram}
                  onChange={(e) => handleInputChange('instagram', e.target.value)}
                  placeholder="@yourusername or https://instagram.com/yourusername"
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded border">
                  {profileData.instagram ? (
                    <a 
                      href={
                        profileData.instagram.startsWith('http') 
                          ? profileData.instagram 
                          : `https://instagram.com/${profileData.instagram.replace('@', '')}`
                      } 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 hover:underline flex items-center gap-2"
                    >
                      <Instagram className="h-4 w-4" />
                      {profileData.instagram.startsWith('http') 
                        ? profileData.instagram 
                        : `@${profileData.instagram.replace('@', '')}`
                      }
                    </a>
                  ) : (
                    'Not provided'
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bio Section */}
          <div className="space-y-2">
            <Label htmlFor="bio">About Me / Bio</Label>
            {isEditing ? (
              <Textarea
                id="bio"
                value={profileData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell students about yourself, your experience, and teaching philosophy..."
                className="min-h-[120px]"
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded border min-h-[120px]">
                {profileData.bio || 'No bio provided yet.'}
              </div>
            )}
          </div>

          {/* Expertise Section */}
          <div className="space-y-2">
            <Label htmlFor="expertise" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Areas of Expertise
            </Label>
            {isEditing ? (
              <>
                <Input
                  id="expertise"
                  value={profileData.expertise.join(', ')}
                  onChange={(e) => handleExpertiseChange(e.target.value)}
                  placeholder="JavaScript, React, Node.js, Python, Machine Learning (separate with commas)"
                />
                <p className="text-sm text-gray-500">
                  Enter your skills and expertise areas separated by commas
                </p>
              </>
            ) : (
              <div className="p-2 bg-gray-50 rounded border">
                {profileData.expertise && profileData.expertise.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profileData.expertise.map((skill, index) => (
                      <span 
                        key={index} 
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  'No expertise areas added yet.'
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex justify-end gap-3 pt-6">
              <Button 
                onClick={handleEditToggle}
                variant="outline"
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default Profile;