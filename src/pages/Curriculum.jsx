import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Trash2 } from "lucide-react";
import ChapterCard from "../components/ChapterCard";
import { useApi } from "../contexts/APIContext";
import { useNavigate } from "react-router-dom";

const CurriculumPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const {
    getAllModules,
    addModule: apiAddModule,
    deleteModule: apiDeleteModule,
    addChapter: apiAddChapter,
    deleteChapter: apiDeleteChapter,
  } = useApi();

  const [modules, setModules] = useState([]);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [newChapterTitle, setNewChapterTitle] = useState({});
  const [openModule, setOpenModule] = useState(null);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const data = await getAllModules(courseId);
        setModules(data.modules); 
      } catch (err) {
        console.error(err);
      }
    };
    if (courseId) fetchModules();
  }, [courseId, getAllModules]);

  
  const handleAddModule = async () => {
    if (!newModuleTitle.trim()) return;

    try {
      const data = await apiAddModule(courseId, newModuleTitle);
      setModules([...modules, data.module]); 
      setNewModuleTitle("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm("Are you sure you want to delete this module?")) return;

    try {
      await apiDeleteModule(moduleId);
      setModules(modules.filter((mod) => mod.module_id !== moduleId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddChapter = async (moduleId) => {
    const title = newChapterTitle[moduleId];
    if (!title?.trim()) return;

    try {
      const data = await apiAddChapter(moduleId, title);
      setModules((prev) =>
        prev.map((mod) =>
          mod.module_id === moduleId
            ? { ...mod, chapters: [...(mod.chapters || []), data.chapter] }
            : mod
        )
      );
      setNewChapterTitle((prev) => ({ ...prev, [moduleId]: "" }));
    } catch (err) {
      console.error("Failed to add chapter:", err);
    }
  };

  const handleDeleteChapter = async (moduleId, lessonId) => {
    if (!window.confirm("Are you sure you want to delete this chapter?")) return;

    try {
      await apiDeleteChapter(lessonId);
      setModules((prev) =>
        prev.map((mod) =>
          mod.module_id === moduleId
            ? { ...mod, chapters: mod.chapters.filter((ch) => ch.lesson_id !== lessonId) }
            : mod
        )
      );
    } catch (err) {
      console.error("Failed to delete chapter:", err);
    }
  };

  const handleUpdateChapter = (updatedChapter) => {
    setModules((prevModules) =>
      prevModules.map((mod) => ({
        ...mod,
        chapters: mod.chapters?.map((ch) =>
          ch.lesson_id === updatedChapter.lesson_id ? updatedChapter : ch
        ),
      }))
    );
  };


  return (
    <div className="mt-10 p-4 sm:p-6 max-w-7xl mx-auto space-y-6 bg-blue-50 rounded-xl shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-4 sm:mb-0">
          Course Curriculum
        </h1>
        <button
          onClick={() => navigate(`/courses/${courseId}/submissions`)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm sm:text-base"
        >
          View Student Submissions
        </button>
      </div>

      {modules.length === 0 ? (
        <p className="text-gray-500 italic text-center sm:text-left">
          No modules yet. Add a module below.
        </p>
      ) : (
        modules.map((mod) => (
          <div
            key={mod.module_id}
            className="border border-blue-200 rounded-xl bg-white shadow-sm"
          >
            {/* Module Header */}
            <div className="flex justify-between items-center">
              <button
                onClick={() =>
                  setOpenModule(openModule === mod.module_id ? null : mod.module_id)
                }
                className="w-full flex justify-between items-center p-3 sm:p-4 text-left font-semibold text-base sm:text-lg text-blue-800 hover:bg-blue-100 rounded-t-xl cursor-pointer"
              >
                {mod.module_title || mod.title}
                <span className="text-sm">
                  {openModule === mod.module_id ? "▲" : "▼"}
                </span>
              </button>
              <button
                onClick={() => handleDeleteModule(mod.module_id)}
                className="p-2 text-red-500 hover:text-red-700 cursor-pointer"
                title="Delete Module"
              >
                <Trash2 size={18} />
              </button>
            </div>

            {/* Module Body */}
            {openModule === mod.module_id && (
              <div className="p-3 sm:p-4 space-y-3 border-t border-blue-100">
                {(!mod.chapters || mod.chapters.length === 0) && (
                  <p className="text-gray-500">
                    No chapters yet. Add chapters below.
                  </p>
                )}

                {mod.chapters?.map((ch) => (
                  <div
                    key={ch.lesson_id}
                    className="flex items-center gap-2 border border-blue-100 rounded-lg p-2 bg-gray-50"
                  >
                    <ChapterCard chapter={ch} onUpdateChapter={handleUpdateChapter} />
                    <button
                      onClick={() => handleDeleteChapter(mod.module_id, ch.lesson_id)}
                      className="p-2 text-red-500 hover:text-red-700 cursor-pointer"
                      title="Delete Chapter"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}

                {/* Add Chapter */}
                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center mt-2">
                  <input
                    type="text"
                    placeholder="New chapter name"
                    value={newChapterTitle[mod.module_id] || ""}
                    onChange={(e) =>
                      setNewChapterTitle((prev) => ({
                        ...prev,
                        [mod.module_id]: e.target.value,
                      }))
                    }
                    className="border border-blue-300 p-2 rounded flex-grow focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
                  />
                  <button
                    onClick={() => handleAddChapter(mod.module_id)}
                    className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm sm:text-base cursor-pointer"
                  >
                    Add Chapter
                  </button>
                </div>
              </div>
            )}
          </div>
        ))
      )}

      {/* Add Module */}
      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center mt-4">
        <input
          type="text"
          placeholder="New module name"
          value={newModuleTitle}
          onChange={(e) => setNewModuleTitle(e.target.value)}
          className="border border-blue-300 p-2 rounded flex-grow focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
        />
        <button
          onClick={handleAddModule}
          className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm sm:text-base cursor-pointer"
        >
          Add Module
        </button>
      </div>
    </div>
  );
};

export default CurriculumPage;
