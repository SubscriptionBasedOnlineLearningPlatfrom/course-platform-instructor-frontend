import React, { useState, useEffect } from "react";
import { FaCirclePlus, FaTrash, FaDownload } from "react-icons/fa6";
import { FaSave } from "react-icons/fa";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useContext } from "react";
import { useApi } from "../../contexts/APIContext";

const QuizCreation = () => {
  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [quiz, setQuiz] = useState([]);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(null);
  const lessonId = "d493f590-6258-4959-9d2f-21f512957164"; //useParams();
  const { BackendAPI } = useApi();

  // Load quiz data from localStorage on component mount
  useEffect(() => {
    try {
      const response = axios.get(
        `${BackendAPI}/quizzes/f1dcb0c9-17de-4fe8-8ccf-c5e973faa444`
      ); //${lessonId}
      if (response.status === 200) {
        setQuiz(
          response.data.questions.map((q) => ({
            question_text: q.question_text,
            answers: q.answers.map((a) => a.answer_text),
            correctAnswer: q.answers.findIndex((a) => a.is_correct),
          }))
        );
      }
      console.log(response.data.questions);
    } catch (error) {
      console.log(error);
      console.error("Error fetching quiz data:", error);
    }
  }, [lessonId]);

  // Save quiz data to localStorage whenever quiz changes
  useEffect(() => {
    if (quiz.length > 0) {
      localStorage.setItem("quizCreatorData", JSON.stringify(quiz));
    } else {
      // If quiz is empty, remove from localStorage
      localStorage.removeItem("quizCreatorData");
    }
  }, [quiz]);

  // Add answer to current answers list
  const addAnswer = (e) => {
    e.preventDefault();
    if (currentAnswer.trim() === "") return;
    setAnswers((prev) => [...prev, currentAnswer]);
    console.log(answers);
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

  // NEW: push the current editor state into the quiz list
  const addQuestionToList = () => {
    if (!question.trim() || answers.length < 2 || correctAnswerIndex == null)
      return;
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
  };

  // Save question with answers
  const saveAllQuestions = async () => {
    console.log(quiz[0].answers);
    if (quiz.length === 0) return;

    try {
      const response = await axios.post(`${BackendAPI}/quizzes/create`, {
        lesson_id: lessonId,
        quiz_title: "quiz Title",
        questions: quiz.map((q) => ({
          question_text: q.question_text,
          answers: q.answers.map((ans, i) => ({
            answer_text: ans.answer_text,
            is_correct: !!ans.is_correct,
          })),
        })),
      });

      console.log(response);
      console.log(lessonId);

      if (response.status === 201) {
        console.log("Question saved successfully:", response.data);
        setQuestion("");
        setAnswers([]);
        setCorrectAnswerIndex(null);
      }
    } catch (error) {
      console.log(error);
      console.error("Error saving question:", error);
    }
  };

  // Remove question from quiz
  const removeQuestion = (index) => {
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

  // Download quiz as JSON
  const downloadQuiz = () => {
    const dataStr = JSON.stringify(quiz, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = "quiz.json";

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
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
            alert("Quiz imported successfully!");
          } else {
            alert("Invalid quiz format");
          }
        } catch (error) {
          alert("Error importing quiz: Invalid JSON format");
        }
      };
      reader.readAsText(file);
    } else {
      alert("Please select a valid JSON file");
    }
    // Clear the input
    event.target.value = "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Quiz Creator
          </h1>
          <p className="text-gray-600">Create engaging quizzes with ease</p>
          {quiz.length > 0 && (
            <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg inline-block">
              <p className="text-green-800 text-sm">
                Your quiz is automatically saved and will persist after refresh
              </p>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Question Creation */}
          <div className="space-y-6">
            {/* Question Input Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-full">
                  <FaCirclePlus className="text-blue-600 text-lg" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Create Question
                </h2>
              </div>

              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Enter your question here..."
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                rows="3"
              />
            </div>

            {/* Answer Input Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-full">
                  <FaCirclePlus className="text-green-600 text-lg" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Add Answers
                </h2>
              </div>

              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addAnswer()}
                  placeholder="Enter an answer option"
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={addAnswer}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-md"
                >
                  Add
                </button>
              </div>

              {/* Current Answers */}
              {answers.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-700 mb-3">
                    Answer Options:
                  </h3>
                  {answers.map((ans, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-3 border rounded-lg transition-all duration-200 ${
                        correctAnswerIndex === idx
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={correctAnswerIndex === idx}
                          onChange={() => setCorrectAnswerIndex(idx)}
                          className="text-green-600 focus:ring-green-500"
                        />
                        <span className="text-gray-800">{ans}</span>
                      </div>
                      <button
                        onClick={() => removeAnswer(idx)}
                        className="text-red-500 hover:text-red-700 transition-colors duration-200"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                  <p className="text-sm text-gray-600 italic">
                    Select the correct answer by clicking the radio button
                  </p>
                </div>
              )}

              {/* Save Question Button */}
              <button
                onClick={addQuestionToList}
                disabled={
                  !question.trim() ||
                  answers.length < 2 ||
                  correctAnswerIndex == null
                }
                className="w-full mt-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-lg"
              >
                Add Question To List
              </button>

              <button
                onClick={saveAllQuestions}
                disabled={quiz.length === 0}
                className="w-full mt-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg"
              >
                Save All Questions
              </button>
            </div>
          </div>

          {/* Right Column - Quiz Display */}
          <div className="space-y-6">
            {/* Quiz Header with Actions */}
            {quiz.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Your Quiz ({quiz.length} questions)
                  </h2>
                  <div className="flex gap-2">
                    {/* Import Button */}
                    <label className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-md cursor-pointer">
                      Import
                      <input
                        type="file"
                        accept=".json"
                        onChange={importQuiz}
                        className="hidden"
                      />
                    </label>

                    {/* Clear All Button */}
                    <button
                      onClick={clearAllQuestions}
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-md"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Quiz Questions */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {quiz.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 text-center">
                  <div className="text-gray-400 text-6xl mb-4">📝</div>
                  <p className="text-gray-600">No questions added yet</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Start creating your first question!
                  </p>
                  <div className="mt-4">
                    <label className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-md cursor-pointer">
                      Or Import a Quiz
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
                quiz.map((q, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-200"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-lg text-gray-800">
                        Q{index + 1}: {q.question_text}
                      </h3>
                      <button
                        onClick={() => removeQuestion(index)}
                        className="text-red-500 hover:text-red-700 transition-colors duration-200"
                      >
                        <FaTrash />
                      </button>
                    </div>

                    <div className="space-y-2">
                      {q.answers.map((ans, idx) => (
                        <div
                          key={idx}
                          className={`p-2 rounded-lg ${
                            ans.is_correct === idx
                              ? "bg-green-100 border border-green-300 font-medium"
                              : "bg-gray-50 border border-gray-200"
                          }`}
                        >
                          <span className="text-sm text-gray-600 mr-2">
                            {String.fromCharCode(65 + idx)}.
                          </span>
                          {ans.answer_text}
                          {ans.is_correct === idx && (
                            <span className="ml-2 text-green-600 text-sm font-medium">
                              ✓ Correct
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizCreation;
