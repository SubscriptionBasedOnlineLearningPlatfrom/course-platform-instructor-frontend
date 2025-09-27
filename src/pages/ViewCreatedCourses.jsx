import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/createCourse/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/createCourse/ui/card";
import { ArrowLeft, Edit, Trash2, Eye, Clock, Users } from "lucide-react";
import { toast } from "sonner";
import { courseAPI } from "../services/api";

const ViewCreatedCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error("Please login first");
        navigate("/");
        return;
      }

      const result = await courseAPI.getInstructorCourses();
      setCourses(result.data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      await courseAPI.deleteCourse(courseId);
      toast.success("Course deleted successfully");
      fetchCourses(); // Refresh the list
    } catch (error) {
      console.error("Error deleting course:", error);
      toast.error("Failed to delete course");
    }
  };

  // Removed status-related functions since we're not using status

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 bg-blue-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-sky-800">Loading your courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 bg-blue-100 p-8">
      <main className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="bg-blue-100 hover:text-sky-100 transition transform hover:scale-110"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-5xl font-extrabold bg-gradient-to-r bg-blue-400 bg-clip-text text-transparent drop-shadow-lg">
                My Courses
              </h1>
              <p className="text-lg text-sky-800 opacity-80">
                Manage your created courses 📚
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate("/create-course")}
            className="px-6 py-3 rounded-xl bg-gradient-to-r bg-blue-400 text-white font-semibold shadow-lg hover:opacity-90 transition"
          >
            Create New Course
          </Button>
        </div>

        {/* Courses Grid */}
        {courses.length === 0 ? (
          <Card className="bg-white/40 backdrop-blur-xl border border-sky-200 shadow-2xl rounded-2xl p-16 text-center">
            <div className="text-6xl mb-6">📖</div>
            <h2 className="text-2xl font-bold text-sky-800 mb-4">No courses yet</h2>
            <p className="text-sky-600 mb-8">Create your first course to get started!</p>
            <Button
              onClick={() => navigate("/create-course")}
              className="px-8 py-3 rounded-xl bg-gradient-to-r bg-blue-400 text-white font-semibold shadow-lg hover:opacity-90 transition"
            >
              Create Your First Course
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <Card
                key={course.course_id}
                className="bg-white/40 backdrop-blur-xl border border-sky-200 shadow-2xl rounded-2xl overflow-hidden hover:shadow-3xl transition-all duration-300 hover:scale-105"
              >
                <CardHeader className="bg-gradient-to-r bg-blue-400 text-white p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl font-bold truncate">
                        {course.course_title}
                      </CardTitle>
                      <CardDescription className="text-white/80 mt-1">
                        {course.category}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full">
                        ⭐ {course.rating || 0}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-4">
                  <p className="text-gray-700 text-sm line-clamp-3">
                    {course.course_description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{course.duration || 0}h</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {course.level}
                      </span>
                    </div>
                  </div>

            

                  <div className="flex items-center justify-between pt-4 border-t border-sky-200">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/course/${course.course_id}`)}
                        className="border-sky-300 text-sky-700 hover:bg-sky-100"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/course/${course.course_id}/edit`)}
                        className="border-blue-300 text-blue-700 hover:bg-blue-100"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteCourse(course.course_id, course.course_title)}
                        className="border-red-300 text-red-700 hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ViewCreatedCourses;