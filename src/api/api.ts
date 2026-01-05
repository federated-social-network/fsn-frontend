import axios, { type AxiosInstance } from "axios";


/**
 * Returns an axios instance bound to the selected backend instance.
 * The instance base URL is chosen on the landing page and stored in localStorage.
 */
export const getApi = (): AxiosInstance => {
  const baseURL = localStorage.getItem("INSTANCE_BASE_URL");

  if (!baseURL) {
    throw new Error("No instance selected. Please choose an instance first.");
  }

  const api = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 8000,
  });

  // Optional: request interceptor (for future JWT support)
  api.interceptors.request.use(
    (config) => {
      // Support either key name so login can store `access_token` or `AUTH_TOKEN`.
      const token = localStorage.getItem("AUTH_TOKEN") || localStorage.getItem("access_token");
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Optional: response interceptor (global error handling)
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        console.warn("Unauthorized  possible invalid login");
      }
      return Promise.reject(error);
    }
  );

  return api;
};

// Convenience wrappers that use getApi() so callers don't need to create
// their own axios instances.
export const registerUser = (username: string, password: string) =>
  getApi().post("/register", null, { params: { username, password } });

export const loginUser = (username: string, password: string) =>
  getApi().post("/login", null, { params: { username, password } });

export const createPost = (
  content: string,
  username?: string,
  password?: string
) => {
  // Build query params. If credentials provided, also add an explicit
  // `Authorization: Basic <base64>` header — many FastAPI examples expect
  // the header in this exact format.
  const params: Record<string, string> = { content } as any;
  const headers: Record<string, string> = {};

  if (username) {
    // include username as a param for server-side attribution if useful
    params.username = username;
  }

  // Do not set Basic auth here. getApi() will attach a Bearer token
  // if one is present in localStorage (preferred server flow).
  return getApi().post("/posts", null, { params });
};

// Fetch posts from the instance. Returns an array of posts.
export const getPosts = (limit = 50) => {
  return getApi().get("/get_posts", { params: { limit } });
};

// Fetch user details. Try several common endpoint shapes to be robust
// across different instance implementations.
export const getUser = async (username: string) => {
  const api = getApi();
  const tries = [
    `/users/${encodeURIComponent(username)}`,
    `/user/${encodeURIComponent(username)}`,
    `/profile/${encodeURIComponent(username)}`,
    `/profiles/${encodeURIComponent(username)}`,
  ];

  let lastError: any = null;
  for (const path of tries) {
    try {
      const res = await api.get(path);
      return res;
    } catch (err) {
      lastError = err;
      // continue trying next path
    }
  }

  // if all failed, rethrow the last error for the caller to handle
  throw lastError;
};
