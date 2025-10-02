import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { set } from "zod";
import { useApi } from "../../contexts/APIContext";
import { toast } from "react-toastify";

const CommentsReplies = () => {
  const { BackendAPI } = useApi();
  const [comments, setComments] = useState([]);
  const [search, setSearch] = useState("");
  const [activeReply, setActiveReply] = useState(null); // which comment is showing the textarea
  const [replies, setReplies] = useState({}); // { [id]: ["reply1", "reply2"] }
  const [drafts, setDrafts] = useState({}); // { [id]: "current typing text" }
  const [editing, setEditing] = useState(null); // { id, idx } or null
  const [editDraft, setEditDraft] = useState("");
  const [visibleReplies, setVisibleReplies] = useState({}); // { [comment_id]: true/false }

  // Load replies from localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchReplies = async () => {
      try {
        const response = await axios.get(`${BackendAPI}/comments/comments`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(response);
        if (response.status === 200) {
          setComments(Object.values(response.data));
        }
      } catch (error) {
        console.error("Failed to fetch replies:", error);
      }
    };
    fetchReplies();
  }, [BackendAPI]);

  const handleReplySubmit = async (id) => {
    const text = (drafts[id] || "").trim();

    if (!text) {
      toast.error("Reply cannot be empty!");
      return;
    }

    const tempReply = {
      comment_id: id,
      reply_text: text,
      updated_at: new Date().toISOString(),
    };

    // for instant UI feedback
    setComments((prev) =>
      prev.map((c) =>
        c.comment_id === id
          ? { ...c, replies: [tempReply, ...(c.replies || [])] } // add at top
          : c
      )
    );

    try {
      const response = await axios.post(
        `${BackendAPI}/comments/${id}/replies`,
        { reply_text: text },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log(response);

      if (response.status === 200) {
        setReplies((prev) => ({
          ...prev,
          [id]: [...(prev[id] || []), response.data],
        }));
        setDrafts((prev) => ({ ...prev, [id]: "" }));
        setActiveReply(null);
        toast.success("Reply submitted successfully!");
      }
    } catch (error) {
      toast.error("Failed to submit reply!");
      console.error("Failed to submit reply:", error);
    }
  };

  const handleStartEdit = (id, reply, idx) => {
    setEditing({ id: id, idx, replyId: reply.reply_id });
    setEditDraft(reply.reply_text);
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    const { id, idx, replyId } = editing;

    const text = editDraft.trim();
    if (!text) return;

    setComments((prev) =>
      prev.map((c) =>
        c.comment_id === id
          ? {
              ...c,
              replies: (c.replies || []).map((r) =>
                r.reply_id === replyId ? { ...r, reply_text: text } : r
              ),
            }
          : c
      )
    );

    try {
      const response = await axios.put(
        `${BackendAPI}/comments/update-reply/${replyId}`,
        { reply_text: text },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 200) {
        setReplies((prev) => {
          const updated = { ...prev };
          if (updated[id]) {
            updated[id] = [...updated[id]];
            updated[id][idx] = response.data;
          }
          return updated;
        });
        setEditing(null);
        setEditDraft("");
        toast.success("Reply updated successfully");
      }
    } catch (error) {
      toast.error("Failed to update reply");
      console.error("Failed to save edit:", error);
    }
  };

  const handleDelete = async (id, idx) => {
    const reply = comments.find((c) => c.comment_id === id)?.replies?.[idx];
    if (!reply) return;
    const replyId = reply.reply_id;

    // optimistic UI: remove it immediately
    setComments((prev) =>
      prev.map((c) =>
        c.comment_id === id
          ? { ...c, replies: (c.replies || []).filter((_, i) => i !== idx) }
          : c
      )
    );

    try {
      await axios.delete(
        `${BackendAPI}/comments/delete-reply/${
          comments.find((c) => c.comment_id === id).replies[idx].reply_id
        }`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Reply deleted successfully");
    } catch (error) {
      toast.error("Failed to delete reply");
      console.error("Failed to delete reply:", error);
    }
  };

  const filteredComments = comments.filter(
    (c) =>
      c.username.toLowerCase().includes(search.toLowerCase()) ||
      c.course_title.toLowerCase().includes(search.toLowerCase()) ||
      c.comment_text.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-3xl font-bold text-gray-800">Comments</h3>
        <input
          type="text"
          placeholder="Search comments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 w-72 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
      </div>

      {/* Comments */}
      <div className="space-y-6">
        {filteredComments.map((c) => (
          <div
            key={c.comment_id}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-5 shadow-md border border-gray-100"
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full flex items-center justify-center text-white font-bold">
                {c.username.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800">{c.username}</p>
                    <p className="text-xs text-gray-500">
                      {c.course_title} •{" "}
                      {new Date(c.comment_date).toISOString().slice(0, 10)}
                    </p>
                  </div>
                </div>

                <p className="mt-2 text-gray-700">{c.comment_text}</p>

                <div className="flex items-center gap-4 mt-2">
                  {/* Toggle replies */}
                  <button
                    onClick={() =>
                      setVisibleReplies((prev) => ({
                        ...prev,
                        [c.comment_id]: !prev[c.comment_id],
                      }))
                    }
                    className="flex items-center gap-1 text-blue-600 text-sm font-medium hover:underline"
                  >
                    {visibleReplies[c.comment_id] ? (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 15l7-7 7 7"
                          />
                        </svg>
                        Hide Replies
                      </>
                    ) : (
                      <>
                        
                        Show Replies
                      </>
                    )}
                  </button>

                  {/* Reply button */}
                  <button
                    onClick={() => setActiveReply(c.comment_id)}
                    className="flex items-center gap-1 text-green-600 text-sm font-medium hover:underline"
                  >
                    
                    Reply
                  </button>
                </div>

                {activeReply === c.comment_id ? (
                  <div className="mt-2">
                    <textarea
                      rows="2"
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Write a reply..."
                      value={drafts[c.comment_id] || ""}
                      onChange={(e) =>
                        setDrafts({
                          ...drafts,
                          [c.comment_id]: e.target.value,
                        })
                      }
                    />
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => handleReplySubmit(c.comment_id)}
                        className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
                      >
                        Submit
                      </button>
                      <button
                        onClick={() => {
                          setActiveReply(null);
                          setDrafts((d) => ({ ...d, [c.id]: "" }));
                        }}
                        className="px-3 py-1 bg-gray-400 text-white rounded-md text-sm hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : null}

                <div className="mt-3 pl-2 border-l border-gray-200 space-y-3">
                  {visibleReplies[c.comment_id] &&
                    (c.replies || []).map((reply, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-50 rounded-md p-3 text-sm text-gray-700"
                      >
                        {editing &&
                        editing.id === c.comment_id &&
                        editing.idx === idx ? (
                          <div className="mt-2">
                            <textarea
                              rows="2"
                              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={editDraft}
                              onChange={(e) => setEditDraft(e.target.value)}
                            />
                            <div className="mt-2 flex gap-2">
                              <button
                                onClick={handleSaveEdit}
                                className="px-3 py-1 bg-green-500 text-white rounded-md text-sm hover:bg-green-600"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditing(null);
                                  setEditDraft("");
                                }}
                                className="px-3 py-1 bg-gray-400 text-white rounded-md text-sm hover:bg-gray-500"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="ml-4 mt-2 p-3 rounded-2xl bg-gray-50 shadow-sm border border-gray-200">
                              <p className="text-gray-800 text-sm leading-relaxed">
                                {reply.reply_text}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(reply.updated_at)
                                  .toISOString()
                                  .slice(0, 10)}
                              </p>

                              <div className="mt-2 flex gap-3">
                                <button
                                  onClick={() =>
                                    handleStartEdit(c.comment_id, reply, idx)
                                  }
                                  className="text-yellow-600 text-sm hover:underline"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() =>
                                    handleDelete(c.comment_id, idx)
                                  }
                                  className="text-red-600 text-sm hover:underline"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredComments.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            No comments found.
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentsReplies;
