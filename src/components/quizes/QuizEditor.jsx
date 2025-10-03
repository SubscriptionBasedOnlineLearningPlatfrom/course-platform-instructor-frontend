import React, { useEffect, useState } from "react";
import { FaCirclePlus, FaTrash, FaDownload } from "react-icons/fa6";
import { FaSave, FaPlus } from "react-icons/fa";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useApi } from "../../contexts/APIContext";
import { toast } from "react-toastify";

/**
 * QuizEditor
 * - Expects BackendAPI in context
 * - Loads quiz from `${BackendAPI}/quizzes/:quizId` (adjust if your route differs)
 * - Edits in local state and posts to `${BackendAPI}/quiz/edit`
 *
 * Backend expected payload:
 * {
 *   quizId: "...",
 *   quiz_title: "...",
 *   questions: [
 *     { question_id?: "...", question_text: "...",
 *       answers: [{ answer_id?: "...", answer_text: "...", is_correct: true|false }, ...]
 *     }, ...
 *   ]
 * }
 */

const QuizEditor = () => {
  const { BackendAPI } = useApi();
  const { lessonId, quizId } = useParams();
  const [loading, setLoading] = useState(false);
  const [quizTitle, setQuizTitle] = useState("");
  const [questions, setQuestions] = useState([]); // array of {question_id?, question_text, answers: [{answer_id?, answer_text, is_correct}]}
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(null);
  const [newAnswerText, setNewAnswerText] = useState("");
  const [newQuestionText, setNewQuestionText] = useState("");

  useEffect(() => {
    if (!quizId) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${BackendAPI}/quizzes/${lessonId}`);
        const data = res.data;

        console.log(data);

        setQuizTitle(data.quiz[0].quiz_title ?? "");
        // normalize to our structure (strip backend variations)
        const normalized = (data || []).full.map((q) => ({
          question_id: q.question_id,
          question_text: q.question,
          answers: (q.answers || []).map((a, index) => ({
            answer_id: a.answer_id,
            answer_text: a.answer_text,
            is_correct: index === q.correctAnswer,
          })),
          correctIndex: q.correctAnswer >= 0 ? q.correctAnswer : null,
        }));

        setQuestions(normalized);
      } catch (err) {
        console.error("Load quiz error:", err);
        toast.error("Failed to load quiz");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [BackendAPI, quizId]);

  // Change handlers
  const updateQuestionText = (index, text) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], question_text: text };
      return next;
    });
  };

  const updateAnswerText = (qIndex, aIndex, text) => {
    setQuestions((prev) => {
      const next = [...prev];
      const q = { ...next[qIndex] };
      const answers = [...q.answers];
      answers[aIndex] = { ...answers[aIndex], answer_text: text };
      q.answers = answers;
      next[qIndex] = q;
      return next;
    });
  };

  const toggleCorrect = (qIndex, aIndex) => {
    setQuestions((prev) => {
      const next = [...prev];
      const q = { ...next[qIndex] };
      q.answers = q.answers.map((a, ai) => ({
        ...a,
        is_correct: ai === aIndex,
      }));
      next[qIndex] = q;
      return next;
    });
  };

  const addAnswerToQuestion = (qIndex, text) => {
    if (!text || text.trim() === "") {
      toast.error("Answer cannot be empty");
      return;
    }
    setQuestions((prev) => {
      const next = [...prev];
      const q = { ...next[qIndex] };
      q.answers = [
        ...q.answers,
        { answer_text: text.trim(), is_correct: false },
      ];
      next[qIndex] = q;
      return next;
    });
    setNewAnswerText("");
  };

  const removeAnswerFromQuestion = async (qIndex, aIndex, answerId) => {
    setQuestions((prev) => {
      const next = [...prev];
      const q = { ...next[qIndex] };
      q.answers = q.answers.filter((_, i) => i !== aIndex);
      if (!q.answers.some((a) => a.is_correct) && q.answers.length > 0) {
        q.answers[0].is_correct = true;
      }
      next[qIndex] = q;
      return next;
    });

    // 2️⃣ Show toast immediately
    toast.success("Deleted the answer successfully");

    // 3️⃣ Call backend
    try {
      if (answerId) {
        await axios.delete(`${BackendAPI}/quizzes/delete-answer/${answerId}`);
      } else {
        console.log("Answer not saved yet, no backend delete needed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete on server");
      // Optional: revert UI if needed
    }
  };

  const addNewQuestion = () => {
    if (!newQuestionText.trim()) {
      toast.error("Question text required");
      return;
    }
    // default new question with two blank answers
    const newQ = {
      question_text: newQuestionText.trim(),
      answers: [
        { answer_text: "Option 1", is_correct: false },
        { answer_text: "Option 2", is_correct: false },
      ],
    };
    setQuestions((prev) => [...prev, newQ]);
    setNewQuestionText("");
  };

  const removeQuestion = async (index, questionId) => {
    if (!window.confirm("Remove this question?")) return;

    // Optimistically update UI
    setQuestions((prev) => prev.filter((_, i) => i !== index));
    toast.success("Deleted the question successfully");
    console.log(questionId)
    try {
      if (questionId) {
        await axios.delete(
          `${BackendAPI}/quizzes/delete-question/${questionId}`
        );
      } else {
        console.log("Question not saved yet, no backend delete needed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete question on server");
    }
  };

  // Compose payload for backend and submit
  const saveQuizEdits = async () => {
    if (!quizId) {
      toast.error("No quiz selected");
      return;
    }
    if (!quizTitle.trim()) {
      toast.error("Quiz title is required");
      return;
    }
    if (!questions.length) {
      toast.error("At least one question required");
      return;
    }
    // basic validation: each question must have >=2 answers and one marked correct
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question_text || !q.question_text.trim()) {
        toast.error(`Question ${i + 1} text is required`);
        return;
      }
      if (!q.answers || q.answers.length < 2) {
        toast.error(`Question ${i + 1} must have at least 2 answers`);
        return;
      }
      if (!q.answers.some((a) => a.is_correct)) {
        toast.error(`Question ${i + 1} must have a correct answer`);
        return;
      }
    }

    const payload = {
      quizId,
      quiz_title: quizTitle,
      questions: questions.map((q) => ({
        ...(q.question_id ? { question_id: q.question_id } : {}),
        question_text: q.question_text,
        answers: q.answers.map((a) => ({
          ...(a.answer_id ? { answer_id: a.answer_id } : {}),
          answer_text: a.answer_text,
          is_correct: !!a.is_correct,
        })),
      })),
    };

    try {
      setLoading(true);
      const res = await axios.put(
        `${BackendAPI}/quizzes/edit/${quizId}`,
        payload
      );
      if (res.data?.message) toast.success(res.data.message);
      else toast.success("Saved successfully");
    } catch (err) {
      console.error("Save error:", err);
      toast.error(err.response?.data?.error || "Failed to save quiz");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log(questions);
  }, [questions]);

  // Simple UI helpers
  const addBlankAnswer = (qIndex) =>
    addAnswerToQuestion(
      qIndex,
      `Option ${questions[qIndex].answers.length + 1}`
    );
  const setQuestionAsSelected = (idx) =>
    setSelectedQuestionIndex(idx === selectedQuestionIndex ? null : idx);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
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
              onClick={saveQuizEdits}
              disabled={loading}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg shadow hover:scale-[1.01] transition"
            >
              <FaSave /> Save Changes
            </button>

            <button
              onClick={() => {
                // quick export JSON of current local edits
                const dataStr = JSON.stringify(
                  { quizId, quiz_title: quizTitle, questions },
                  null,
                  2
                );
                const uri =
                  "data:application/json;charset=utf-8," +
                  encodeURIComponent(dataStr);
                const a = document.createElement("a");
                a.href = uri;
                a.download = `${(quizTitle || "quiz").replace(
                  /\s+/g,
                  "_"
                )}_edit.json`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                toast.success("Exported current edits (JSON)");
              }}
              className="inline-flex items-center gap-2 bg-white border px-4 py-2 rounded-lg shadow"
            >
              <FaDownload /> Export
            </button>
          </div>
        </div>

        {/* Questions list */}
        <div className="space-y-4">
          {questions.length === 0 && (
            <div className="bg-white rounded-xl shadow p-8 text-center text-gray-600">
              No questions loaded. Use "Add Question" to create a new one or
              import a quiz.
            </div>
          )}

          {questions.map((q, qi) => (
            <div
              key={qi}
              className="bg-white rounded-xl shadow p-4 border border-gray-100"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <div className="text-sm font-semibold text-gray-600">
                      Q{qi + 1}
                    </div>
                    <input
                      value={q.question_text}
                      onChange={(e) => updateQuestionText(qi, e.target.value)}
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-300"
                    />
                  </div>

                  <div className="mt-3 space-y-2">
                    {q.answers.map((answerText, ai) => (
                      <div key={ai} className="flex items-center gap-3">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${qi}`}
                            checked={ai === q.correctIndex}
                            onChange={() => toggleCorrect(qi, ai)}
                          />
                        </label>

                        <input
                          value={answerText.answer_text}
                          onChange={(e) =>
                            updateAnswerText(qi, ai, e.target.value)
                          }
                          className="flex-1 p-2 border rounded-md"
                        />

                        <button
                          onClick={() =>
                            removeAnswerFromQuestion(
                              qi,
                              ai,
                              answerText.answer_id
                            )
                          }
                          className="text-red-500 p-2 hover:text-red-700"
                          title="Remove answer"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex gap-2">
                    <input
                      placeholder="New answer..."
                      value={selectedQuestionIndex === qi ? newAnswerText : ""}
                      onChange={(e) => {
                        setSelectedQuestionIndex(qi);
                        setNewAnswerText(e.target.value);
                      }}
                      className="flex-1 p-2 border rounded-md"
                    />
                    <button
                      onClick={() => {
                        if (selectedQuestionIndex !== qi) {
                          setSelectedQuestionIndex(qi);
                          setNewAnswerText("");
                          return;
                        }
                        addAnswerToQuestion(qi, newAnswerText);
                      }}
                      className="px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-md"
                    >
                      <FaPlus />
                    </button>

                    <button
                      onClick={() => addBlankAnswer(qi)}
                      className="px-3 py-2 bg-white border rounded-md"
                      title="Add default option"
                    >
                      + Option
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="text-xs text-gray-400 font-mono">
                    {q.question_id
                      ? `id: ${q.question_id.slice(0, 8)}...`
                      : "new"}
                  </div>
                  <button
                    onClick={() => removeQuestion(qi, q.question_id)}
                    className="text-red-500 px-3 py-1 rounded-md border hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Add new question area */}
          <div className="bg-white rounded-xl shadow p-4 border border-dashed border-gray-200 flex gap-4 items-center">
            <input
              value={newQuestionText}
              onChange={(e) => setNewQuestionText(e.target.value)}
              placeholder="Enter new question text..."
              className="flex-1 p-2 border rounded-md"
            />
            <button
              onClick={addNewQuestion}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-md"
            >
              Add Question
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizEditor;
