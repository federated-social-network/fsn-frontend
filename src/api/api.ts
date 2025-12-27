import axios from "axios";



const api = axios.create({
  baseURL: "https://fae94b14a276.ngrok-free.app",

});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const registerUser = (username: string, password: string) =>
  api.post("/register", null, {
    params: { username, password },
  });

export const loginUser = (username: string, password: string) =>
  api.post("/login", null, {
    params: { username, password },
  });

export const createPost = (content: string) =>
  api.post("/posts", null, {
    params: { content },
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });


export default api;
  