import React, { useState, useEffect } from "react";
import { useApi } from "../contexts/APIContext";
import { useParams } from "react-router-dom";

const StudentSubmission = () => {
  const { getAllSubmissions, updateGrade } = useApi();
  const { courseId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const submissionsPerPage = 4; // rows per page

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const data = await getAllSubmissions(courseId); 
        setSubmissions(data);
      } catch (err) {
        console.error("Failed to fetch submissions:", err.message);
      }
    };
    fetchSubmissions();
  }, [courseId, getAllSubmissions]);


  const handleGradeChange = (id, value) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, grade: value } : s))
    );
  };


  const handleSaveGrade = async (id) => {
    const submission = submissions.find((s) => s.id === id);
    try {
      await updateGrade(id, submission.grade);
      alert(`Grade saved for ${submission.studentName}`);
    } catch (err) {
      console.error("Failed to update grade:", err.message);
      alert("Failed to save grade");
    }
  };

  //pagination
  const indexOfLast = currentPage * submissionsPerPage;
  const indexOfFirst = indexOfLast - submissionsPerPage;
  const currentSubmissions = submissions.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(submissions.length / submissionsPerPage);

  const goPrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <div className="max-w-7xl mx-auto mt-10 p-8 bg-blue-50 rounded-2xl shadow-md">
      <h2 className="text-3xl font-bold text-blue-900 mb-6 text-center sm:text-left">
        Student Submissions
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-3">
          <thead>
            <tr className="bg-blue-100 text-blue-900 text-lg">
              <th className="p-3 text-left rounded-l-xl">Student</th>
              <th className="p-3 text-left">File</th>
              <th className="p-3 text-left">Grade (%)</th>
              <th className="p-3 text-left rounded-r-xl">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentSubmissions.map((s) => (
              <tr
                key={s.id}
                className="bg-white shadow-sm border border-blue-100 rounded-xl hover:bg-blue-50 transition"
              >
                <td className="p-4 text-gray-800 font-medium text-base sm:text-lg">
                  {s.studentName}
                </td>
                <td className="p-4">
                  <span className="text-blue-600 underline cursor-pointer text-base sm:text-lg">
                    {s.fileName}
                  </span>
                </td>
                <td className="p-4">
                  <input
                    type="text"
                    value={s.grade}
                    onChange={(e) => handleGradeChange(s.id, e.target.value)}
                    className="border border-blue-300 rounded-lg px-3 py-2 w-24 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </td>
                <td className="p-4">
                  <button
                    onClick={() => handleSaveGrade(s.id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-base sm:text-lg cursor-pointer"
                  >
                    Save
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/*pagination controls*/}
      <div className="flex justify-end gap-3 mt-4">
        <button
          onClick={goPrev}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Prev
        </button>
        <span className="px-2 py-2 text-gray-700 font-medium">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={goNext}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default StudentSubmission;
