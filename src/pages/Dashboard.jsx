import { MetricCard}  from "../components/dashboard/MatricCard";
// import { RecentActivity } from "@/components/Dashboard/RecentActivity";
import { CourseOverview } from "../components/dashboard/CourseOverview";
import { Users, BookOpen, DollarSign, TrendingUp } from "lucide-react";
import { ProfileCard } from "../components/dashboard/ProfileCard";
import  HorizontalFeedbackCarousel  from "../components/LearnerFeedbackCarousel";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";


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

  return (
    <div className="min-h-screen bg-dashboard-bg">
      <div className="p-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's what's happening with your courses.
            </p>
            <ProfileCard />

          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Students"
              value={145}
              icon={Users}
              trend={{ value: 12, isPositive: true }}
              gradient="blue"
            />
            <MetricCard
              title="Active Courses"
              value={8}
              icon={BookOpen}
              trend={{ value: 2, isPositive: true }}
              gradient="green"
            />
            <MetricCard
              title="Total Revenue"
              value="$12,450"
              icon={DollarSign}
              trend={{ value: 8, isPositive: true }}
              gradient="orange"
            />
            <MetricCard
              title="Completion Rate"
              value="87%"
              icon={TrendingUp}
              trend={{ value: 5, isPositive: true }}
              gradient="purple"
            />
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
