import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../contexts/APIContext";

export default function ChapterCard({ chapter, onUpdateChapter }) {
  const { addVideo, addNote, addAssignment, deleteFile } = useApi();

  const navigate = useNavigate();

  // Helper to remove numeric prefix from backend file names
  const getOriginalName = (url) => {
    if (!url) return "";
    const fileName = url.split("/").pop();
    const parts = fileName.split("-");
    if (!isNaN(parts[0])) parts.shift(); // remove numeric prefix
    return parts.join("-");
  };

  // Initialize resources from chapter URLs
  const [resources, setResources] = useState([
    chapter.video_url
      ? { id: "video", type: "Video", name: chapter.video_name || getOriginalName(chapter.video_url) }
      : null,
    chapter.note_url
      ? { id: "note", type: "Note", name: chapter.note_name || getOriginalName(chapter.note_url) }
      : null,
    chapter.assignment_url
      ? { id: "assignment", type: "Assignment", name: chapter.assignment_name || getOriginalName(chapter.assignment_url) }
      : null,
  ].filter(Boolean));

  const handleAddResource = (type) => {
    const input = document.createElement("input");
    input.type = "file";

    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      let uploadedUrl, uploadedName;
      try {
        if (type === "Video") {
          const res = await addVideo(chapter.lesson_id, file);
          uploadedUrl = res.lesson.video_url;
          uploadedName = getOriginalName(uploadedUrl);
        } else if (type === "Note") {
          const res = await addNote(chapter.lesson_id, file);
          uploadedUrl = res.lesson.note_url;
          uploadedName = getOriginalName(uploadedUrl);
        } else if (type === "Assignment") {
          const res = await addAssignment(chapter.lesson_id, file);
          uploadedUrl = res.lesson.assignment_url;
          uploadedName = getOriginalName(uploadedUrl);
        }
      } catch (err) {
        alert(err.message);
        return;
      }

      // Update resources state
      const newResource = { id: Date.now(), type, name: uploadedName };
      setResources((prev) => [...prev, newResource]);

      // Update chapter for button disabling
      const updatedChapter = { ...chapter };
      if (type === "Video") {
        updatedChapter.video_url = uploadedUrl;
        updatedChapter.video_name = uploadedName;
      } else if (type === "Note") {
        updatedChapter.note_url = uploadedUrl;
        updatedChapter.note_name = uploadedName;
      } else if (type === "Assignment") {
        updatedChapter.assignment_url = uploadedUrl;
        updatedChapter.assignment_name = uploadedName;
      }

      if (onUpdateChapter) onUpdateChapter(updatedChapter);
    };

    input.click();
  };

  const handleDeleteResource = async (res) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;

    setResources((prev) => prev.filter((r) => r.id !== res.id));

    const updatedChapter = { ...chapter };
    if (res.type === "Video") {
      updatedChapter.video_url = null;
      updatedChapter.video_name = null;
    } else if (res.type === "Note") {
      updatedChapter.note_url = null;
      updatedChapter.note_name = null;
    } else if (res.type === "Assignment") {
      updatedChapter.assignment_url = null;
      updatedChapter.assignment_name = null;
    }

  try {
    await deleteFile(chapter.lesson_id, res.type); //await the API call
  } catch (err) {
    alert("Failed to delete file: " + err.message);
    setResources((prev) => [...prev, res]);// revert state if deletion fails
    return;
  }

    if (onUpdateChapter) onUpdateChapter(updatedChapter);
  };

  return (
    <div className="border border-blue-200 p-3 rounded-lg bg-gray-50 space-y-2">
      <h3 className="font-medium">{chapter.lesson_title}</h3>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleAddResource("Video")}
          disabled={resources.some((r) => r.type === "Video")}
          className={`px-3 py-1 rounded transition cursor-pointer ${
            resources.some((r) => r.type === "Video")
              ? "bg-gray-300 text-gray-700 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Add Video
        </button>

        <button
          onClick={() => handleAddResource("Note")}
          disabled={resources.some((r) => r.type === "Note")}
          className={`px-3 py-1 rounded transition cursor-pointer ${
            resources.some((r) => r.type === "Note")
              ? "bg-gray-300 text-gray-700 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Add Note
        </button>

        <button
          onClick={() => handleAddResource("Assignment")}
          disabled={resources.some((r) => r.type === "Assignment")}
          className={`px-3 py-1 rounded transition cursor-pointer ${
            resources.some((r) => r.type === "Assignment")
              ? "bg-gray-300 text-gray-700 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Add Assignment
        </button>

        <button
          onClick={() => navigate(`/create-quiz/${chapter.lesson_id}`)}
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


/* import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../contexts/APIContext";

export default function ChapterCard({ chapter, onUpdateChapter }) {
  const { addVideo, addNote, addAssignment } = useApi();

  // Initialize resources from chapter URLs
  const [resources, setResources] = useState([
    chapter.video_url
      ? { id: "video", type: "Video", name: chapter.video_name || chapter.video_url.split("/").pop() }
      : null,
    chapter.note_url
      ? { id: "note", type: "Notes", name: chapter.note_name || chapter.note_url.split("/").pop() }
      : null,
    chapter.assignment_url
      ? { id: "assignment", type: "Assignment", name: chapter.assignment_name || chapter.assignment_url.split("/").pop() }
      : null,
  ].filter(Boolean));

  const navigate = useNavigate();

  const handleAddResource = (type) => {
    const input = document.createElement("input");
    input.type = "file";

    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      let uploadedUrl, uploadedName;
      try {
        if (type === "Video") {
          const res = await addVideo(chapter.lesson_id, file);
          uploadedUrl = res.lesson.video_url;
          uploadedName = res.lesson.video_name; // original filename from backend
        } else if (type === "Notes") {
          const res = await addNote(chapter.lesson_id, file);
          uploadedUrl = res.lesson.note_url;
          uploadedName = res.lesson.note_name;
        } else if (type === "Assignment") {
          const res = await addAssignment(chapter.lesson_id, file);
          uploadedUrl = res.lesson.assignment_url;
          uploadedName = res.lesson.assignment_name;
        }
      } catch (err) {
        alert(err.message);
        return;
      }

      // Update resources state
      const newResource = {
        id: Date.now(),
        type,
        name: uploadedName, // show original file name
      };
      setResources((prev) => [...prev, newResource]);

      // Update chapter so button disables
      const updatedChapter = { ...chapter };
      if (type === "Video") {
        updatedChapter.video_url = uploadedUrl;
        updatedChapter.video_name = uploadedName;
      } else if (type === "Notes") {
        updatedChapter.note_url = uploadedUrl;
        updatedChapter.note_name = uploadedName;
      } else if (type === "Assignment") {
        updatedChapter.assignment_url = uploadedUrl;
        updatedChapter.assignment_name = uploadedName;
      }

      if (onUpdateChapter) onUpdateChapter(updatedChapter);
    };

    input.click();
  };

  const handleDeleteResource = (res) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;

    setResources((prev) => prev.filter((r) => r.id !== res.id));

    // Remove URL from chapter
    const updatedChapter = { ...chapter };
    if (res.type === "Video") {
      updatedChapter.video_url = null;
      updatedChapter.video_name = null;
    } else if (res.type === "Notes") {
      updatedChapter.note_url = null;
      updatedChapter.note_name = null;
    } else if (res.type === "Assignment") {
      updatedChapter.assignment_url = null;
      updatedChapter.assignment_name = null;
    }

    if (onUpdateChapter) onUpdateChapter(updatedChapter);
  };

  return (
    <div className="border border-blue-200 p-3 rounded-lg bg-gray-50 space-y-2">
      <h3 className="font-medium">{chapter.lesson_title}</h3>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleAddResource("Video")}
          disabled={resources.some((r) => r.type === "Video")}
          className={`px-3 py-1 rounded transition cursor-pointer ${
            resources.some((r) => r.type === "Video")
              ? "bg-gray-300 text-gray-700 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Add Video
        </button>

        <button
          onClick={() => handleAddResource("Notes")}
          disabled={resources.some((r) => r.type === "Notes")}
          className={`px-3 py-1 rounded transition cursor-pointer ${
            resources.some((r) => r.type === "Notes")
              ? "bg-gray-300 text-gray-700 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Add Notes
        </button>

        <button
          onClick={() => handleAddResource("Assignment")}
          disabled={resources.some((r) => r.type === "Assignment")}
          className={`px-3 py-1 rounded transition cursor-pointer ${
            resources.some((r) => r.type === "Assignment")
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
 */