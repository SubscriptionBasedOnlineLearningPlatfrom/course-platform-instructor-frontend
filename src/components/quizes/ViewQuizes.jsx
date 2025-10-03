import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { FaDownload, FaTrash, FaSyncAlt } from "react-icons/fa";
import { useApi } from "../../contexts/APIContext";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import { getDocument } from "pdfjs-dist";

function simpleNormalize(payload) {
  if (!payload) return null;
  if (
    Array.isArray(payload) &&
    payload.length > 0 &&
    payload[0].question &&
    payload[0].answers
  ) {
    return {
      quiz_title: "Imported Quiz",
      quiz_id: null,
      questions: payload.map((q) => ({
        question_text: q.question,
        answers: (q.answers || []).map((a, idx) => ({
          answer_text: a,
          is_correct:
            typeof q.correctAnswer === "number" && q.correctAnswer === idx,
        })),
      })),
    };
  }
  if (payload.questions && Array.isArray(payload.questions)) {
    return {
      quiz_title: payload.quiz_title || "Quiz",
      quiz_id: payload.quiz_id || null,
      questions: payload.questions.map((q) => ({
        question_text: q.question_text ?? q.question ?? q.text,
        answers: (q.answers || []).map((a, index) => ({
          answer_text: a,
          is_correct: index === q.correctAnswer,
        })),
        correctIndex: q.correctAnswer >= 0 ? q.correctAnswer : null,
      })),
    };
  }
  return null;
}

const QuizViewer = () => {
  const { lessonId } = useParams();
  const { BackendAPI } = useApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quiz, setQuiz] = useState(null);

  useEffect(() => {
    if (!lessonId) return;
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(
          `${BackendAPI}/quizzes/f1dcb0c9-17de-4fe8-8ccf-c5e973faa444`
        );
        if (cancelled) return;
        const normalized = simpleNormalize(res.data);
        setQuiz(normalized || null);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load quizzes");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [lessonId, BackendAPI]);

  const refresh = async () => {
    if (!lessonId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(
        `${BackendAPI}/quizzes/f1dcb0c9-17de-4fe8-8ccf-c5e973faa444`
      );
      const normalized = simpleNormalize(res.data);
      setQuiz(normalized || null);
      toast.success("Refreshed");
    } catch (err) {
      console.error(err);
      setError(err.message || "Refresh failed");
      toast.error("Refresh failed");
    } finally {
      setLoading(false);
    }
  };

  const downloadQuiz = (quizData, filename = "quiz.pdf") => {
    if (!quizData) return;

    const doc = new jsPDF();
    let y = 10; // vertical start

    doc.setFontSize(16);
    doc.text(quizData.quiz_title || "Quiz", 10, y);
    y += 10;

    quizData.questions.forEach((q, i) => {
      doc.setFontSize(12);
      doc.text(`${i + 1}. ${q.question_text}`, 10, y);
      y += 8;

      q.answers.forEach((a, ai) => {
        const suffix = a.is_correct ? "- (correct) " : "";
        doc.text(`${a.answer_text} ${suffix}`, 15, y);
        y += 7;
      });

      y += 5;

      if (y > 280) {
        doc.addPage();
        y = 10;
      }
    });

    doc.save(filename);
    toast.success("Downloaded successfully");
  };

  const deleteQuiz = () => {
    if (!quiz) return;
    if (!window.confirm("Remove quiz from view?")) return;
    setQuiz(null);
    toast.success("Removed from view");
  };

  if (!lessonId)
    return (
      <div className="p-6 bg-yellow-50 rounded-md text-yellow-800 text-center">
        Please provide a <code>lessonId</code>.
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gradient bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
            Quizzes for Lesson
          </h2>
          <p className="text-gray-500 font-mono mt-1">{lessonId}</p>
        </div>
      </div>

      {/* Loading & Error */}
      {loading && (
        <div className="p-6 bg-white rounded shadow text-center text-gray-600 animate-pulse">
          Loading...
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded">{error}</div>
      )}
      {!loading && !quiz && (
        <div className="p-4 bg-gray-50 rounded text-center">
          No quiz loaded.
        </div>
      )}

      {/* Quiz Card */}
      {!loading && quiz && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition duration-300 border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-semibold">{quiz.quiz_title}</h3>
                {quiz.quiz_id && (
                  <p className="text-xs text-gray-400 font-mono mt-1">
                    {quiz.quiz_id}
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => downloadQuiz(quiz)}
                  className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow transition duration-200"
                >
                  <FaDownload />
                </button>
                <button
                  onClick={deleteQuiz}
                  className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow transition duration-200"
                >
                  <FaTrash />
                </button>
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-4">
              {quiz.questions.map((q, i) => (
                <div
                  key={i}
                  className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border-l-4 border-indigo-500 shadow-sm hover:shadow-md transition duration-200"
                >
                  <div className="font-semibold text-gray-800">
                    {i + 1}. {q.question_text}
                  </div>
                  <ul className="mt-2 ml-6 list-decimal space-y-1">
                    {q.answers.map((a, ai) => (
                      <li
                        key={ai}
                        className="flex justify-between items-center px-2 py-1 rounded hover:bg-indigo-50 transition duration-150"
                      >
                        <span>{a.answer_text}</span>
                        {a.is_correct && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-600 text-white">
                            Correct
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizViewer;
