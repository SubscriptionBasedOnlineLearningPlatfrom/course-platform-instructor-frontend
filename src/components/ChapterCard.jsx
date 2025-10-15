import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../contexts/APIContext";

export default function ChapterCard({ chapter, onUpdateChapter }) {
  const { addVideo, addNote, addAssignment, deleteFile } = useApi();
  const navigate = useNavigate();

  const [loadingType, setLoadingType] = useState(null); // set uploading while the resource is uploading

  const getOriginalName = (url) => {
    if (!url) return "";
    const fileName = url.split("/").pop();
    const parts = fileName.split("-");
    if (!isNaN(parts[0])) parts.shift();
    return parts.join("-");
  };

  //size limits
  const SIZE_LIMITS = {
    Video: 50, // max 50 MB
    Note: 10, // max 10 MB
    Assignment: 20, // max 20 MB
  };

  const [resources, setResources] = useState(
    [
      chapter.video_url
        ? { id: "video", type: "Video", name: chapter.video_name || getOriginalName(chapter.video_url) }
        : null,
      chapter.note_url
        ? { id: "note", type: "Note", name: chapter.note_name || getOriginalName(chapter.note_url) }
        : null,
      chapter.assignment_url
        ? { id: "assignment", type: "Assignment", name: chapter.assignment_name || getOriginalName(chapter.assignment_url) }
        : null,
    ].filter(Boolean)
  );

  const handleAddResource = (type) => {
    const input = document.createElement("input");
    input.type = "file";

    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      //check file size before uploading
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > SIZE_LIMITS[type]) {
        alert(`❌ ${type} file too large. Max size is ${SIZE_LIMITS[type]} MB.`);
        return;
      }

      setLoadingType(type); 

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

        const newResource = { id: Date.now(), type, name: uploadedName };
        setResources((prev) => [...prev, newResource]);

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
      } catch (err) {
        alert(err.message);
      } finally {
        setLoadingType(null); // stop loading
      }
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
      await deleteFile(chapter.lesson_id, res.type);
    } catch (err) {
      alert("Failed to delete file: " + err.message);
      setResources((prev) => [...prev, res]);
      return;
    }

    if (onUpdateChapter) onUpdateChapter(updatedChapter);
  };

  return (
    <div className="border border-blue-200 p-3 rounded-lg bg-gray-50 space-y-2">
      <h3 className="font-medium">{chapter.lesson_title}</h3>

      <div className="flex flex-wrap gap-2">
        {["Video", "Note", "Assignment"].map((type) => (
          <button
            key={type}
            onClick={() => handleAddResource(type)}
            disabled={
              resources.some((r) => r.type === type) || loadingType === type
            }
            className={`px-3 py-1 rounded transition cursor-pointer ${
              resources.some((r) => r.type === type)
                ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                : loadingType === type
                ? "bg-blue-400 text-white cursor-wait"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {loadingType === type ? `Adding ${type}...` : `Add ${type}`}
          </button>
        ))}

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
