import React, { use, useContext, useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaGraduationCap, FaBook, FaCode, FaPalette, FaBriefcase, FaGlobe } from "react-icons/fa";
import { AiFillDelete } from "react-icons/ai";
import { MdDoubleArrow } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../contexts/APIContext";
import { toast } from "react-toastify";

const ViewCreatedCourse = () => {
  const { BackendAPI } = useApi();
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    course_title: "",
    course_description: "",
    category: "",
  });

  // Get category icon and color
  const getCategoryDisplay = (category) => {
    const categoryMap = {
      programming: { icon: FaCode, color: "from-purple-500 to-indigo-600", name: "Programming" },
      design: { icon: FaPalette, color: "from-pink-500 to-rose-600", name: "Design" },
      business: { icon: FaBriefcase, color: "from-green-500 to-emerald-600", name: "Business" },
      language: { icon: FaGlobe, color: "from-blue-500 to-cyan-600", name: "Language" },
    };
    return categoryMap[category] || { icon: FaBook, color: "from-gray-500 to-slate-600", name: category };
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(
          `${BackendAPI}/overview/created-courses`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.status === 200) {
          console.log("📊 Fetched courses data:", response.data);
          const coursesArray = Object.values(response.data);
          console.log("🖼️ Courses with thumbnails:", coursesArray.map(course => ({
            title: course.course_title,
            thumbnail: course.thumbnail_url || 'No thumbnail'
          })));
          setCourses(coursesArray);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    fetchCourses();
  }, []);

  // filter by search
  const filteredCourses = courses.filter(
    (course) =>
      course.course_title.toLowerCase().includes(search.toLowerCase()) ||
      course.course_description.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (courseId) => {
    if (!confirm("Delete this course? This cannot be undone.")) return;
    console.log("Attempting to delete course:", courseId);
    console.log("Delete URL:", `${import.meta.env.VITE_API_URL || "http://localhost:4000"}/instructor/courses/${courseId}`);
    try {
      // Make API call to delete course from database
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL || "http://localhost:4000"}/instructor/courses/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        // Remove course from local state only after successful deletion
        setCourses((prev) => prev.filter((c) => c.course_id !== courseId));
        toast.success("Course deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      
      let errorMessage = "Failed to delete course";
      try {
        if (error.response?.data?.error) {
          errorMessage += `: ${error.response.data.error}`;
        } else if (error.message) {
          errorMessage += `: ${error.message}`;
        }
      } catch (e) {
        console.error("Error processing error message:", e);
      }
      
      toast.error(errorMessage);
    }
  };

  const startEdit = (course) => {
    setEditingId(course.course_id);
    setForm({
      course_title: course.course_title ?? "",
      course_description: course.course_description ?? "",
      category: course.category ?? "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ course_title: "", course_description: "", category: "" });
  };

  const saveEdit = async (courseId) => {
    try {
      const { course_title, course_description, category } = form;
      if (
        !course_title.trim() ||
        !course_description.trim() ||
        !category.trim()
      ) {
        toast.error("All fields are required");
        return;
      }

      const today = new Date().toISOString().slice(0, 10);

      const updatedCourse = await axios.put(
        `${BackendAPI}/overview/edit-course-details/${courseId}`,
        {
          course_title,
          course_description,
          category,
        }
      );

      if (updatedCourse.status === 200) {
        toast.success("Course updated successfully");
      }
      setCourses((prev) =>
        prev.map((c) =>
          c.course_id === editingId ? { ...c, ...updatedCourse } : c
        )
      );

      cancelEdit();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while updating");
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-100 p-3 sm:p-6 lg:p-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-[#0173d1] to-[#85c1f3] hover:from-[#85c1f3] hover:to-[#0173d1] bg-clip-text text-transparent mb-2 text-center lg:text-left">
              Courses
            </h1>
            <p className="text-gray-600 text-center lg:text-left text-sm sm:text-base">
              Manage and view all your created courses
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-96 lg:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-200 rounded-xl bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md"
            />
          </div>
        </div>
      </div>

      {/* Table / Card Layout */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm sm:text-base">
            <thead>
              <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Course Name
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Description
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Category
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Created Date
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Updated Date
                </th>
                <th className="py-4 px-6 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredCourses.map((course) => (
                <tr
                  key={course.course_id}
                  className="hover:bg-blue-50/50 transition-all duration-200 group"
                >
                  <td className="py-5 px-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden shadow-lg ring-2 ring-white hover:ring-blue-300 transition-all duration-300 group-hover:scale-105">
                        {course.thumbnail_url ? (
                          <img 
                            src={course.thumbnail_url} 
                            alt={course.course_title}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              // Fallback if image fails to load
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className={`w-full h-full bg-gradient-to-br ${getCategoryDisplay(course.category).color} flex flex-col items-center justify-center text-white shadow-inner ${course.thumbnail_url ? 'hidden' : 'flex'}`}
                          style={{ display: course.thumbnail_url ? 'none' : 'flex' }}
                        >
                          <div className="text-2xl mb-1">
                            {React.createElement(getCategoryDisplay(course.category).icon)}
                          </div>
                          <div className="text-xs font-bold text-center opacity-90">
                            {course.course_title.charAt(0).toUpperCase()}
                          </div>
                        </div>

                      </div>
                      <div className="ml-6">
                        <div className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 mb-1">
                          {course.course_title}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getCategoryDisplay(course.category).color} text-white shadow-sm`}>
                            {React.createElement(getCategoryDisplay(course.category).icon, { className: "w-3 h-3" })}
                            {getCategoryDisplay(course.category).name}
                          </span>
                          {course.level && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                              {course.level}
                            </span>
                          )}
                          {/* {course.thumbnail_url && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm">
                              🖼️ Thumbnail
                            </span>
                          )} */}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-5 px-6 text-sm text-gray-600 max-w-xs truncate">
                    {course.course_description}
                  </td>

                  <td className="py-5 px-6 text-sm text-gray-600">
                    {course.category}
                  </td>

                  <td className="py-5 px-6 text-sm text-gray-600">
                    {new Date(course.created_at).toISOString().slice(0, 10)}
                  </td>

                  <td className="py-5 px-6 text-sm text-gray-600">
                    {new Date(course.updated_at).toISOString().slice(0, 10)}
                  </td>

                  <td className="py-5 px-6 text-center">
                    <div className="flex justify-center space-x-3">
                      <button
                        onClick={() => startEdit(course)}
                        className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:shadow-lg hover:from-blue-600 hover:to-blue-700 focus:ring-4 focus:ring-blue-500/30 transition-all"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>

                      <button
                        onClick={() => handleDelete(course.course_id)}
                        className="p-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-md hover:shadow-lg hover:from-red-600 hover:to-red-700 focus:ring-4 focus:ring-red-500/30 transition-all"
                        title="Delete"
                      >
                        <AiFillDelete />
                      </button>

                      <button
                        onClick={() => navigate(`/courses/${course.course_id}/curriculum`)}
                        className="inline-flex items-center px-2 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-4 focus:ring-red-500/30 transition-all duration-200"
                        title="View Course"
                      >
                        <MdDoubleArrow />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card Layout */}
        <div className="md:hidden p-4 space-y-4">
          {filteredCourses.map((course) => (
            <div
              key={course.course_id}
              className="bg-white rounded-xl p-4 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-[#0173d1] to-[#85c1f3] rounded-lg flex items-center justify-center text-white font-bold">
                  {course.course_title.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    {course.course_title}
                  </h3>
                  <p className="text-sm text-gray-500">{course.category}</p>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-2">
                {course.course_description}
              </p>

              <div className="flex justify-between text-xs text-gray-500 mb-3">
                <span>
                  Created:{" "}
                  {new Date(course.created_at).toISOString().slice(0, 10)}
                </span>
                <span>
                  Updated:{" "}
                  {new Date(course.updated_at).toISOString().slice(0, 10)}
                </span>
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => startEdit(course)}
                  className="px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium rounded-lg shadow hover:from-blue-600 hover:to-blue-700"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(course.course_id)}
                  className="px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-medium rounded-lg shadow hover:from-red-600 hover:to-red-700"
                >
                  <AiFillDelete />
                </button>
                <button
                  onClick={() =>
                    navigate(`/courses/${course.course_id}/curriculum`)
                  }
                  className="px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-medium rounded-lg shadow hover:from-green-600 hover:to-green-700"
                >
                  <MdDoubleArrow />
                </button>
              </div>
            </div>
          ))}

          {filteredCourses.length === 0 && (
            <div className="text-center py-10">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No courses found
              </h3>
              <p className="text-gray-500 text-sm">
                Try adjusting your search criteria
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Stats */}
      {filteredCourses.length > 0 && (
        <div className="mt-6 text-center">
          <p className="text-xs sm:text-sm text-gray-600 bg-white/50 backdrop-blur-sm rounded-lg py-2 px-4 inline-block border border-white/20">
            Showing{" "}
            <span className="font-semibold text-blue-600">
              {filteredCourses.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-blue-600">
              {courses.length}
            </span>{" "}
            courses
          </p>
        </div>
      )}

      {/* Edit Modal */}
      {editingId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md sm:max-w-lg bg-white rounded-2xl shadow-xl p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 text-center sm:text-left">
              Edit Course
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-700">Course Name</label>
                <input
                  className="mt-1 w-full border rounded-lg p-2 text-sm sm:text-base"
                  value={form.course_title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, course_title: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">Description</label>
                <textarea
                  rows={3}
                  className="mt-1 w-full border rounded-lg p-2 text-sm sm:text-base"
                  value={form.course_description}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      course_description: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">Category</label>
                <input
                  className="mt-1 w-full border rounded-lg p-2 text-sm sm:text-base"
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value }))
                  }
                  placeholder="e.g., Development, Design, Marketing"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={cancelEdit}
                className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50 text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={() => saveEdit(editingId)}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm sm:text-base"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewCreatedCourse;
