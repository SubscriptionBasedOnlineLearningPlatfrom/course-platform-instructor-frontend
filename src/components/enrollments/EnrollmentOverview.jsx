import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useApi } from "../../contexts/APIContext";

const EnrollmentOverview = () => {
  const { BackendAPI } = useApi();
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    try {
      const fetchEnrollments = async () => {
        const response = await axios.get(`${BackendAPI}/overview/enrollment`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200) {
          setStudents(Object.values(response.data));
        }
      };
      fetchEnrollments();
    } catch (error) {
      console.error("Error fetching enrollments:", error);
    }
  }, []);

  // Filter students by search (unchanged)
  const filteredStudents = students.filter((student) =>
    student.student_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-100 p-3 sm:p-6 lg:p-10">
      {/* Header Section (responsive) */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 sm:gap-6">
          {/* Title */}
          <div className="text-center lg:text-left">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#0173d1] to-[#85c1f3] hover:from-[#85c1f3] hover:to-[#0173d1] bg-clip-text text-transparent mb-2">
              Enrollments Overview
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Manage and view all student enrollment stats
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72 lg:w-80 mx-auto lg:mx-0">
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
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-200 rounded-xl bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md text-sm sm:text-base"
            />
          </div>
        </div>
      </div>

      {/* ===== Desktop Table ===== */}
      <div className="hidden md:block bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm md:text-base">
            <thead>
              <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                <th className="py-4 px-6 text-left font-semibold text-gray-700 uppercase tracking-wider">
                  Student Name
                </th>
                <th className="py-4 px-6 text-left font-semibold text-gray-700 uppercase tracking-wider">
                  Total Enrollments
                </th>
                <th className="py-4 px-6 text-left font-semibold text-gray-700 uppercase tracking-wider">
                  Completion Rate
                </th>
                <th className="py-4 px-6 text-left font-semibold text-gray-700 uppercase tracking-wider">
                  Certificates Issued
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredStudents.map((student) => {
                const rate = parseInt(student.completionRate, 10);
                const rateColor =
                  rate >= 80
                    ? "bg-green-100 text-green-800 border-green-200"
                    : rate >= 50
                    ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                    : "bg-red-100 text-red-800 border-red-200";

                return (
                  <tr
                    key={student.student_id}
                    className="hover:bg-blue-50/50 transition-all duration-200 group"
                  >
                    <td className="py-5 px-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-[#0173d1] to-[#85c1f3] group-hover:from-[#85c1f3] group-hover:to-[#0173d1] rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                          {student.student_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {student.student_name}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-5 px-6 text-center text-gray-700">
                      {student.total_enrollments}
                    </td>

                    <td className="py-5 px-6 text-center">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${rateColor}`}
                      >
                        {student.completion_rate}
                      </span>
                    </td>

                    <td className="py-5 px-6 text-center text-gray-700">
                      {student.certificates_issued}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No students found
              </h3>
              <p className="text-gray-500 text-sm">
                Try adjusting your search criteria
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ===== Mobile Card Layout ===== */}
      <div className="md:hidden space-y-4">
        {filteredStudents.map((student) => {
          const rate = parseInt(student.completionRate, 10);
          const rateColor =
            rate >= 80
              ? "bg-green-100 text-green-800 border-green-200"
              : rate >= 50
              ? "bg-yellow-100 text-yellow-800 border-yellow-200"
              : "bg-red-100 text-red-800 border-red-200";

          return (
            <div
              key={student.student_id}
              className="bg-white rounded-xl p-4 shadow-md border border-gray-100"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-[#0173d1] to-[#85c1f3] rounded-lg flex items-center justify-center text-white font-bold shadow">
                  {student.student_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    {student.student_name}
                  </h3>
                </div>
              </div>

              <p className="text-sm text-gray-700 mb-2">
                Total Enrollments:{" "}
                <span className="font-medium text-blue-600">
                  {student.total_enrollments}
                </span>
              </p>
              <p className="text-sm text-gray-700 mb-2">
                Completion Rate:{" "}
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${rateColor}`}
                >
                  {student.completion_rate}
                </span>
              </p>
              <p className="text-sm text-gray-700">
                Certificates Issued:{" "}
                <span className="font-medium text-indigo-600">
                  {student.certificates_issued}
                </span>
              </p>
            </div>
          );
        })}

        {filteredStudents.length === 0 && (
          <div className="text-center py-10">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No students found
            </h3>
            <p className="text-gray-500 text-sm">
              Try adjusting your search criteria
            </p>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {filteredStudents.length > 0 && (
        <div className="mt-6 text-center">
          <p className="text-xs sm:text-sm text-gray-600 bg-white/50 backdrop-blur-sm rounded-lg py-2 px-3 sm:px-4 inline-block border border-white/20">
            Showing{" "}
            <span className="font-semibold text-blue-600">
              {filteredStudents.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-blue-600">
              {students.length}
            </span>{" "}
            students
          </p>
        </div>
      )}
    </div>
  );
};

export default EnrollmentOverview;
