import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ChapterCard({ chapter, onUpdateChapter }) {
  // Initialize resources from chapter URLs
  const [resources, setResources] = useState([
    chapter.video_url
      ? { id: "video", type: "Video", name: chapter.video_url }
      : null,
    chapter.note_url
      ? { id: "note", type: "Notes", name: chapter.note_url }
      : null,
    chapter.assignment_url
      ? { id: "assignment", type: "Assignment", name: chapter.assignment_url }
      : null,
  ].filter(Boolean));

  const navigate = useNavigate();

  const handleAddResource = (type) => {
    const input = document.createElement("input");
    input.type = "file";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const newResource = {
        id: Date.now(),
        type,
        name: file.name,
      };

      // Update resources list
      setResources((prev) => [...prev, newResource]);

      // Update chapter object so button disables
      const updatedChapter = { ...chapter };
      if (type === "Video") updatedChapter.video_url = file.name;
      else if (type === "Notes") updatedChapter.note_url = file.name;
      else if (type === "Assignment") updatedChapter.assignment_url = file.name;

      if (onUpdateChapter) onUpdateChapter(updatedChapter);
    };
    input.click();
  };

  const handleDeleteResource = (res) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;

    setResources((prev) => prev.filter((r) => r.id !== res.id));

    // Remove URL from chapter
    const updatedChapter = { ...chapter };
    if (res.type === "Video") updatedChapter.video_url = null;
    else if (res.type === "Notes") updatedChapter.note_url = null;
    else if (res.type === "Assignment") updatedChapter.assignment_url = null;

    if (onUpdateChapter) onUpdateChapter(updatedChapter);
  };

  return (
    <div className="border border-blue-200 p-3 rounded-lg bg-gray-50 space-y-2">
      <h3 className="font-medium">{chapter.lesson_title}</h3>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleAddResource("Video")}
          disabled={!!chapter.video_url}
          className={`px-3 py-1 rounded transition cursor-pointer ${
            chapter.video_url
              ? "bg-gray-300 text-gray-700 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Add Video
        </button>

        <button
          onClick={() => handleAddResource("Notes")}
          disabled={!!chapter.note_url}
          className={`px-3 py-1 rounded transition cursor-pointer ${
            chapter.note_url
              ? "bg-gray-300 text-gray-700 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Add Notes
        </button>

        <button
          onClick={() => handleAddResource("Assignment")}
          disabled={!!chapter.assignment_url}
          className={`px-3 py-1 rounded transition cursor-pointer ${
            chapter.assignment_url
              ? "bg-gray-300 text-gray-700 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Add Assignment
        </button>

        <button
          onClick={() => navigate("/QuizCreation")}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition cursor-pointer"
        >
          Add Quiz
        </button>
      </div>

      <div className="mt-2 space-y-1">
        {resources.map((res) => (
          <div
            key={res.id}
            className="flex items-center justify-between border-b pb-1"
          >
            <span>
              {res.type}: <span className="text-gray-700">{res.name}</span>
            </span>
            <button
              onClick={() => handleDeleteResource(res)}
              className="text-red-500 hover:text-red-700 cursor-pointer"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ChapterCard({ chapter }) {
  // Initialize state with existing files
  const [resources, setResources] = useState(chapter.files || []);
  const navigate = useNavigate();

  // Handle file upload
  const handleAddResource = (type) => {
    const input = document.createElement("input");
    input.type = "file";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const newResource = {
          id: Date.now(), // or backend id
          type,
          name: file.name,
        };
        setResources((prev) => [...prev, newResource]);
      }
    };
    input.click();
  };

  // Remove resource
  const handleDeleteResource = (id) => {
    if (window.confirm("Are you sure you want to delete this file?")) {
      setResources((prev) => prev.filter((res) => res.id !== id));
      //   call DELETE /api/resources/:id
    }
  };

  return (
    <div className="border border-blue-200 p-3 rounded-lg bg-gray-50 space-y-2">
      <h3 className="font-medium">{chapter.lesson_title}</h3>

   
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleAddResource("Video")}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition cursor-pointer"
        >
          Add Video
        </button>
        <button
          onClick={() => handleAddResource("Notes")}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition cursor-pointer"
        >
          Add Notes
        </button>
        <button
          onClick={() => handleAddResource("Assignment")}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition cursor-pointer"
        >
          Add Assignment
        </button>
        <button
          onClick={() => navigate('/QuizCreation')}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition cursor-pointer"
        >
          Add Quiz
        </button>
      </div>

    
      <div className="mt-2 space-y-1">
        {resources.map((res) => (
          <div
            key={res.id}
            className="flex items-center justify-between border-b pb-1"
          >
            <span>
              {res.type}: <span className="text-gray-700">{res.name}</span>
            </span>
            <button
              onClick={() => handleDeleteResource(res.id)}
              className="text-red-500 hover:text-red-700 cursor-pointer"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
 */