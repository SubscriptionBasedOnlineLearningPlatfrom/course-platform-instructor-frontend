import React, { createContext, useContext } from "react";
import axios from "axios";

// =======================
// PRIVATE API (with token)
// =======================
const api = axios.create({
  baseURL: "http://localhost:4000",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || "Something went wrong";
    return Promise.reject(new Error(message));
  }
);


// =======================
// API FUNCTIONS
// =======================
const getAllModules = async (courseId) => {
  const response = await api.get(`/instructor/modules/${courseId}`);
  return response.data;
};

const addModule = async (courseId, title) => {
  const response = await api.post(`/instructor/modules/${courseId}`, { title });
  return response.data;
};

const deleteModule = async (moduleId) => {
  const response = await api.delete(`/instructor/modules/${moduleId}`);
  return response.data;
};

const addChapter = async (moduleId, title) => {
  const response = await api.post(`/instructor/chapters/${moduleId}`, { lesson_title: title });
  return response.data;
};

const deleteChapter = async (lessonId) => {
  const response = await api.delete(`/instructor/chapters/${lessonId}`);
  return response.data;
};


// =======================
// FILE UPLOAD API
// =======================
const addVideo = async (lessonId, file) => {
  const formData = new FormData();
  formData.append("file", file); // key must be 'file'

  const response = await api.post(
    `/instructor/chapters/${lessonId}/video`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } } //ensures the actual file is sent, not just the file name
  );
  return response.data;
};

const addNote = async (lessonId, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post(
    `/instructor/chapters/${lessonId}/note`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data;
};

const addAssignment = async (lessonId, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post(
    `/instructor/chapters/${lessonId}/assignment`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data;
};


// resourse delete is not done?



// =======================
// CONTEXT
// =======================
const ApiContext = createContext({});

export const ApiProvider = ({ children }) => {
  const BackendAPI = "http://localhost:4000/instructor";

  return (
    <ApiContext.Provider
      value={{
        api,         
        BackendAPI,  // base URL
        getAllModules,
        addModule,
        deleteModule,
        addChapter,
        deleteChapter,
        addVideo,
        addNote,
        addAssignment,

      }}
    >
      {children}
    </ApiContext.Provider>
  );
};

// Hook for easy access
export const useApi = () => useContext(ApiContext);
