import { Card } from "../dashboard1/ui/card.jsx";
import { Button } from "../dashboard1/ui/button.jsx";
import { Progress } from "../dashboard1/ui/progress.jsx";
import { Users, BookOpen, Star, Plus, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const gradientColors = [
  "from-blue-500 to-indigo-600",
  "from-green-400 to-emerald-600",
  "from-orange-400 to-red-500",
  "from-purple-500 to-pink-600"
];

const courses = [
  {
    id: "1",
    title: "React Development Basics",
    students: 47,
    progress: 85,
    rating: 4.8,
    // status: "published"
  },
  {
    id: "2",
    title: "Advanced JavaScript",
    students: 32,
    progress: 65,
    rating: 4.9,
    // status: "published"
  },
  {
    id: "3",
    title: "Web Design Fundamentals",
    students: 23,
    progress: 40,
    rating: 4.7,
    // status: "draft"
  }
];

export const CourseOverview = () => {
  return (
    <Card className="p-6 shadow-lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Your Courses</h3>
          <Link to="/create-course">
            <Button size="sm" className="gap-2 shadow-md">
              <Plus className="h-4 w-4" />
              Create Course
            </Button>
          </Link>
        </div>

        {/* Courses List */}
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
      </div>
    </Card>
  );
};
