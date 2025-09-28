import { Card } from "../dashboard1/ui/card.jsx";
import { Button } from "../dashboard1/ui/button.jsx";
import { Progress } from "../dashboard1/ui/progress.jsx";
import { Users, BookOpen, Star, Plus, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { courseAPI } from "../../services/api";

const gradientColors = [
  "from-blue-500 to-indigo-600",
  "from-green-400 to-emerald-600",
  "from-orange-400 to-red-500",
  "from-purple-500 to-pink-600"
];

export const CourseOverview = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInstructorCourses();
  }, []);

  const fetchInstructorCourses = async () => {
    try {
      setLoading(true);
      const result = await courseAPI.getInstructorCourses();
      
      // Transform the data to match the component's expected format
      const transformedCourses = (result.data || []).map((course, index) => ({
        id: course.course_id,
        title: course.course_title,
        students: Math.floor(Math.random() * 50) + 10, // Random for now, replace with real data
        progress: Math.floor(Math.random() * 100), // Random for now, replace with real data  
        rating: (4.5 + Math.random() * 0.5).toFixed(1), // Random 4.5-5.0 rating
        description: course.course_description,
        category: course.category,
        level: course.level,
        created_at: course.created_at
      }));
      
      setCourses(transformedCourses);
    } catch (err) {
      console.error("Error fetching instructor courses:", err);
      setError("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <Card className="p-6 shadow-lg">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading your courses...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 shadow-lg">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchInstructorCourses} variant="outline">
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 shadow-lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Your Courses ({courses.length})
          </h3>
          <Link to="/create-course">
            <Button size="sm" className="gap-2 shadow-md">
              <Plus className="h-4 w-4" />
              Create Course
            </Button>
          </Link>
        </div>

        {/* Empty State */}
        {courses.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto" />
            <div>
              <h4 className="text-lg font-semibold text-gray-700">No courses yet</h4>
              <p className="text-gray-500 mt-2">Start creating your first course to share your knowledge!</p>
            </div>
            <Link to="/create-course">
              <Button className="gap-2 mt-4">
                <Plus className="h-4 w-4" />
                Create Your First Course
              </Button>
            </Link>
          </div>
        ) : (
          /* Courses List */
          <div className="space-y-4">
            {courses.map((course, idx) => (
            <div
              key={course.id}
              className="flex items-center gap-4 p-5 rounded-xl border border-border bg-white/50 backdrop-blur-sm
              hover:shadow-xl hover:scale-[1.01] transition-all duration-300"
            >
              {/* Icon with gradient */}
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-r ${
                  gradientColors[idx % gradientColors.length]
                } shadow-md`}
              >
                <BookOpen className="h-7 w-7 text-white" />
              </div>

              {/* Content */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <h4 className="font-medium text-foreground text-base">
                    {course.title}
                  </h4>
                  <span
                    className={`px-2.5 py-0.5 text-xs font-semibold rounded-full shadow-sm ${
                      course.status === "published"
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {course.status}
                  </span>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-5 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    {course.students} students
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {course.rating}
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Course Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <Progress
                    value={course.progress}
                    className="h-2 bg-gray-200"
                    indicatorClassName="bg-gradient-to-r from-blue-500 to-purple-500"
                  />
                </div>
              </div>

              {/* View Button */}
              <Link to={`/courses/${course.id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 hover:bg-blue-50"
                >
                  View
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          ))}
          </div>
        )}
      </div>
    </Card>
  );
};
