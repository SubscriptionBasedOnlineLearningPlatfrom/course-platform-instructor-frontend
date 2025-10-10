import React, { useState, useEffect } from "react";
import { FaCirclePlus, FaTrash, FaDownload } from "react-icons/fa6";
import { FaSave, FaPlus } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useContext } from "react";
import { useApi } from "../../contexts/APIContext";
import { toast } from "react-toastify";

const QuizCreation = () => {
  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [quiz, setQuiz] = useState([]);
  const [quizId, setQuizId] = useState([]);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(null);
  const [quizTitle, setQuizTitle] = useState("");
  const { lessonId } = useParams();
  const { BackendAPI } = useApi();
  const navigate = useNavigate();

  // Load quiz data from localStorage on component mount
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await axios.get(`${BackendAPI}/quizzes/${lessonId}`);
        if (response.status === 200) {
          setQuizId(response.data.quiz[0].quiz_id);
          setQuiz(
            response.data.full.map((q) => ({
              question_text: q.question,
              answers: (q.answers || []).map((a, index) => ({
                answer_id:a.answer_id,
                answer_text: a.answer_text,
                is_correct: index === q.correctAnswer,
              })),
              correctIndex: q.correctAnswer >= 0 ? q.correctAnswer : null,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching quiz data:", error);
      }
    };
    fetchQuizzes();
  }, [lessonId]);

  // Save quiz data to localStorage whenever quiz changes
  useEffect(() => {
    if (quiz.length > 0) {
      localStorage.setItem("quizCreatorData", JSON.stringify(quiz));
    } else {
      localStorage.removeItem("quizCreatorData");
    }
  }, [quiz]);

  // Add answer to current answers list
  const addAnswer = (e) => {
    e.preventDefault();
    if (currentAnswer.trim() === "") return;
    setAnswers((prev) => [...prev, currentAnswer]);
    setCurrentAnswer("");
  };

  // Remove answer from current answers list
  const removeAnswer = (index) => {
    const newAnswers = answers.filter((_, i) => i !== index);
    setAnswers(newAnswers);
    if (correctAnswerIndex === index) {
      setCorrectAnswerIndex(null);
    } else if (correctAnswerIndex > index) {
      setCorrectAnswerIndex(correctAnswerIndex - 1);
    }
  };

  // Add the current editor state into the quiz list
  const addQuestionToList = () => {
    if (!question.trim() || answers.length < 2 || correctAnswerIndex == null) {
      toast.error(
        "Question must have text, at least 2 answers, and one correct answer"
      );
      return;
    }
    const newQuestion = {
      question_text: question.trim(),
      answers: answers.map((ans, i) => ({
        answer_text: ans,
        is_correct: i === correctAnswerIndex,
      })),
    };

    setQuiz((prev) => [...prev, newQuestion]);

    // reset editor
    setQuestion("");
    setAnswers([]);
    setCurrentAnswer("");
    setCorrectAnswerIndex(null);
    toast.success("Question added to list!");
  };

  // Save all questions
  const saveAllQuestions = async () => {
    if (quiz.length === 0) {
      toast.error("No questions to save");
      return;
    }

    if (!quizTitle.trim()) {
      toast.error("Quiz title is required");
      return;
    }

    try {
      const response = await axios.post(
        `${BackendAPI}/quizzes/create/${lessonId}`,
        {
          lesson_id: lessonId,
          quiz_title: quizTitle,
          questions: quiz.map((q) => ({
            question_text: q.question_text,
            answers: q.answers.map((ans) => ({
              answer_text: ans.answer_text,
              is_correct: !!ans.is_correct,
            })),
          })),
        }
      );

      if (response.status === 201) {
        setQuestion("");
        setAnswers([]);
        setCorrectAnswerIndex(null);
        setQuiz([]);
        setQuizTitle("");
        toast.success("Quiz created successfully!");
      }
    } catch (error) {
      toast.error(error.message);
      console.error("Error saving question:", error);
    }
  };

  // Remove question from quiz
  const removeQuestion = (index) => {
    if (!window.confirm("Remove this question?")) return;
    const newQuiz = quiz.filter((_, i) => i !== index);
    setQuiz(newQuiz);
  };

  // Clear all quiz data
  const clearAllQuestions = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all questions? This action cannot be undone."
      )
    ) {
      setQuiz([]);
      localStorage.removeItem("quizCreatorData");
    }
  };

  // Export quiz as JSON
  const exportQuiz = () => {
    const dataStr = JSON.stringify(
      { quiz_title: quizTitle, questions: quiz },
      null,
      2
    );
    const uri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const a = document.createElement("a");
    a.href = uri;
    a.download = `${(quizTitle || "quiz").replace(/\s+/g, "_")}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast.success("Quiz exported!");
  };

  // Import quiz from JSON file
  const importQuiz = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedQuiz = JSON.parse(e.target.result);
          if (Array.isArray(importedQuiz)) {
            setQuiz(importedQuiz);
            toast.success("Quiz imported successfully!");
          } else {
            toast.error("Invalid quiz format");
          }
        } catch (error) {
          toast.error("Error importing quiz: Invalid JSON format");
        }
      };
      reader.readAsText(file);
    } else {
      toast.error("Please select a valid JSON file");
    }
    event.target.value = "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header with Quiz Title */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-600">
              Quiz Title
            </label>
            <input
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              className="mt-2 w-full sm:w-[480px] p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400"
              placeholder="Enter quiz title..."
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={saveAllQuestions}
              disabled={quiz.length === 0}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg shadow hover:scale-[1.01] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaSave /> Save Quiz
            </button>

            <button
              onClick={exportQuiz}
              disabled={quiz.length === 0}
              className="inline-flex items-center gap-2 bg-white border px-4 py-2 rounded-lg shadow hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaDownload /> Export
            </button>
          </div>
        </div>

        <div className="bg-white border border-indigo-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="text-gray-700 text-sm">
              You can create one quiz. If you already created one,{" "}
              <span className="font-semibold text-indigo-600">
                edit it instead
              </span>
              .
            </span>

            <button onClick={() => navigate(`/edit-quiz/${lessonId}/${quizId}`)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 whitespace-nowrap">
              Edit Quiz
            </button>
          </div>
        </div>

        {/* Question Editor */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-4 border border-gray-100">
          <div className="text-sm font-semibold text-gray-600 mb-3">
            Create New Question
          </div>

          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter your question here..."
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 mb-3"
          />

          {/* Answers */}
          <div className="space-y-2 mb-3">
            {answers.map((ans, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={correctAnswerIndex === idx}
                    onChange={() => setCorrectAnswerIndex(idx)}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                </label>

                <input
                  value={ans}
                  readOnly
                  className="flex-1 p-2 border rounded-md bg-gray-50"
                />

                <button
                  onClick={() => removeAnswer(idx)}
                  className="text-red-500 p-2 hover:text-red-700"
                  title="Remove answer"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>

          {/* Add Answer Input */}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addAnswer(e)}
              placeholder="New answer..."
              className="flex-1 p-2 border rounded-md"
            />
            <button
              onClick={addAnswer}
              className="px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-md"
            >
              <FaPlus />
            </button>
          </div>

          <button
            onClick={addQuestionToList}
            disabled={
              !question.trim() ||
              answers.length < 2 ||
              correctAnswerIndex == null
            }
            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-lg hover:scale-[1.01] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Question to List
          </button>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {quiz.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-8 text-center text-gray-600">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <p className="text-gray-600">No questions added yet</p>
              <p className="text-sm text-gray-500 mt-2">
                Start creating your first question!
              </p>
              <div className="mt-4">
                <label className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg shadow hover:scale-[1.01] transition cursor-pointer">
                  Import a Quiz
                  <input
                    type="file"
                    accept=".json"
                    onChange={importQuiz}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-medium text-gray-600">
                  Questions ({quiz.length})
                </div>
              </div>

              {quiz.map((q, qi) => (
                <div
                  key={qi}
                  className="bg-white rounded-xl shadow p-4 border border-gray-100"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="text-sm font-semibold text-gray-600">
                          Q{qi + 1}
                        </div>
                        <div className="flex-1 font-medium text-gray-800">
                          {q.question_text}
                        </div>
                      </div>

                      <div className="space-y-2">
                        {q.answers.map((ans, ai) => (
                          <div
                            key={ai}
                            className={`p-2 rounded-md border ${
                              ans.is_correct
                                ? "bg-green-50 border-green-300"
                                : "bg-gray-50 border-gray-200"
                            }`}
                          >
                            <span className="text-sm text-gray-600 mr-2">
                              {String.fromCharCode(65 + ai)}.
                            </span>
                            {ans.answer_text}
                            {ans.is_correct && (
                              <span className="ml-2 text-green-600 text-sm font-medium">
                                ✓ Correct
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizCreation;
